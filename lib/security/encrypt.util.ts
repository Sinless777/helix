// lib/security/encrypt.util.ts
// AES-GCM helpers for client-side encryption/decryption. These utilities rely
// on the Web Crypto API which is available in modern browsers and Node >=18.

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
export const AES_IV_LENGTH = 12
const AES_ALGORITHM = 'AES-GCM'

function ensureCrypto(): Crypto {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto API is unavailable in the current environment')
  }
  return globalThis.crypto
}

export function encodeBase64(bytes: Uint8Array): string {
  if (typeof btoa !== 'undefined') {
    let binary = ''
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]!)
    }
    return btoa(binary)
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  throw new Error('No base64 encoder available in this environment')
}

export function decodeBase64(value: string): Uint8Array {
  if (typeof atob !== 'undefined') {
    const binary = atob(value)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      out[i] = binary.charCodeAt(i)
    }
    return out
  }
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'))
  }
  throw new Error('No base64 decoder available in this environment')
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  if (!secret) {
    throw new Error('Missing profile encryption key')
  }
  const crypto = ensureCrypto()
  const material = textEncoder.encode(secret)
  const hash = await crypto.subtle.digest('SHA-256', material)
  return crypto.subtle.importKey('raw', hash, { name: AES_ALGORITHM }, false, ['encrypt', 'decrypt'])
}

export async function encryptJson<T>(
  data: T,
  secret: string,
): Promise<{ ciphertext: string; iv: string }> {
  const crypto = ensureCrypto()
  const key = await deriveKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH))
  const plaintext = textEncoder.encode(JSON.stringify(data))
  const encryptedBuffer = await crypto.subtle.encrypt({ name: AES_ALGORITHM, iv }, key, plaintext)
  const encryptedBytes = new Uint8Array(encryptedBuffer)
  return { ciphertext: encodeBase64(encryptedBytes), iv: encodeBase64(iv) }
}

export async function decryptJson<T>(
  ciphertext: string,
  iv: string,
  secret: string,
): Promise<T> {
  const crypto = ensureCrypto()
  const key = await deriveKey(secret)
  const cipherBytes = decodeBase64(ciphertext)
  const ivBytes = decodeBase64(iv)
  // Create new Uint8Array views so their underlying .buffer is a plain ArrayBuffer
  const cipherView = new Uint8Array(cipherBytes)
  const ivView = new Uint8Array(ivBytes)
  const plainBuffer = await crypto.subtle.decrypt({ name: AES_ALGORITHM, iv: ivView }, key, cipherView)
  return JSON.parse(textDecoder.decode(plainBuffer)) as T
}
