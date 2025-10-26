#!/bin/bash

# Task Manager Docker Management Script
# This script provides convenient commands for managing the Docker setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables from .env file
load_env() {
    if [ -f .env ]; then
        # Export variables from .env, ignoring comments and empty lines
        set -a
        source <(grep -v '^#' .env | grep -v '^$' | sed 's/\r$//')
        set +a
    fi
}

# Set default values for variables (used if not in .env)
set_defaults() {
    # Database defaults
    POSTGRES_DB="${POSTGRES_DB:-taskmanager}"
    POSTGRES_USER="${POSTGRES_USER:-taskmanager}"
    POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-taskmanager_password}"

    # Container names (these are fixed in docker-compose.yml)
    DB_CONTAINER="task-manager-db"
    BACKEND_CONTAINER="task-manager-backend"
    FRONTEND_CONTAINER="task-manager-frontend"
}

# Load environment and set defaults
load_env
set_defaults

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        echo "Would you like to create one from .env.example? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            cp .env.example .env
            print_success ".env file created from .env.example"
            print_warning "Please edit .env and set required values (JWT_SECRET, POSTGRES_PASSWORD)"
            exit 0
        else
            print_error "Cannot proceed without .env file"
            exit 1
        fi
    fi
}

# Start all services
start() {
    print_info "Starting Task Manager services..."
    check_env
    docker-compose up -d
    print_success "All services started!"
    echo ""
    print_info "Access your application:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3020"
    echo "  Health:   http://localhost:3020/health"
}

# Stop all services
stop() {
    print_info "Stopping Task Manager services..."
    docker-compose down
    print_success "All services stopped!"
}

# Restart services
restart() {
    print_info "Restarting Task Manager services..."
    docker-compose restart
    print_success "All services restarted!"
}

# View logs
logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_info "Showing logs for all services (Ctrl+C to exit)..."
        docker-compose logs -f
    else
        print_info "Showing logs for $service (Ctrl+C to exit)..."
        docker-compose logs -f "$service"
    fi
}

# Rebuild and start
rebuild() {
    print_info "Rebuilding and starting Task Manager services..."
    check_env
    docker-compose up -d --build
    print_success "Services rebuilt and started!"
}

# Clean up everything
clean() {
    print_warning "This will remove all containers, volumes, and data!"
    echo "Are you sure? (yes/no)"
    read -r response
    if [[ "$response" == "yes" ]]; then
        print_info "Cleaning up..."
        docker-compose down -v --remove-orphans
        print_success "Cleanup complete!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Database operations
db_reset() {
    print_warning "This will reset the database and DELETE ALL DATA!"
    echo "Are you sure? (yes/no)"
    read -r response
    if [[ "$response" == "yes" ]]; then
        print_info "Resetting database..."
        docker exec -i "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < docker/db/reset-db.sql
        print_success "Database reset complete!"
    else
        print_info "Database reset cancelled"
    fi
}

db_sample() {
    print_info "Checking if backend container is running..."

    # Check if backend container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
        print_error "Backend container is not running!"
        echo "The backend must be running to ensure tables are created via migrations."
        echo "Start the containers first: ./docker-manager.sh start"
        exit 1
    fi

    # Check if database container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$DB_CONTAINER"; then
        print_error "Database container is not running!"
        echo "Start the containers first: ./docker-manager.sh start"
        exit 1
    fi

    print_info "Checking if database tables exist..."

    # Check if users table exists (indicates migrations have run)
    TABLE_CHECK=$(docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');")

    if [[ "$TABLE_CHECK" != "t" ]]; then
        print_error "Database tables don't exist yet!"
        echo ""
        echo "Tables are created by the backend application via Drizzle migrations."
        echo "Please wait for the backend to finish starting up."
        echo ""
        echo "Check backend logs with:"
        echo "  docker logs -f $BACKEND_CONTAINER"
        echo ""
        echo "Look for the message: 'Database migration complete successfully!'"
        exit 1
    fi

    print_success "Tables exist! Ready to load sample data."
    echo ""
    print_warning "This will insert sample data into the database."
    echo "Sample data includes:"
    echo "  • 5 users (password: password123)"
    echo "  • 3 groups"
    echo "  • 15 sample tasks"
    echo ""
    echo "Continue? (y/n)"
    read -r response

    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Loading sample data..."
        if docker exec -i "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < docker/db/sample_data.sql; then
            print_success "Sample data loaded successfully!"
            echo ""
            echo "You can now log in with:"
            echo "  Username: admin (or john_doe, jane_smith, bob_wilson, alice_jones)"
            echo "  Password: password123"
        else
            print_error "Failed to load sample data!"
            echo "Check the error messages above for details."
            exit 1
        fi
    else
        print_info "Sample data loading cancelled"
    fi
}

db_backup() {
    local filename="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_info "Creating database backup: $filename"
    docker exec "$DB_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$filename"
    print_success "Backup created: $filename"
}

db_restore() {
    local filename=$1
    if [ -z "$filename" ]; then
        print_error "Please provide backup filename: ./docker-manager.sh db:restore <filename>"
        exit 1
    fi
    if [ ! -f "$filename" ]; then
        print_error "Backup file not found: $filename"
        exit 1
    fi
    print_warning "This will restore database from $filename and may overwrite existing data!"
    echo "Are you sure? (yes/no)"
    read -r response
    if [[ "$response" == "yes" ]]; then
        print_info "Restoring database from $filename..."
        cat "$filename" | docker exec -i "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
        print_success "Database restored from $filename"
    else
        print_info "Restore cancelled"
    fi
}

db_shell() {
    print_info "Opening database shell..."
    docker exec -it "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
}

# Health check
health() {
    print_info "Checking service health..."
    echo ""
    docker-compose ps
}

# Show help
show_help() {
    cat << EOF
Task Manager Docker Management Script

Usage: ./docker-manager.sh [command]

Commands:
  start           Start all services
  stop            Stop all services
  restart         Restart all services
  rebuild         Rebuild and start all services
  logs [service]  View logs (all services or specific service)
  health          Check health status of all services
  clean           Remove all containers and volumes (destructive!)

  db:reset        Reset database (destructive!)
  db:sample       Load sample data (must run AFTER backend creates tables)
  db:backup       Create database backup
  db:restore      Restore database from backup
  db:shell        Open PostgreSQL shell

Examples:
  ./docker-manager.sh start
  ./docker-manager.sh logs backend
  ./docker-manager.sh db:sample
  ./docker-manager.sh db:backup
  ./docker-manager.sh db:restore backup_20250101_120000.sql

Note: Sample data can only be loaded after the backend has finished
      running migrations. The script will check for you automatically.

EOF
}

# Main command handler
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        logs "$2"
        ;;
    health)
        health
        ;;
    clean)
        clean
        ;;
    db:reset)
        db_reset
        ;;
    db:sample)
        db_sample
        ;;
    db:backup)
        db_backup
        ;;
    db:restore)
        db_restore "$2"
        ;;
    db:shell)
        db_shell
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac