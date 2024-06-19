# payments-configuration-management-service

---

## Test Execution.

To setup the database with data required for component tests use the following command:

```
docker-compose up
```

```
npm run test:setup-test-db
```

The above script will handle the recreation of the database, and running the migrations and seeds.

To execute component tests, use the following command:

```
npm run test:component
```

The script internally launches a child process named start:test.

For improved performance and to eliminate the need for a separate process when running the test:component script, utilize the command:

```
npm run start:test
```

This allows us to run tests independently without incurring the overhead of a child process while the service process is active.

## Database Migrations

This project uses TypeORM for database migrations. The following scripts are available to manage migrations:

### Generating Migrations

To generate a new migration based on changes in the database schema, use the `migration:generate` script. You need to provide a name for the migration as a command line argument.

```bash
npm run migration:generate --name=<MigrationName>
```

### Creating MigrationsTo

create a new, empty migration file, use the migration:create script. You need to provide a name for the migration as a command line argument.

```bash
npm run migration:create --name=<MigrationName>
```

### Running MigrationsTo

run all pending migrations and apply them to the database, use the migration:up script.

```bash
npm run migration:up
```

### Reverting Migrations

To revert the last applied migration, use the migration:down script.

```bash
npm run migration:down
```

## Production start

Use provided docker image for production startup

### Production migrations

- The STARTUP_MODE environment variable determines whether the application runs normally or executes database migrations. Set it to `migration` to run migrations and to production (or leave it unset) to start the application.

example.

```bash
docker run --rm --name my-app-migrations -e STARTUP_MODE=migration my-app-image:latest

```

### Remark for VPN Users

If your project requires access to internal repositories or services over a VPN, ensure that the Docker build process has access to the VPN connection. When using Docker Compose, you can configure the `network_mode: host` for the app service to use the host's network stack, which includes the VPN connection. Here is an

example for build command:

```bash
docker build -t my-app --network host .
```

example configuration for Docker Compose:

```yaml
version: '3.1'

services:
  app:
    build:
      context: .
    network_mode: host
```
