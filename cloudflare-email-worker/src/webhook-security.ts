export async function generateHmacSignature(payload: string, secret: string, timestamp: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = encoder.encode(`${timestamp}.${payload}`);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sendWebhook(url: string, payload: any, secret?: string) {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (secret) {
    // Timestamp tính bằng GIÂY (khớp với backend)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await generateHmacSignature(body, secret, timestamp);
    // Header name khớp với backend (Express tự lowercase)
    headers['X-Webhook-Signature'] = signature;
    headers['X-Webhook-Timestamp'] = timestamp;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}: ${await response.text()}`);
  }
}
