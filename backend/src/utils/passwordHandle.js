// this utils function utilize the standard Web-Api : SubtleCrypto and TextEncoder

import "dotenv/config";

export async function getKey() {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(process.env.SECRET_KEY);
    return await crypto.subtle.importKey(
        "raw",
        keyData,
        {name : "HMAC" , hash : "SHA-256"},
        false,
        ["sign","verify"]
    );
}

export async function hashPassword(password , salt) {
    const key = await getKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashbuffer = await crypto.subtle.sign("HMAC",key,data);
    return Buffer.from(hashbuffer).toString("hex");
}

export async function validatePassword(password,salt,hashed_password) {
    const hashed_input = await hashPassword(password,salt);
    return hashed_input === hashed_password;
}

export function generateRandomSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 16-byte salt
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    return saltHex
}