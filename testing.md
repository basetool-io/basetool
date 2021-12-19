# Testing

### Requirements

`npm install -g zx`

## `.env` file

Copy the file using `cp .env.text.sample .env.test`.

## Database

### Migration

Update `DATABASE_URL` in your `.env` file. Create another database to test on using the `prisma/sample-seed.sql` file. That usually goes in the `avodemo_development` DB.
Run `npx zx ./scripts/test:migrate.mjs` to migrate your test DB `basetool_test`.

### Seed

Run `SEED_PASSWORD=secret npx dotenv -e .env.test -- yarn prisma db seed` to seed the test DB.

