# Configuración de Railway MySQL y Vercel Blob para GiroMax

Esta guía explica cómo configurar las variables de entorno para tu proyecto GiroMax desplegado en Railway con MySQL y Vercel Blob para almacenamiento de documentos.

## 1. Configuración de MySQL en Railway

Ya tienes una base de datos MySQL configurada en Railway. Aquí están tus credenciales:

```env
DB_HOST=switchyard.proxy.rlwy.net
DB_NAME=yourbusi_ybh
DB_USER=giros
DB_PASSWORD=ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR
DB_PORT=43872
```

### Configurar Variables de Entorno en Railway

1. Ve a tu proyecto en Railway: https://railway.app
2. Selecciona tu servicio (GiroMax)
3. Ve a la pestaña **Variables**
4. Agrega las siguientes variables:

```
DB_HOST=switchyard.proxy.rlwy.net
DB_NAME=yourbusi_ybh
DB_USER=giros
DB_PASSWORD=ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR
DB_PORT=43872
DATABASE_URL=mysql://giros:ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR@switchyard.proxy.rlwy.net:43872/yourbusi_ybh
NEXT_PUBLIC_APP_URL=https://giromax1-production.up.railway.app
SESSION_SECRET=<genera_uno_aleatorio>
```

### Generar SESSION_SECRET

Ejecuta este comando en tu terminal local:
```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como valor para `SESSION_SECRET`.

## 2. Configuración de Vercel Blob Storage

Vercel Blob es el servicio de almacenamiento para subir documentos KYC (selfies, documentos de identidad, etc.).

### Paso 1: Crear un Blob Store en Vercel

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en **Create Database**
4. Selecciona **Blob** (Almacenamiento de archivos)
5. Dale un nombre como `giromax-documents`
6. Selecciona la región más cercana a tus usuarios (ej: `iad1` para US East)
7. Haz clic en **Create**

### Paso 2: Obtener el Token de Blob

Después de crear el Blob Store:

1. Ve a la pestaña **Settings** de tu Blob Store
2. En la sección **Access Tokens**, copia el token que se ve así:
   ```
   vercel_blob_rw_XXXXXXXXXXXXXXXX_YYYYYYYYYYYYYYYY
   ```
3. Este es tu `BLOB_READ_WRITE_TOKEN`

### Paso 3: Conectar Blob a tu Proyecto de Vercel (Opcional)

Si despliegas también en Vercel para preview/producción:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Storage**
3. Haz clic en **Connect Store**
4. Selecciona el Blob Store que creaste
5. Esto agregará automáticamente las variables de entorno necesarias

### Paso 4: Agregar Token a Railway

Vuelve a Railway y agrega estas variables adicionales:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXX_YYYYYYYYYYYYYYYY
BLOB_STORAGE_PROVIDER=vercel-blob
```

## 3. Configuración de Email

Ya tienes configurado Gmail SMTP. Agrega estas variables en Railway:

```
EMAIL_USER=usuarioyourbusinesshouse@gmail.com
EMAIL_PASSWORD=ipelfficqccnbtkq
EMAIL_FROM=Your Business House
```

## 4. Configuración de SMS/WhatsApp (Opcional)

Para verificación de teléfono con Twilio:

1. Crea una cuenta en Twilio: https://www.twilio.com/
2. Obtén tus credenciales del dashboard
3. Agrega las variables en Railway:

```
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

**Nota:** Si no configuras Twilio, el sistema usará un modo de desarrollo que simula el envío de SMS.

## 5. Ejecutar Scripts de Base de Datos

Una vez configuradas las variables, necesitas ejecutar los scripts SQL para crear las tablas:

### Opción A: Desde Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar scripts
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -p yourbusi_ybh < scripts/01_create_database.sql
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -p yourbusi_ybh < scripts/07_create_kyc_verification.sql
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -p yourbusi_ybh < scripts/08_create_gerencia_user.sql
```

Cuando te pida la contraseña, usa: `ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR`

### Opción B: Usar un Cliente MySQL

1. Descarga MySQL Workbench o DBeaver
2. Crea una nueva conexión con estos datos:
   - Host: `switchyard.proxy.rlwy.net`
   - Port: `43872`
   - Usuario: `giros`
   - Contraseña: `ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR`
   - Base de datos: `yourbusi_ybh`
3. Ejecuta los scripts SQL en orden:
   - `01_create_database.sql`
   - `02_seed_initial_data.sql`
   - `03_create_indexes_and_constraints.sql`
   - `07_create_kyc_verification.sql`
   - `08_create_gerencia_user.sql`

## 6. Verificar la Configuración

Para verificar que todo está configurado correctamente:

1. Despliega tu aplicación en Railway
2. Visita: https://giromax1-production.up.railway.app
3. Intenta crear una cuenta
4. Intenta subir un documento (esto probará Vercel Blob)
5. Revisa los logs en Railway para cualquier error

## 7. Costos Estimados

- **Railway MySQL**: ~$5-10/mes (según uso)
- **Vercel Blob**: 
  - Gratis: 1GB de almacenamiento, 100GB de transferencia
  - Pro: $0.15/GB almacenamiento, $0.30/GB transferencia
- **Twilio SMS**: ~$0.0075 por mensaje

## 8. Troubleshooting

### Error: "Cannot connect to database"
- Verifica que las credenciales sean correctas
- Asegúrate de que el puerto 43872 esté correcto
- Railway puede cambiar las credenciales si reinicias el servicio

### Error: "BLOB_READ_WRITE_TOKEN is not defined"
- Verifica que agregaste el token en las variables de entorno
- El token debe empezar con `vercel_blob_rw_`

### Los documentos no se suben
- Revisa que `BLOB_STORAGE_PROVIDER=vercel-blob` esté configurado
- Verifica el token de Blob en Vercel Dashboard
- Revisa los logs de Railway para ver errores específicos

## 9. Backup de Base de Datos

Railway hace backups automáticos, pero puedes hacer backups manuales:

```bash
mysqldump -h switchyard.proxy.rlwy.net -P 43872 -u giros -p yourbusi_ybh > backup.sql
```

## 10. Próximos Pasos

1. ✅ Configurar variables de entorno en Railway
2. ✅ Crear Vercel Blob Store y obtener token
3. ✅ Ejecutar scripts SQL en la base de datos
4. ✅ Desplegar aplicación
5. ⬜ Configurar dominio personalizado (opcional)
6. ⬜ Configurar Twilio para SMS (opcional)
7. ⬜ Monitorear logs y errores

---

¿Necesitas ayuda? Revisa los logs en Railway o contacta al equipo de desarrollo.
```

```typescript file="" isHidden
