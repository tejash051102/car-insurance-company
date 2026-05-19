import crypto from "crypto";

const PREFIX = "enc:v1:";
const keySource = process.env.FIELD_ENCRYPTION_KEY || process.env.JWT_SECRET || "insurance-management-demo-key";
const key = crypto.createHash("sha256").update(keySource).digest();

export const encryptField = (value) => {
  if (value === undefined || value === null || value === "") {
    return value;
  }

  const text = String(value);
  if (text.startsWith(PREFIX)) {
    return text;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

export const decryptField = (value) => {
  if (!value || typeof value !== "string" || !value.startsWith(PREFIX)) {
    return value;
  }

  try {
    const [ivText, tagText, encryptedText] = value.slice(PREFIX.length).split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64"));
    decipher.setAuthTag(Buffer.from(tagText, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64")),
      decipher.final()
    ]).toString("utf8");
  } catch {
    return "[encrypted]";
  }
};

export const encryptedString = (extra = {}) => ({
  type: String,
  trim: true,
  set: encryptField,
  get: decryptField,
  ...extra
});
