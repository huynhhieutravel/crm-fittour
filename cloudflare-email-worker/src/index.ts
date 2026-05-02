import PostalMime from 'postal-mime';
import { EmailMessage } from 'cloudflare:email';
import { Env, InboundMessage, OutboundMessage } from './types';
import { normalizeSubject, hashThreadId } from './thread-resolver';
import { sendWebhook } from './webhook-security';

export default {
  // 1. Nhận Email (Inbound) từ Cloudflare Email Routing
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    try {
      const rawEmail = await new Response(message.raw).text();
      const parser = new PostalMime();
      const parsed = await parser.parse(rawEmail);

      const normalized_subject = normalizeSubject(parsed.subject || '');
      const references = parsed.references || '';
      const inReplyTo = parsed.inReplyTo || '';
      
      let thread_id = '';
      if (references) {
        const firstRef = references.split(/\s+/)[0];
        thread_id = await hashThreadId(firstRef);
      } else if (inReplyTo) {
        thread_id = await hashThreadId(inReplyTo);
      } else {
        thread_id = await hashThreadId(parsed.messageId || message.headers.get('Message-ID') || Date.now().toString());
      }

      // Upload attachments to R2
      const attachments = [];
      for (const att of parsed.attachments) {
        const key = `attachments/${Date.now()}-${Math.random().toString(36).substring(7)}-${att.filename}`;
        await env.BUCKET.put(key, att.content, {
          httpMetadata: { contentType: att.mimeType }
        });
        attachments.push({
          filename: att.filename,
          mimetype: att.mimeType,
          size: att.content.byteLength,
          content_id: att.contentId || null,
          r2_key: key,
          disposition: 'attachment'
        });
      }

      // Payload KHỚP với backend emailController.incomingWebhook
      const messageId = parsed.messageId || message.headers.get('Message-ID') || '';
      const payload = {
        mailbox_address: message.to,
        subject: parsed.subject || '',
        sender: message.from,
        recipient: message.to,
        cc: '',
        bcc: '',
        body: parsed.html || '',
        body_text: parsed.text || '',
        message_id: messageId,
        in_reply_to: inReplyTo,
        email_references: references ? references.split(/\s+/) : [],
        thread_id,
        normalized_subject,
        raw_headers: JSON.stringify(parsed.headers || []),
        attachments,
        idempotency_key: messageId || `cf-${Date.now()}`
      };

      await sendWebhook(env.CRM_WEBHOOK_URL, payload, env.CRM_WEBHOOK_SECRET);
    } catch (error) {
      console.error("Error processing inbound email:", error);
      message.setReject("Failed to process email");
    }
  },

  // 2. Gửi Email (Outbound) - Nhận HTTP POST từ VPS CRM
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const authHeader = request.headers.get('Authorization');
    if (env.CRM_WEBHOOK_SECRET && authHeader !== `Bearer ${env.CRM_WEBHOOK_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      const { createMimeMessage } = await import('mimetext');
      const data: OutboundMessage = await request.json();
      
      const msg = createMimeMessage();
      msg.setSender(data.from);
      msg.setRecipient(data.to);
      msg.setSubject(data.subject);
      msg.addMessage({ contentType: 'text/html', data: data.body });

      if (data.inReplyTo) {
        msg.setHeader('In-Reply-To', data.inReplyTo);
      }
      if (data.references) {
        msg.setHeader('References', data.references);
      }

      const rawMime = msg.asRaw();
      const emailMessage = new EmailMessage(
        data.from,
        data.to,
        rawMime
      );
      
      await env.EMAIL.send(emailMessage);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
      console.error("Error processing outbound:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
  }
};
