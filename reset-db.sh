source ./.env

psql "$DB_URL" -f ./docker/db/reset-db.sql
