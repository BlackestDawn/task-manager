source ./.env

psql "$DB_URL" -f ./reset-db.sql
