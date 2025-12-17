# Configuración de Google OAuth

## Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Navega a "APIs y Servicios" > "Credenciales"

## Paso 2: Configurar Pantalla de Consentimiento OAuth

1. Ve a "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" como tipo de usuario
3. Completa la información requerida:
   - Nombre de la aplicación: "Giros Max"
   - Correo electrónico de asistencia
   - Logo (opcional)
4. Agrega los scopes necesarios:
   - `userinfo.email`
   - `userinfo.profile`
5. Guarda y continúa

## Paso 3: Crear Credenciales OAuth 2.0

1. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente de OAuth 2.0"
2. Tipo de aplicación: "Aplicación web"
3. Nombre: "Giros Max Web Client"
4. URIs de origen autorizados:
   - `http://localhost:3000` (desarrollo)
   - `https://giromax1-production.up.railway.app` (producción)
5. URIs de redireccionamiento autorizados:
   - `http://localhost:3000/api/auth/google/callback` (desarrollo)
   - `https://giromax1-production.up.railway.app/api/auth/google/callback` (producción)
6. Haz clic en "Crear"

## Paso 4: Copiar Credenciales

Después de crear las credenciales, verás:
- **ID de cliente**: Copia este valor
- **Secreto de cliente**: Copia este valor

## Paso 5: Agregar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env` en Railway:

```env
GOOGLE_CLIENT_ID="tu_client_id_aqui"
GOOGLE_CLIENT_SECRET="tu_client_secret_aqui"
```

## Paso 6: Reiniciar Aplicación

Después de agregar las variables de entorno en Railway, reinicia tu aplicación para que los cambios surtan efecto.

## Verificación

Una vez configurado, el botón "Google" en la página de login redirigirá automáticamente al selector de cuentas de Google para iniciar sesión.
```

```typescript file="" isHidden
