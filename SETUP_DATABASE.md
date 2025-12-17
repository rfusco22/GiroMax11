# Configuración de la Base de Datos MySQL en Railway

Este documento explica cómo configurar la conexión a la base de datos MySQL para GirosMax.

## Paso 1: Configurar Variables de Entorno

Asegúrate de tener las siguientes variables de entorno configuradas en tu proyecto:

- `DB_HOST`: Host de tu base de datos MySQL en Railway
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos

## Paso 2: Ejecutar los Scripts SQL

Ejecuta los scripts SQL en el siguiente orden en Railway:

1. `scripts/01_create_database.sql` - Crea las tablas principales
2. `scripts/02_seed_initial_data.sql` - Inserta datos iniciales
3. `scripts/03_create_indexes_and_constraints.sql` - Agrega índices y restricciones
4. `scripts/04_create_views_and_procedures.sql` - Crea vistas y procedimientos
5. `scripts/05_update_existing_schema.sql` - Actualiza el esquema con nuevas tablas

## Paso 3: Verificar la Conexión

La aplicación ahora usará la base de datos MySQL real en lugar de datos simulados en memoria.

### Usuarios Demo

Los siguientes usuarios están disponibles después de ejecutar los scripts de seed:

- **Cliente**: `cliente@girosmax.com` / `cliente123`
- **Administrador**: `admin@girosmax.com` / `admin123`
- **Gerencia**: `gerencia@girosmax.com` / `gerencia123`

### Funcionalidades Implementadas

- Registro de nuevos usuarios con hash de contraseñas (bcrypt)
- Inicio de sesión con verificación de contraseñas
- Gestión de sesiones en la base de datos
- Middleware para proteger rutas
- Sistema de roles (Cliente, Administrador, Gerencia)

### Debugging

Los logs de consola están habilitados con el prefijo `[v0]` para ayudar a depurar problemas de autenticación. Verás mensajes como:

- `[v0] Register action called`
- `[v0] Registration data: {...}`
- `[v0] Login attempt for email: ...`
- `[v0] Error registering user: ...`

Estos logs te ayudarán a identificar si hay problemas con la conexión a la base de datos.
