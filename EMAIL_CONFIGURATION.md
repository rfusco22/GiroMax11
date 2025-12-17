# Configuración de Email para Giros Max

Este documento explica cómo configurar el servicio de correo electrónico para notificaciones, recuperación de contraseña y verificaciones.

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env` o en las variables de entorno de Vercel:

```env
EMAIL_USER=usuarioyourbusinesshouse@gmail.com
EMAIL_PASSWORD=ipelfficqccnbtkq
EMAIL_FROM=Your Business House
```

### Descripción de Variables

- **EMAIL_USER**: La dirección de correo de Gmail que enviará los emails
- **EMAIL_PASSWORD**: Contraseña de aplicación de Gmail (no es la contraseña normal)
- **EMAIL_FROM**: Nombre que aparecerá como remitente en los emails

## Configuración de Gmail

### 1. Habilitar Verificación en Dos Pasos

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Navega a "Seguridad"
3. Activa "Verificación en dos pasos"

### 2. Generar Contraseña de Aplicación

1. En "Seguridad", busca "Contraseñas de aplicaciones"
2. Selecciona "Correo" y el dispositivo que usas
3. Google generará una contraseña de 16 caracteres
4. Usa esta contraseña en `EMAIL_PASSWORD` (sin espacios)

## Uso en la Aplicación

### Recuperación de Contraseña

El sistema enviará automáticamente emails cuando un usuario solicite recuperar su contraseña desde `/recuperar`.

### Notificaciones de KYC

Se envían emails automáticos cuando:
- Un usuario completa su verificación KYC (pendiente de aprobación)
- La gerencia aprueba una verificación
- La gerencia rechaza una verificación con motivo

### Notificaciones de Transacciones

Se notifica por email cuando:
- Se crea una nueva transacción
- Cambia el estado de una transacción

## Configuración en Railway

1. Ve a tu proyecto en Railway
2. Selecciona "Variables"
3. Agrega las tres variables de entorno:
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`

## Configuración en Vercel

1. Ve a tu proyecto en Vercel
2. Navega a "Settings" > "Environment Variables"
3. Agrega las tres variables para todos los entornos (Production, Preview, Development)

## Límites de Envío

Gmail tiene límites de envío para cuentas gratuitas:
- **500 emails por día** para cuentas normales
- **2000 emails por día** para Google Workspace

Si necesitas enviar más emails, considera usar servicios como:
- SendGrid
- AWS SES
- Mailgun
- Resend

## Solución de Problemas

### Error: "Invalid login credentials"
- Verifica que hayas habilitado la verificación en dos pasos
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal
- La contraseña no debe contener espacios

### Los emails no llegan
- Revisa la carpeta de spam
- Verifica que el EMAIL_FROM esté correctamente configurado
- Comprueba los logs de la aplicación para errores

### Error: "Daily sending quota exceeded"
- Has alcanzado el límite de 500 emails por día
- Espera 24 horas o considera migrar a un servicio de email profesional

## Código de Ejemplo

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: user.email,
  subject: 'Recuperación de Contraseña',
  html: `<p>Hola ${user.nombre}, aquí están tus instrucciones...</p>`,
});
```

## Próximos Pasos

Una vez configurado el email, el sistema podrá:
1. Enviar enlaces de recuperación de contraseña
2. Notificar cambios en el estado de verificación KYC
3. Enviar actualizaciones de transacciones
4. Enviar alertas de seguridad

Para implementar el envío de emails, necesitarás instalar `nodemailer`:

```bash
npm install nodemailer @types/nodemailer
