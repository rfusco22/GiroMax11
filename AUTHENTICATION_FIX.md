# Corrección de Problemas de Autenticación

## Problemas Identificados y Soluciones

### 1. Usuario Demo No Existía en la Base de Datos
**Problema**: El formulario de login tenía `demo@girosmax.com` pre-cargado, pero ese usuario solo existía en el sistema demo (`/app/auth.ts`) que no se estaba usando.

**Solución**: 
- Eliminé el archivo `/app/auth.ts` (sistema demo conflictivo)
- Creé el script `06_insert_demo_user.sql` para insertar el usuario demo en la base de datos real
- El usuario demo ahora tiene:
  - Email: `demo@girosmax.com`
  - Password: `demo123`
  - Rol: cliente

### 2. Rutas 404 Faltantes
**Problema**: La aplicación referenciaba rutas que no existían:
- `/recuperar` (recuperación de contraseña)
- `/terminos` (términos de servicio)
- `/privacidad` (política de privacidad)

**Solución**: Creé todas las páginas faltantes con contenido apropiado

### 3. Falta de Logging para Debugging
**Problema**: Era difícil diagnosticar dónde fallaba el proceso de autenticación.

**Solución**: Agregué `console.log("[v0] ...")` statements en:
- `app/actions/auth.ts` - Para ver el flujo de login/registro
- `lib/auth.ts` - Para ver la verificación de contraseñas y creación de usuarios
- `lib/db.ts` - Para ver las consultas SQL ejecutadas

### 4. Mejoras en Manejo de Errores
**Problema**: Los errores no eran lo suficientemente descriptivos.

**Solución**: 
- Agregué validación de campos antes de intentar registro
- Los mensajes de error ahora incluyen detalles técnicos (stack traces en console)
- Validación de longitud de contraseña mejorada

## Pasos para Resolver los Problemas

### Paso 1: Ejecutar el Nuevo Script SQL
En MySQL Workbench conectado a tu base de datos Railway, ejecuta:

```sql
-- scripts/06_insert_demo_user.sql
```

Este script creará el usuario demo que puedes usar para probar.

### Paso 2: Verificar Variables de Entorno
Asegúrate de que tu archivo `.env.local` tenga las credenciales correctas de Railway:

```env
DB_HOST=switchyard.proxy.rlwy.net
DB_PORT=43872
DB_NAME=giros
DB_USER=root
DB_PASSWORD=ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR
```

### Paso 3: Reiniciar el Servidor de Desarrollo
Después de agregar las variables de entorno, reinicia tu servidor Next.js para que tome los cambios.

### Paso 4: Probar el Login
1. Ve a `/login`
2. Usa las credenciales pre-cargadas:
   - Email: `demo@girosmax.com`
   - Password: `demo123`
3. Revisa la consola del navegador y la terminal para ver los logs `[v0]`

### Paso 5: Probar el Registro
1. Ve a `/registro`
2. Completa el formulario con datos nuevos
3. Verifica que puedas crear una cuenta y seas redirigido al dashboard

## Debugging

Si aún tienes problemas, revisa:

1. **Consola del Navegador**: Busca mensajes `[v0]` que muestren el flujo de autenticación
2. **Terminal del Servidor**: Verifica logs de conexión a la base de datos y consultas SQL
3. **MySQL Workbench**: Verifica que las tablas `users` y `sessions` existan y tengan datos

### Consultas Útiles para Debugging

```sql
-- Ver todos los usuarios
SELECT id, email, name, role, verified FROM users;

-- Ver todas las sesiones activas
SELECT s.token, s.user_id, s.expires_at, u.email 
FROM sessions s 
JOIN users u ON s.user_id = u.id 
WHERE s.expires_at > NOW();

-- Ver intentos de login del usuario demo
SELECT * FROM users WHERE email = 'demo@girosmax.com';
```

## Notas Importantes

- El sistema ahora usa SOLO `/lib/auth.ts` (autenticación basada en base de datos)
- Las contraseñas se hashean con bcrypt (10 rounds)
- Las sesiones duran 7 días
- El token de sesión se almacena en una cookie HTTP-only
