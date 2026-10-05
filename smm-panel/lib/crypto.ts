import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";

function scrypt(password: string, salt: Buffer, keylen: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, { N: 16384, r: 8, p: 1 }, (err, key) => (err ? reject(err) : resolve(key)))
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 32);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const newApiKey = () => randomBytes(16).toString("hex");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
