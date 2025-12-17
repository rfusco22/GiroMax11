# Guía de Despliegue Completo - GiroMax

Esta guía te llevará paso a paso para desplegar tu aplicación GiroMax en Railway con MySQL y Vercel Blob.

## Resumen de Servicios

| Servicio | Propósito | Costo Estimado |
|----------|-----------|----------------|
| **Railway** | Hosting de aplicación y base de datos MySQL | $5-20/mes |
| **Vercel Blob** | Almacenamiento de documentos KYC | Gratis hasta 1GB |
| **Gmail SMTP** | Envío de emails | Gratis |
| **Twilio** (Opcional) | SMS/WhatsApp verificación | $0.0075/mensaje |

---

## Parte 1: Configurar Base de Datos en Railway

### 1.1 Verificar Conexión

Ya tienes una base de datos MySQL en Railway con estas credenciales:

```
Host: switchyard.proxy.rlwy.net
Puerto: 43872
Usuario: giros
Contraseña: ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR
Base de datos: yourbusi_ybh
```

### 1.2 Ejecutar Scripts SQL

Necesitas ejecutar los scripts en orden para crear todas las tablas:

**Opción A: Usar Railway CLI (Recomendado)**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Iniciar sesión
railway login

# Vincular a tu proyecto
railway link

# Ejecutar scripts en orden
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -pyourbusi_ybh < scripts/01_create_database.sql
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -pyourbusi_ybh < scripts/02_seed_initial_data.sql
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -pyourbusi_ybh < scripts/03_create_indexes_and_constraints.sql
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -pyourbusi_ybh < scripts/07_create_kyc_verification.sql
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -pyourbusi_ybh < scripts/08_create_gerencia_user.sql
```

**Opción B: Usar Cliente MySQL (MySQL Workbench, DBeaver, etc.)**

1. Descarga e instala [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) o [DBeaver](https://dbeaver.io/)
2. Crea una nueva conexión:
   - Host: `switchyard.proxy.rlwy.net`
   - Puerto: `43872`
   - Usuario: `giros`
   - Contraseña: `ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR`
   - Base de datos: `yourbusi_ybh`
3. Abre y ejecuta cada archivo SQL en orden desde la carpeta `scripts/`

### 1.3 Verificar Tablas Creadas

Ejecuta este query para verificar:

```sql
SHOW TABLES;
```

Deberías ver:
- users
- sessions
- currency_margins
- transactions
- user_bank_accounts
- wallets
- notifications
- audit_log
- system_config
- admin_country_assignments
- kyc_verifications
- kyc_verification_history
- phone_verification_logs

---

## Parte 2: Configurar Vercel Blob

### 2.1 Crear Blob Store

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en **Create Database**
4. Selecciona **Blob**
5. Nombre: `giromax-documents`
6. Región: Elige la más cercana (ej: `iad1` para US East)
7. Haz clic en **Create**

### 2.2 Obtener Token

1. Una vez creado, ve a la pestaña **Settings**
2. Copia el **Read/Write Token** que se ve así:
   ```
   vercel_blob_rw_XXXXXXXXXXXXXXXX_YYYYYYYYYYYYYYYY
   ```
3. Guarda este token, lo necesitarás en el siguiente paso

---

## Parte 3: Configurar Variables de Entorno en Railway

### 3.1 Ir a Variables de Entorno

1. Ve a [Railway](https://railway.app)
2. Selecciona tu proyecto **GiroMax**
3. Haz clic en tu servicio
4. Ve a la pestaña **Variables**

### 3.2 Agregar Todas las Variables

Agrega cada una de estas variables (clic en **New Variable** para cada una):

```env
# Base de Datos MySQL
DB_HOST=switchyard.proxy.rlwy.net
DB_NAME=yourbusi_ybh
DB_USER=giros
DB_PASSWORD=ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR
DB_PORT=43872
DATABASE_URL=mysql://giros:ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR@switchyard.proxy.rlwy.net:43872/yourbusi_ybh

# Email (Gmail)
EMAIL_USER=usuarioyourbusinesshouse@gmail.com
EMAIL_PASSWORD=ipelfficqccnbtkq
EMAIL_FROM=Your Business House

# Vercel Blob (pega tu token aquí)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXX_YYYYYYYYYYYYYYYY
BLOB_STORAGE_PROVIDER=vercel-blob

# URLs de la Aplicación
NEXT_PUBLIC_APP_URL=https://giromax1-production.up.railway.app

# Seguridad (genera uno nuevo)
SESSION_SECRET=<GENERA_UNO_NUEVO>
```

### 3.3 Generar SESSION_SECRET

Abre tu terminal y ejecuta:

```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como `SESSION_SECRET`.

### 3.4 Opcional: Twilio para SMS

Si quieres habilitar verificación por SMS/WhatsApp:

```env
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

**Nota:** Si no configuras Twilio, el sistema usará un modo mock que simula el envío.

---

## Parte 4: Desplegar en Railway

### 4.1 Verificar Configuración

1. Ve a la pestaña **Settings** de tu servicio
2. Verifica que:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (raíz)

### 4.2 Desplegar

1. Haz un commit y push a tu repositorio:
   ```bash
   git add .
   git commit -m "Configure environment variables"
   git push
   ```

2. Railway detectará el push y desplegará automáticamente

3. Monitorea el despliegue en la pestaña **Deployments**

### 4.3 Verificar Despliegue

Una vez completado:

1. Haz clic en el dominio: `https://giromax1-production.up.railway.app`
2. Deberías ver la página de inicio de GiroMax
3. Intenta crear una cuenta para probar

---

## Parte 5: Crear Usuario Gerencia

### 5.1 Generar Hash de Contraseña

Ejecuta el script Node.js para generar el hash:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('TuContraseñaSegura', 10));"
```

### 5.2 Ejecutar Script de Gerencia

Edita `scripts/08_create_gerencia_user.sql` con tu email y hash:

```sql
-- Cambiar estos valores
SET @email = 'admin@girosmax.com';
SET @password_hash = '<TU_HASH_AQUI>';
SET @name = 'Administrador General';
```

Luego ejecuta:

```bash
railway run mysql -h switchyard.proxy.rlwy.net -P 43872 -u giros -pyourbusi_ybh < scripts/08_create_gerencia_user.sql
```

### 5.3 Iniciar Sesión como Gerencia

1. Ve a `https://giromax1-production.up.railway.app/login`
2. Usa las credenciales que configuraste
3. Deberías tener acceso al panel de gerencia

---

## Parte 6: Verificar Funcionalidades

### 6.1 Registro de Usuario

1. Ve a `/registro`
2. Completa el formulario
3. Verifica que recibas el email de bienvenida

### 6.2 Verificación KYC

1. Inicia sesión como cliente
2. Ve a `/verificacion`
3. Completa el proceso:
   - Datos personales
   - Verificación de teléfono
   - Subida de documentos
4. Verifica que los documentos se suban a Vercel Blob

### 6.3 Panel de Gerencia

1. Inicia sesión como gerencia
2. Ve a `/admin/verificaciones`
3. Deberías ver las verificaciones pendientes
4. Aprueba o rechaza una verificación
5. Verifica que el usuario reciba la notificación

---

## Troubleshooting

### Error: "Cannot connect to database"

**Causa:** Credenciales incorrectas o base de datos no disponible

**Solución:**
1. Verifica las variables en Railway
2. Asegúrate de que el servicio MySQL esté activo
3. Railway puede cambiar credenciales si reinicias el servicio

### Error: "BLOB_READ_WRITE_TOKEN is not defined"

**Causa:** Token de Blob no configurado

**Solución:**
1. Ve a Vercel → Storage → Tu Blob Store → Settings
2. Copia el token completo
3. Agrégalo en Railway como `BLOB_READ_WRITE_TOKEN`

### Los documentos no se suben

**Causa:** Problema con Vercel Blob o token incorrecto

**Solución:**
1. Verifica el token en Vercel Dashboard
2. Asegúrate de que `BLOB_STORAGE_PROVIDER=vercel-blob`
3. Revisa los logs en Railway para errores específicos

### No llegan los emails

**Causa:** Credenciales de Gmail incorrectas o app password no configurado

**Solución:**
1. Verifica que `EMAIL_USER` y `EMAIL_PASSWORD` sean correctos
2. Asegúrate de usar un **App Password** de Gmail, no tu contraseña normal
3. Genera uno en: https://myaccount.google.com/apppasswords

### Error: "Session secret is not configured"

**Causa:** SESSION_SECRET no está configurado

**Solución:**
1. Genera uno con: `openssl rand -base64 32`
2. Agrégalo como variable de entorno en Railway

---

## Monitoreo y Mantenimiento

### Logs

Ver logs en Railway:
```bash
railway logs
```

### Backup de Base de Datos

```bash
mysqldump -h switchyard.proxy.rlwy.net -P 43872 -u giros -p yourbusi_ybh > backup-$(date +%Y%m%d).sql
```

### Actualizar Aplicación

```bash
git add .
git commit -m "Your changes"
git push
# Railway desplegará automáticamente
```

---

## Costos Mensuales Estimados

- **Railway**: $5-20 (según uso de CPU/RAM)
- **Vercel Blob**: Gratis hasta 1GB, luego $0.15/GB
- **Gmail SMTP**: Gratis
- **Twilio SMS** (opcional): $0.0075/mensaje

**Total Estimado:** $5-25/mes

---

## Próximos Pasos

- [ ] Configurar dominio personalizado en Railway
- [ ] Configurar SSL (Railway lo hace automáticamente)
- [ ] Configurar backups automáticos
- [ ] Configurar alertas de monitoreo
- [ ] Configurar Twilio para SMS reales (opcional)
- [ ] Agregar más administradores desde el panel

---

¿Preguntas? Revisa los logs de Railway o la documentación oficial:
- [Railway Docs](https://docs.railway.app)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [MySQL Docs](https://dev.mysql.com/doc/)
