import PostalMime from 'postal-mime';
import { EmailMessage } from 'cloudflare:email';
import { Env, InboundMessage, OutboundMessage } from './types';
import { normalizeSubject, hashThreadId } from './thread-resolver';
import { sendWebhook } from './webhook-security';

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    const rawEmail = await new Response(message.raw).text();
    const inboundMsg: InboundMessage = {
      rawEmail,
      from: message.from,
      to: message.to,
      subject: message.headers.get('subject') || '',
      messageId: message.headers.get('Message-ID') || '',
      timestamp: Date.now()
    };

    await env.INBOUND_QUEUE.send(inboundMsg);
  },

  async queue(batch: MessageBatch<any>, env: Env, ctx: ExecutionContext) {
    if (batch.queue === 'fittour-inbound-emails') {
      for (const message of batch.messages) {
        try {
          const data = message.body as InboundMessage;
          const parser = new PostalMime();
          const parsed = await parser.parse(data.rawEmail);

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
            thread_id = await hashThreadId(parsed.messageId || data.messageId || Date.now().toString());
          }

          const attachments = [];
          for (const att of parsed.attachments) {
            const key = `attachments/${Date.now()}-${Math.random().toString(36).substring(7)}-${att.filename}`;
            await env.BUCKET.put(key, att.content, {
              httpMetadata: { contentType: att.mimeType }
            });
            attachments.push({
              filename: att.filename,
              mimeType: att.mimeType,
              size: att.content.byteLength,
              contentId: att.contentId,
              r2Key: key
            });
          }

          const payload = {
            from: data.from,
            to: data.to,
            subject: parsed.subject,
            normalized_subject,
            bodyHtml: parsed.html || '',
            bodyText: parsed.text || '',
            messageId: parsed.messageId || data.messageId,
            inReplyTo,
            references,
            thread_id,
            attachments,
            headers: parsed.headers
          };

          await sendWebhook(env.CRM_WEBHOOK_URL, payload, env.CRM_WEBHOOK_SECRET);
          message.ack();
        } catch (error) {
          console.error("Error processing inbound:", error);
          message.retry();
        }
      }
    } else if (batch.queue === 'fittour-outbound-emails') {
      const { createMimeMessage } = await import('mimetext');
      for (const message of batch.messages) {
        try {
          const data = message.body as OutboundMessage;
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
          // Create EmailMessage based on standard cloudflare type (requires constructing from EmailMessage)
          const emailMessage = new EmailMessage(
            data.from,
            data.to,
            rawMime
          );
          
          await env.EMAIL.send(emailMessage);
          message.ack();
        } catch (error) {
          console.error("Error processing outbound:", error);
          message.retry();
        }
      }
    }
  }
};
