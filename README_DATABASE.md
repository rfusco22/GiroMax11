# GirosMax - Configuración de Base de Datos MySQL

## Roles del Sistema

El sistema GirosMax está diseñado para 3 roles de usuario:

### 1. **Cliente** (role: 'cliente')
- Usuario final que realiza transacciones de cambio de divisas
- Acceso a dashboard personal, historial, billetera
- Puede realizar cambios, transferencias, depósitos y retiros
- Recibe notificaciones de sus transacciones

**Credenciales Demo:**
- Email: `cliente@girosmax.com`
- Password: `cliente123`

### 2. **Administrador** (role: 'administrador')
- Gestiona los márgenes de ganancia por moneda
- Acceso a configuración del sistema
- Puede ver reportes y estadísticas
- Gestiona usuarios y soporte técnico

**Credenciales Demo:**
- Email: `admin@girosmax.com`
- Password: `admin123`

### 3. **Gerencia** (role: 'gerencia')
- Acceso completo al sistema
- Visualiza auditoría completa de acciones
- Configura políticas y límites del sistema
- Acceso a reportes financieros avanzados

**Credenciales Demo:**
- Email: `gerencia@girosmax.com`
- Password: `gerencia123`

---

## Estructura de la Base de Datos

### Tablas Principales

#### 1. `users` - Usuarios del sistema
- **Campos:** id, email, password_hash, name, phone, country, role, verified, created_at
- **Roles:** 'cliente', 'administrador', 'gerencia'
- **Índices:** email, role, created_at

#### 2. `sessions` - Sesiones activas
- **Campos:** id, user_id, token, expires_at, ip_address, user_agent
- **Seguridad:** Tokens únicos, expiración automática (7 días)

#### 3. `currency_margins` - Márgenes de cambio
- **Campos:** currency_code, margin_percent, last_updated, updated_by
- **Rango:** 0% - 10% de margen
- **Gestión:** Solo administradores y gerencia

#### 4. `transactions` - Transacciones
- **Tipos:** exchange, transfer, deposit, withdrawal
- **Estados:** pending, processing, completed, failed, cancelled
- **Campos:** from/to currency, amounts, rate, fee, recipient info

#### 5. `wallets` - Billeteras de usuarios
- **Campos:** user_id, currency_code, balance, available_balance
- **Restricción:** Una billetera por usuario por moneda

#### 6. `notifications` - Notificaciones
- **Tipos:** info, success, warning, error
- **Relación:** Vinculadas a transacciones

#### 7. `audit_log` - Registro de auditoría
- **Uso:** Gerencia - seguimiento de todas las acciones críticas
- **Datos:** user, action, entity_type, old/new values, timestamp

#### 8. `system_config` - Configuración del sistema
- **Uso:** Administradores - configuración global
- **Ejemplos:** maintenance_mode, max_transaction_amount, kyc_required

---

## Scripts SQL de Instalación

### Orden de Ejecución en Railway

1. **01_create_database.sql**
   - Crea todas las tablas con relaciones e índices
   - Define constraints y foreign keys
   - Configura charset UTF-8

2. **02_seed_initial_data.sql**
   - Inserta usuarios demo para cada rol
   - Configura márgenes iniciales por moneda
   - Crea billeteras demo y transacciones de ejemplo

3. **03_create_indexes_and_constraints.sql**
   - Añade índices compuestos para optimización
   - Crea constraints de validación de datos
   - Full-text search en transacciones

4. **04_create_views_and_procedures.sql**
   - Vistas para reportes (transacciones, billeteras, actividad)
   - Stored procedures (crear transacciones, obtener estadísticas)
   - Funciones auxiliares para gerencia

---

## Configuración en Railway

### 1. Crear Base de Datos MySQL
```bash
# En Railway, crea un nuevo servicio MySQL
# Copia las credenciales: host, port, user, password, database
```

### 2. Configurar Variables de Entorno
```env
DATABASE_URL=mysql://user:password@host:port/database
```

### 3. Ejecutar Scripts
```bash
# Opción A: Desde Railway CLI
railway run mysql -h host -u user -p database < scripts/01_create_database.sql
railway run mysql -h host -u user -p database < scripts/02_seed_initial_data.sql
railway run mysql -h host -u user -p database < scripts/03_create_indexes_and_constraints.sql
railway run mysql -h host -u user -p database < scripts/04_create_views_and_procedures.sql

# Opción B: Desde phpMyAdmin o MySQL Workbench
# Copia y pega cada script en el orden correcto
```

---

## Seguridad y Mejores Prácticas

### Contraseñas
⚠️ **IMPORTANTE:** Los scripts usan `$2b$10$YourBcryptHashHere` como placeholder.

**Antes de producción:**
```javascript
// Hashear contraseñas con bcrypt
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('password', 10);
```

### Conexión a Base de Datos
```typescript
// lib/db.ts - Ejemplo de conexión segura
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
```

### Migraciones
```bash
# Para actualizaciones futuras, crea scripts versionados:
# scripts/05_add_kyc_table.sql
# scripts/06_add_transaction_limits.sql
```

---

## Monedas Soportadas

| Código | Moneda | País | Margen Inicial |
|--------|--------|------|----------------|
| USD | Dólar Americano | Estados Unidos | 0.50% |
| COP | Peso Colombiano | Colombia | 1.20% |
| PEN | Sol Peruano | Perú | 1.00% |
| CLP | Peso Chileno | Chile | 0.80% |
| VES | Bolívar | Venezuela | 2.50% |
| PAB | Balboa | Panamá | 0.30% |
| EUR | Euro / Dólar | Ecuador | 0.50% |
| MXN | Peso Mexicano | México | 0.90% |

---

## Loader Behavior

### Configuración Actual

El loader (página de carga) se muestra en 2 situaciones:

1. **Primera visita al sitio** (página principal)
   - Se muestra durante 5 segundos
   - Se guarda en `sessionStorage` con clave `hasShownLoader`
   - No se vuelve a mostrar en la misma sesión del navegador

2. **Primera visita a la página de login**
   - Se muestra durante 5 segundos
   - Se guarda en `sessionStorage` con clave `hasShownLoginLoader`
   - Independiente del loader principal

**Comportamiento:**
- Si cierras el navegador y vuelves a abrir, el loader se mostrará de nuevo
- Si navegas entre páginas sin cerrar el navegador, no se muestra
- Cada página tiene su propio control de loader

---

## Próximos Pasos

1. ✅ Ejecutar scripts SQL en Railway
2. ⚠️ Reemplazar hashes de contraseñas con bcrypt reales
3. 🔧 Conectar la aplicación a MySQL (actualizar `lib/auth.ts`)
4. 🧪 Probar autenticación con 3 roles
5. 📊 Implementar queries para transacciones y reportes
6. 🔐 Configurar Row Level Security y permisos
