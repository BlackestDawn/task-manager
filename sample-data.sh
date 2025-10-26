source ./.env

psql "$DB_URL" -f ./docker/db/sample_data.sql
