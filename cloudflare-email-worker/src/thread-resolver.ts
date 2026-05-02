export function normalizeSubject(subject: string): string {
  if (!subject) return '';
  return subject
    .replace(/^(Re|Fwd|Fw|Trả lời|Chuyển tiếp):\s*/gi, '')
    .replace(/^\[.*?\]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export async function hashThreadId(rootMessageId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rootMessageId);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
