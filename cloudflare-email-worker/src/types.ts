export interface Env {
  DOMAINS: string;
  CRM_WEBHOOK_URL: string;
  CRM_WEBHOOK_SECRET?: string; // Set this via wrangler secret put
  BUCKET: R2Bucket;
  INBOUND_QUEUE: Queue<InboundMessage>;
  OUTBOUND_QUEUE: Queue<OutboundMessage>;
  EMAIL: SendEmail;
}

export interface InboundMessage {
  rawEmail: string;
  from: string;
  to: string;
  subject: string;
  messageId: string;
  timestamp: number;
}

export interface OutboundMessage {
  id: string; // db id for update
  from: string;
  to: string;
  subject: string;
  body: string; // html body
  inReplyTo?: string;
  references?: string;
}
