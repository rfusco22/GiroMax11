# Crear Usuario de Gerencia - Guía Completa

## Opción 1: Usando el Script SQL (Recomendado)

### Paso 1: Generar el Hash de la Contraseña

Necesitas generar un hash bcrypt de la contraseña. Tienes dos opciones:

#### Opción A: Usando Node.js (en tu computadora)

1. Instala bcryptjs si no lo tienes:
   ```bash
   npm install bcryptjs
   ```

2. Crea un archivo `generate-hash.js`:
   ```javascript
   const bcrypt = require('bcryptjs');
   const password = 'TuContraseñaSegura123!';
   bcrypt.hash(password, 10, (err, hash) => {
     if (err) throw err;
     console.log('Password:', password);
     console.log('Hash:', hash);
   });
   ```

3. Ejecuta:
   ```bash
   node generate-hash.js
   ```

#### Opción B: Usando una Herramienta Online

Visita: https://bcrypt-generator.com/
- Ingresa tu contraseña
- Selecciona 10 rounds
- Copia el hash generado

### Paso 2: Ejecutar el Script SQL

1. Abre el archivo `scripts/08_create_gerencia_user.sql`

2. Reemplaza estos valores:
   - **Email**: Cambia `gerencia@girosmax.com` por el email que desees
   - **Password Hash**: Reemplaza `$2a$10$YourHashedPasswordHere` con el hash que generaste
   - **Name**: Cambia el nombre si lo deseas
   - **Phone**: Actualiza el número de teléfono

3. Ejecuta el script en Railway:
   - Ve a tu proyecto en Railway
   - Abre la sección de tu base de datos MySQL
   - Ve a "Query" o "Console"
   - Copia y pega el contenido del script
   - Ejecuta la consulta

### Paso 3: Verificar el Usuario

Ejecuta esta consulta para verificar que el usuario fue creado:

```sql
SELECT id, email, name, role, verified, created_at 
FROM users 
WHERE role = 'gerencia';
```

## Opción 2: Usuario de Prueba (Desarrollo)

Para desarrollo rápido, el script incluye un usuario de prueba:

```
Email: admin@girosmax.com
Contraseña: admin123
Rol: gerencia
```

**IMPORTANTE**: Este usuario SOLO debe usarse en desarrollo. Elimínalo en producción.

## Iniciar Sesión

1. Ve a: `https://tu-dominio.com/login`
2. Ingresa el email y contraseña del usuario gerencia
3. Serás redirigido al dashboard con permisos completos

## Permisos de Gerencia

Los usuarios con rol 'gerencia' tienen acceso a:

- Panel de administración completo
- Aprobación/rechazo de verificaciones KYC
- Gestión de transacciones
- Configuración de márgenes
- Auditoría del sistema
- Gestión de otros administradores
- Todas las funcionalidades del sistema

## Cambiar Contraseña Después del Primer Login

1. Inicia sesión con las credenciales iniciales
2. Ve a: Dashboard → Mi Perfil → Seguridad
3. Haz clic en "Cambiar Contraseña"
4. Ingresa la contraseña actual y la nueva contraseña
5. Guarda los cambios

## Seguridad

### Recomendaciones:

- Usa contraseñas seguras (mínimo 12 caracteres)
- Incluye mayúsculas, minúsculas, números y símbolos
- No compartas las credenciales
- Cambia la contraseña regularmente
- Habilita autenticación de dos factores cuando esté disponible

### Ejemplo de Contraseña Segura:
```
GirosMax2024!Secure#Admin
```

## Crear Usuarios de Gerencia Adicionales

### Desde el Panel de Administración:

1. Inicia sesión como gerencia
2. Ve a: Admin → Usuarios
3. Haz clic en "Crear Usuario"
4. Selecciona el rol "Gerencia"
5. Completa los datos
6. El sistema enviará un email con las credenciales

### Desde SQL:

Duplica el INSERT en el script `08_create_gerencia_user.sql` cambiando:
- ID (genera uno nuevo con UUID())
- Email
- Password hash
- Name
- Phone

## Troubleshooting

### Error: "Email already exists"
- El email ya está registrado
- Usa otro email o elimina el usuario existente primero

### Error: "Invalid hash"
- El hash de la contraseña no es válido
- Genera un nuevo hash con bcrypt rounds=10

### No puedo iniciar sesión
- Verifica que `verified = TRUE`
- Confirma que `role = 'gerencia'`
- Verifica que el hash de la contraseña es correcto

### Cómo resetear la contraseña desde SQL:

```sql
UPDATE users 
SET password_hash = 'nuevo_hash_aqui'
WHERE email = 'gerencia@girosmax.com';
```

## Soporte

Si tienes problemas creando el usuario de gerencia:
1. Verifica que la base de datos está correctamente configurada
2. Confirma que todas las tablas fueron creadas
3. Revisa los logs de Railway para errores
4. Contacta al equipo de desarrollo
