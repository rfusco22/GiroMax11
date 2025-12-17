# Guía para Generar Secretos de Seguridad

## SESSION_SECRET

El `SESSION_SECRET` es una clave aleatoria de 32 bytes usada para firmar las cookies de sesión y tokens JWT.

### Método 1: Usar OpenSSL (Recomendado)

Si tienes OpenSSL instalado en tu sistema:

```bash
openssl rand -base64 32
```

Este comando genera una cadena aleatoria segura de 32 bytes en formato base64.

**Ejemplo de salida:**
```
XvF8kR9mNp2Lq3Zt7Wc4Hb6Yd5Jf1Kg0Mx8Vn3Qr2Ps==
```

### Método 2: Usar Node.js

Si no tienes OpenSSL o prefieres usar Node.js, ejecuta este comando:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Método 3: Usar el Script Helper

Puedes usar el script helper que hemos creado:

```bash
node scripts/generate-secrets.js
```

Este script generará:
- SESSION_SECRET
- Otros secretos que puedas necesitar en el futuro

### Método 4: Generador en Python

Si tienes Python instalado:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Método 5: Generador Online (Menos Seguro)

Solo para desarrollo, puedes usar generadores online como:
- https://generate-secret.vercel.app/32
- https://randomkeygen.com/

⚠️ **IMPORTANTE**: Para producción, SIEMPRE genera secretos localmente usando OpenSSL o Node.js.

---

## Configurar en Railway

Una vez generado tu `SESSION_SECRET`:

1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio
3. Ve a la pestaña "Variables"
4. Agrega una nueva variable:
   - **Name**: `SESSION_SECRET`
   - **Value**: [Pega el secreto generado]
5. Haz clic en "Add" y el servicio se reiniciará automáticamente

---

## Verificar que está configurado

Después de configurar, puedes verificar que la variable existe (sin mostrar su valor):

```bash
# En tu aplicación, este código verificará si existe
if (!process.env.SESSION_SECRET) {
  console.error('❌ SESSION_SECRET no está configurado');
} else {
  console.log('✅ SESSION_SECRET está configurado');
}
```

---

## Buenas Prácticas

1. **Nunca compartas** tu SESSION_SECRET en repositorios públicos
2. **Usa diferentes secretos** para desarrollo, staging y producción
3. **Rota los secretos** periódicamente (cada 6-12 meses)
4. **Mantén un backup seguro** de tus secretos en un gestor de contraseñas
5. **Longitud mínima**: 32 bytes (256 bits) para seguridad óptima

---

## Regenerar el Secreto

Si necesitas regenerar el secreto (por seguridad o compromiso):

1. Genera un nuevo secreto usando cualquiera de los métodos anteriores
2. Actualiza la variable en Railway
3. ⚠️ **NOTA**: Esto invalidará todas las sesiones activas y los usuarios deberán iniciar sesión nuevamente
