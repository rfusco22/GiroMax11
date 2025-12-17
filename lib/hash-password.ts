// Utilidad para generar hashes de contraseñas para usuarios de gerencia
// Ejecutar este archivo con Node.js para generar el hash de una contraseña

import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Si se ejecuta directamente desde la línea de comandos
if (require.main === module) {
  const password = process.argv[2] || "admin123"

  hashPassword(password)
    .then((hash) => {
      console.log("\n=================================")
      console.log("Password Hash Generator")
      console.log("=================================")
      console.log(`Original password: ${password}`)
      console.log(`Hashed password: ${hash}`)
      console.log("\nCopia este hash en el script SQL 08_create_gerencia_user.sql")
      console.log("=================================\n")
    })
    .catch((error) => {
      console.error("Error generating hash:", error)
    })
}
