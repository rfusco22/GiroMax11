#!/usr/bin/env node

const crypto = require("crypto")

console.log("\n🔐 Generador de Secretos para GiroMax\n")
console.log("═".repeat(60))

// Generar SESSION_SECRET
const sessionSecret = crypto.randomBytes(32).toString("base64")

console.log("\n📝 SESSION_SECRET (para cookies y JWT):")
console.log("─".repeat(60))
console.log(sessionSecret)

// Generar otros secretos útiles
const encryptionKey = crypto.randomBytes(32).toString("hex")

console.log("\n🔑 ENCRYPTION_KEY (para encriptar datos sensibles):")
console.log("─".repeat(60))
console.log(encryptionKey)

// Generar API Key para webhooks
const apiKey = crypto.randomBytes(24).toString("base64url")

console.log("\n🌐 API_KEY (para webhooks y APIs internas):")
console.log("─".repeat(60))
console.log(apiKey)

console.log("\n═".repeat(60))
console.log("\n✅ Secretos generados exitosamente!\n")
console.log("📋 Copia estos valores a tu archivo .env o Railway:\n")
console.log(`SESSION_SECRET=${sessionSecret}`)
console.log(`ENCRYPTION_KEY=${encryptionKey}`)
console.log(`API_KEY=${apiKey}`)
console.log("\n⚠️  IMPORTANTE: Guarda estos secretos de forma segura.")
console.log("⚠️  No los compartas ni los subas a repositorios públicos.\n")
