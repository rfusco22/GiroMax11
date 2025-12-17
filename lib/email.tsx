import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("Email credentials not configured")
    return {
      success: false,
      error: "La configuración de correo electrónico no está completa. Contacta al administrador.",
    }
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/restablecer?token=${resetToken}`

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM || "Giros Max"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperar contraseña - Giros Max",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #121A56 0%, #1a2570 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .logo { font-size: 32px; font-weight: bold; color: #DB530F; font-style: italic; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #DB530F; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">GIROS MAX</div>
                <h2 style="margin: 10px 0 0 0;">Recuperar Contraseña</h2>
              </div>
              <div class="content">
                <p>Hola${name ? ` ${name}` : ""},</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Giros Max.</p>
                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                <center>
                  <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                </center>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="background: white; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px;">
                  ${resetUrl}
                </p>
                <div class="warning">
                  <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad.
                </div>
                <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.</p>
                <p>Saludos,<br><strong>El equipo de Giros Max</strong></p>
              </div>
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; ${new Date().getFullYear()} Giros Max. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log("Email sent successfully. Message ID:", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    let errorMessage = "Error al enviar el correo electrónico"

    if (error instanceof Error) {
      if (error.message.includes("Invalid login")) {
        errorMessage = "Credenciales de correo inválidas. Verifica EMAIL_USER y EMAIL_PASSWORD."
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "No se pudo conectar al servidor de correo."
      } else if (error.message.includes("ETIMEDOUT")) {
        errorMessage = "Tiempo de espera agotado al conectar con el servidor de correo."
      }
      console.error("Email error:", error.message)
    }

    return { success: false, error: errorMessage }
  }
}

export async function sendVerificationEmail(email: string, verificationCode: string) {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM || "Giros Max"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verificación de cuenta - Giros Max",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #121A56 0%, #1a2570 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .logo { font-size: 32px; font-weight: bold; color: #DB530F; font-style: italic; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .code { background: white; border: 2px dashed #DB530F; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #121A56; margin: 20px 0; border-radius: 8px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">GIROS MAX</div>
                <h2 style="margin: 10px 0 0 0;">Verificación de Cuenta</h2>
              </div>
              <div class="content">
                <p>Hola,</p>
                <p>Gracias por registrarte en Giros Max. Para completar tu registro, necesitamos verificar tu correo electrónico.</p>
                <p>Tu código de verificación es:</p>
                <div class="code">${verificationCode}</div>
                <p><strong>Este código expirará en 15 minutos.</strong></p>
                <p>Si no creaste una cuenta en Giros Max, puedes ignorar este correo.</p>
                <p>Saludos,<br><strong>El equipo de Giros Max</strong></p>
              </div>
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; ${new Date().getFullYear()} Giros Max. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error: "Error al enviar el correo electrónico" }
  }
}
