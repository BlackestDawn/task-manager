#!/bin/bash
set -e

# This script runs automatically when the PostgreSQL container starts for the first time
# It's placed in /docker-entrypoint-initdb.d/ which is executed by the postgres image

echo "Initializing task-manager database..."

# The database is already created by POSTGRES_DB environment variable
# We just need to ensure the schema is ready

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions if needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB" TO $POSTGRES_USER;
EOSQL

echo "Database initialized successfully!"

# Check if sample data should be loaded
if [ "$LOAD_SAMPLE_DATA" = "true" ]; then
    echo "Loading sample data..."
    if [ -f /tmp/sample_data.sql ]; then
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /tmp/sample_data.sql
        echo "Sample data loaded successfully!"
    else
        echo "Warning: sample_data.sql file not found, skipping sample data load"
    fi
else
    echo "Skipping sample data load (LOAD_SAMPLE_DATA is not set to true)"
fi

echo "Database setup complete!"