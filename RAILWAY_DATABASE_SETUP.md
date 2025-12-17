# Configuración de Base de Datos Railway - GirosMax

## Credenciales de Railway
- **Host:** switchyard.proxy.rlwy.net
- **Port:** 43872
- **Database:** giros
- **Username:** root
- **Password:** ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR

## Instrucciones para Ejecutar los Scripts

### Opción 1: Usando MySQL Workbench

1. **Conectar a Railway:**
   - Abre MySQL Workbench
   - Crea una nueva conexión con los datos de arriba
   - Asegúrate de usar el puerto 43872

2. **Ejecutar Scripts en ORDEN:**
   
   **Script 1 - Crear Tablas:**
   ```bash
   scripts/01_create_database.sql
   ```
   ✅ Este script ahora está CORREGIDO con el orden correcto de las tablas
   
   **Script 2 - Datos Iniciales:**
   ```bash
   scripts/02_seed_initial_data.sql
   ```
   
   **Script 3 - Índices y Constraints:**
   ```bash
   scripts/03_create_indexes_and_constraints.sql
   ```
   
   **Script 4 - Vistas y Procedimientos:**
   ```bash
   scripts/04_create_views_and_procedures.sql
   ```
   
   **Script 5 - NO EJECUTAR** (solo para actualizaciones)
   ```bash
   # scripts/05_update_existing_schema.sql - SKIP ESTE SCRIPT
   ```

### Opción 2: Usando el CLI de MySQL

```bash
# Conectar a Railway
mysql -h switchyard.proxy.rlwy.net -P 43872 -u root -p giros

# Pegar el password cuando se solicite:
# ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR

# Dentro de MySQL, ejecutar cada script:
source /ruta/a/scripts/01_create_database.sql
source /ruta/a/scripts/02_seed_initial_data.sql
source /ruta/a/scripts/03_create_indexes_and_constraints.sql
source /ruta/a/scripts/04_create_views_and_procedures.sql
```

### Opción 3: Desde Railway Dashboard

1. Ve a tu proyecto en Railway
2. Selecciona tu servicio MySQL
3. Abre la pestaña "Query"
4. Copia y pega el contenido de cada script EN ORDEN
5. Ejecuta uno por uno

## Problemas Corregidos

### ✅ Error 1824 - Tabla user_bank_accounts
**Problema:** La tabla `transactions` intentaba referenciar `user_bank_accounts` antes de que existiera.

**Solución:** Reordenamos el script 01 para crear `user_bank_accounts` ANTES de `transactions`.

### ✅ Error 1146 - Tabla admin_country_assignments
**Problema:** El script 02 intentaba insertar datos en una tabla que se crea en el script 01.

**Solución:** La tabla `admin_country_assignments` ya está en el script 01, ahora funcionará correctamente.

### ✅ Error 1064/1060 - IF NOT EXISTS en ALTER TABLE
**Problema:** MySQL no soporta `IF NOT EXISTS` en `ALTER TABLE ADD COLUMN`.

**Solución:** El script 05 ahora está comentado y documentado para uso manual solo en migraciones.

## Verificar la Instalación

Después de ejecutar los scripts, verifica que todo funcione:

```sql
-- Verificar tablas creadas
SHOW TABLES;

-- Verificar usuarios de prueba
SELECT email, name, role FROM users;

-- Verificar márgenes
SELECT * FROM currency_margins;

-- Verificar cuentas bancarias
SELECT * FROM user_bank_accounts;
```

## Datos de Prueba Incluidos

### Usuarios:
- **Gerencia:** gerencia@girosmax.com (password: gerencia123*)
- **Admin Principal:** admin@girosmax.com (password: admin123*)
- **Cliente Demo:** cliente@girosmax.com (password: cliente123*)

*Las contraseñas están hasheadas con bcrypt. Necesitarás hashearlas correctamente en el script 02.

### Monedas Configuradas:
USD, COP, PEN, CLP, VES, PAB, EUR, MXN

## Variables de Entorno

Asegúrate de tener en tu archivo `.env.local`:

```env
DATABASE_URL="mysql://root:ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR@switchyard.proxy.rlwy.net:43872/giros"
DATABASE_HOST="switchyard.proxy.rlwy.net"
DATABASE_PORT="43872"
DATABASE_NAME="giros"
DATABASE_USER="root"
DATABASE_PASSWORD="ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR"
```

## Soporte

Si tienes problemas ejecutando los scripts:
1. Verifica que puedes conectarte a Railway con las credenciales
2. Asegúrate de ejecutar los scripts EN ORDEN
3. NO ejecutes el script 05 en una instalación nueva
4. Revisa los logs de error en MySQL Workbench
