/**
 * Sudipta E-Scooty ERP Platform
 * Standard TOTP (Google Authenticator) Helper Library
 * Uses native secure Web Crypto API for ISO-27001/SOC-2 level client-side verification
 */

export function base32ToBytes(base32: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = base32.toUpperCase().replace(/[\s-=]/g, "");
  const length = clean.length;
  const bytes = new Uint8Array(Math.floor((length * 5) / 8));
  let val = 0;
  let count = 0;
  let index = 0;

  for (let i = 0; i < length; i++) {
    const char = clean[i];
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    val = (val << 5) | idx;
    count += 5;
    if (count >= 8) {
      bytes[index++] = (val >>> (count - 8)) & 0xff;
      count -= 8;
    }
  }
  return bytes;
}

export function generateSecret(length = 16): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += alphabet[bytes[i] % alphabet.length];
  }
  return secret;
}

export function getTOTPUri(secret: string, label: string, issuer: string): string {
  const encodedLabel = encodeURIComponent(label);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export async function generateTOTPForCounter(secretBase32: string, counter: number): Promise<string> {
  const keyBytes = base32ToBytes(secretBase32);
  
  // Convert 64-bit counter index into 8-byte big-endian format
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  // Import key for HMAC-SHA1
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"]
  );

  // Sign counter bytes with imported key
  const signatureBuffer = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    counterBytes
  );

  const hmacBytes = new Uint8Array(signatureBuffer);

  // Dynamic truncation (RFC 4226)
  const offset = hmacBytes[hmacBytes.length - 1] & 0xf;
  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString();
  return otp.padStart(6, "0");
}

export async function verifyTOTP(secretBase32: string, code: string): Promise<boolean> {
  const cleanCode = code.replace(/\s/g, "");
  if (cleanCode.length !== 6 || isNaN(Number(cleanCode))) {
    return false;
  }

  const epoch = Math.floor(Date.now() / 1000);
  const currentCounter = Math.floor(epoch / 30);

  // Multi-step window tolerance checks (-1, 0, +1 time steps of 30 seconds)
  // Ensures user keys register properly despite minor local phone/device clock skew.
  for (let drift = -1; drift <= 1; drift++) {
    try {
      const calculatedOtp = await generateTOTPForCounter(secretBase32, currentCounter + drift);
      if (calculatedOtp === cleanCode) {
        return true;
      }
    } catch (err) {
      console.error("[TOTP VERIFIER] Cryptographic hash calculation error:", err);
    }
  }

  return false;
}
