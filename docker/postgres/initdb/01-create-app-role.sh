#!/usr/bin/env bash
# Runs once on first container start (docker-entrypoint-initdb.d convention).
# POSTGRES_USER is a superuser used only to bootstrap the container; the
# application (and Flyway migrations) run as APP_DB_USER instead, which is a
# plain role scoped to this database only (no SUPERUSER/CREATEDB/CREATEROLE).
set -euo pipefail

: "${APP_DB_USER:?APP_DB_USER is required}"
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	DO
	\$\$
	BEGIN
	    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${APP_DB_USER}') THEN
	        CREATE ROLE "${APP_DB_USER}" WITH LOGIN PASSWORD '${APP_DB_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
	    END IF;
	END
	\$\$;

	GRANT CONNECT ON DATABASE "${POSTGRES_DB}" TO "${APP_DB_USER}";
	GRANT USAGE, CREATE ON SCHEMA public TO "${APP_DB_USER}";
	ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${APP_DB_USER}";
EOSQL
