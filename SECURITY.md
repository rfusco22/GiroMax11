# Seguridad en GiroMax

## Resumen de Medidas de Seguridad Implementadas

### 1. Autenticación y Sesiones

#### Hashing de Contraseñas
- Todas las contraseñas se almacenan hasheadas usando **bcrypt** con un costo de 10 rounds
- Nunca se almacenan contraseñas en texto plano
- El hashing es resistente a ataques de fuerza bruta

#### Sesiones Seguras
- Las sesiones usan tokens criptográficamente seguros de 64 caracteres (32 bytes)
- Los tokens se firman con **HMAC-SHA256** usando `SESSION_SECRET`
- Las cookies de sesión son:
  - **HttpOnly**: No accesibles desde JavaScript (previene XSS)
  - **Secure**: Solo se transmiten por HTTPS en producción
  - **SameSite=Lax**: Protección contra CSRF
  - Con expiración de 7 días

#### Verificación de Integridad
- Cada cookie de sesión incluye una firma HMAC
- La firma se verifica en cada request para prevenir manipulación
- Usa `crypto.timingSafeEqual()` para prevenir timing attacks

### 2. KYC (Know Your Customer)

#### Verificación de Identidad
- Validación de edad: Solo usuarios mayores de 18 años
- Verificación telefónica: SMS o WhatsApp con código de 6 dígitos
- Documentos requeridos:
  - Foto del documento oficial (DNI, Cédula, Pasaporte, Licencia)
  - Selfie del usuario
  - Selfie sosteniendo el documento

#### Almacenamiento de Documentos
- Los documentos se almacenan en **Vercel Blob** con acceso restringido
- URLs de documentos incluyen tokens únicos de acceso
- Solo usuarios autorizados (gerencia) pueden ver documentos
- Validación de tipos de archivo (imágenes solamente)
- Límite de tamaño: 10MB por archivo

#### Estados de Verificación
- **none**: Usuario sin KYC iniciado
- **pending**: KYC enviado, esperando aprobación de gerencia
- **approved**: KYC aprobado, cuenta completamente funcional
- **rejected**: KYC rechazado con razón documentada

### 3. Validación de Datos

#### Validación por País
- Formatos de documento específicos por país (España, Ecuador, Chile, etc.)
- Validación de números telefónicos por código de país
- Regex patterns para cada tipo de documento nacional

#### Validación de Entrada
- Nombres y apellidos: Solo letras, espacios, acentos y caracteres especiales latinos
- Emails: Formato estándar RFC 5322
- Teléfonos: Formato internacional con código de país
- Documentos: Formatos específicos según tipo y país

### 4. Protección de Base de Datos

#### Prepared Statements
- Todas las queries usan prepared statements (MySQL2)
- Prevención de inyección SQL
- Parametrización automática de valores

#### Permisos de Usuario
- Roles claramente definidos: cliente, administrador, gerencia
- Middleware de autorización verifica roles antes de acciones críticas
- Separación de funcionalidades por rol

### 5. Gestión de Secretos

#### Variables de Entorno Requeridas

```bash
# Secreto de sesión (CRÍTICO)
SESSION_SECRET=<generar con: openssl rand -base64 32>

# Credenciales de base de datos
DB_HOST=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_PORT=

# Email SMTP
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# Almacenamiento de archivos
BLOB_READ_WRITE_TOKEN=

# URL de la aplicación
NEXT_PUBLIC_APP_URL=
```

#### Buenas Prácticas
- Secretos generados con al menos 256 bits de entropía
- Rotación periódica de SESSION_SECRET
- Nunca commitear archivos .env
- Usar diferentes secretos para dev/staging/producción

### 6. API y Endpoints

#### Rate Limiting
- Verificación telefónica: máximo 5 intentos por sesión
- Login: protección contra fuerza bruta (implementar en proxy)
- Subida de archivos: límite de tamaño y tipo

#### CORS y Headers
- SameSite cookies previenen ataques CSRF
- Content-Type validation en uploads
- Secure headers en producción

### 7. Auditoría y Logging

#### Registros de Auditoría
- Tabla `kyc_history`: Registro completo de cambios de estado KYC
- Tabla `kyc_phone_verification_log`: Log de intentos de verificación telefónica
- Timestamps en todas las operaciones críticas
- ID del administrador que aprueba/rechaza KYC

#### Logs de Seguridad
- Errores de autenticación registrados
- Intentos fallidos de login
- Cambios en permisos de usuario

### 8. Protección de Rutas

#### Middleware de Autenticación (proxy.ts)
- Rutas públicas explícitamente definidas
- Redirección automática a login para rutas protegidas
- Prevención de acceso a login/registro si ya autenticado

#### Verificación de Sesión
- Validación de token en cada request
- Expiración automática de sesiones vencidas
- Limpieza de sesiones expiradas de la base de datos

### 9. Mejores Prácticas Implementadas

✅ Principio de mínimo privilegio en roles
✅ Defensa en profundidad (múltiples capas de seguridad)
✅ Fail securely (errores no revelan información sensible)
✅ Separación de concerns (auth, KYC, sesiones modulares)
✅ Validación de entrada en cliente y servidor
✅ Sanitización de datos antes de almacenar
✅ HTTPS enforced en producción
✅ Cookies seguras y firmadas

### 10. Recomendaciones Adicionales

Para fortalecer aún más la seguridad:

1. **Implementar 2FA**: Agregar autenticación de dos factores opcional
2. **Rate Limiting Avanzado**: Usar Redis para rate limiting distribuido
3. **WAF**: Configurar Web Application Firewall en Railway
4. **Monitoreo**: Implementar alertas para actividad sospechosa
5. **Backup**: Backups automáticos de base de datos cifrados
6. **Penetration Testing**: Tests de seguridad periódicos
7. **Security Headers**: Implementar CSP, X-Frame-Options, etc.
8. **Dependency Scanning**: Actualizar dependencias regularmente

---

## Respuesta a Incidentes

En caso de sospecha de compromiso de seguridad:

1. **Inmediato**: Rotar SESSION_SECRET
2. Invalidar todas las sesiones activas
3. Revisar logs de auditoría
4. Notificar a usuarios afectados
5. Investigar y parchear vulnerabilidad
6. Documentar el incidente

---

## Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:
- Email: security@girosmax.com (configurar)
- Respuesta esperada: 24-48 horas
