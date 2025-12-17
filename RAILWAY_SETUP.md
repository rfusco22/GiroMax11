# Railway MySQL Database - Setup Complete ✅

## Database Connection Details

Your GirosMax application is now configured to connect to Railway MySQL:

- **Host**: switchyard.proxy.rlwy.net
- **Port**: 43872
- **Database**: giros
- **User**: root
- **Password**: ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR

## Environment Variables Configured

The `.env.local` file has been created with your Railway credentials. These variables are used by `lib/db.ts` to establish the MySQL connection.

## Next Steps to Complete Setup

### 1. Execute SQL Scripts in Railway

You need to run the SQL scripts in your Railway MySQL database. You can do this in two ways:

#### Option A: Using MySQL Command Line
```bash
mysql -h switchyard.proxy.rlwy.net -P 43872 -u root -p giros < scripts/01_create_database.sql
mysql -h switchyard.proxy.rlwy.net -P 43872 -u root -p giros < scripts/02_seed_initial_data.sql
mysql -h switchyard.proxy.rlwy.net -P 43872 -u root -p giros < scripts/03_create_indexes_and_constraints.sql
mysql -h switchyard.proxy.rlwy.net -P 43872 -u root -p giros < scripts/04_create_views_and_procedures.sql
mysql -h switchyard.proxy.rlwy.net -P 43872 -u root -p giros < scripts/05_update_existing_schema.sql
```

When prompted, enter password: `ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR`

#### Option B: Using MySQL Workbench or phpMyAdmin
1. Connect to your Railway MySQL:
   - Host: switchyard.proxy.rlwy.net
   - Port: 43872
   - Username: root
   - Password: ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR
   - Database: giros

2. Open and execute each SQL script in order:
   - `scripts/01_create_database.sql`
   - `scripts/02_seed_initial_data.sql`
   - `scripts/03_create_indexes_and_constraints.sql`
   - `scripts/04_create_views_and_procedures.sql`
   - `scripts/05_update_existing_schema.sql`

### 2. Verify Connection

After running the scripts, start your Next.js application:

```bash
npm run dev
```

The application will automatically connect to your Railway MySQL database.

### 3. Test with Demo Users

Once the scripts are executed, you can log in with these demo accounts:

- **Cliente**: `cliente@girosmax.com` / `cliente123`
- **Administrador**: `admin@girosmax.com` / `admin123`
- **Gerencia**: `gerencia@girosmax.com` / `gerencia123`

## Database Tables Created

After running the scripts, your Railway database will have:

- ✅ `users` - User accounts with bcrypt password hashing
- ✅ `sessions` - Active user sessions (7-day expiration)
- ✅ `wallets` - User currency wallets
- ✅ `transactions` - Exchange, transfer, deposit, withdrawal records
- ✅ `currency_margins` - Profit margins per currency
- ✅ `notifications` - User notifications
- ✅ `audit_log` - System audit trail for gerencia
- ✅ `system_config` - Global system configuration

## Security Notes

🔒 **Important for Production:**

1. Never commit `.env.local` to version control
2. Add `.env.local` to your `.gitignore` file
3. In Railway deployment, set these as environment variables in the Railway dashboard
4. Consider rotating database password after initial setup

## Troubleshooting

If you encounter connection issues:

1. Check that Railway MySQL service is running
2. Verify the credentials match your Railway dashboard
3. Check console logs with `[v0]` prefix for detailed error messages
4. Ensure your IP is whitelisted in Railway (if required)

## Production Deployment

When deploying to Railway/Vercel:

1. Set environment variables in Railway project settings:
   - `DB_HOST=switchyard.proxy.rlwy.net`
   - `DB_USER=root`
   - `DB_PASSWORD=ReNdeuIEbxjtEuHozWkqTFbDYlHFJcuR`
   - `DB_NAME=giros`
   - `DB_PORT=43872`

2. Railway will automatically inject these into your application

3. Remove demo users and create real admin accounts
