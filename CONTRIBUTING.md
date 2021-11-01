
# Contributing

If you happened to come across a bug or want to suggest a feature, feel free to [say something](https://github.com/basetool-io/basetool/issues/new)!

If you'd like to contribute code, the steps below will help you get up and running.

## Forking & branches

Please fork Basetool and create a descriptive branch for your feature or fix.

## Getting your local environment set up

### Install

```bash
yarn install
cp .env.sample .env
# edit your .env and
# set your DATABASE_URL
# generate a SECRET with openssl rand -hex 32
yarn prisma migrate dev
# seed
SEED_PASSWORD=secret yarn prisma db seed
```

You may now log in with `ted.lasso@apple.com` and password `secret`. The seed script will not seed a datasource. Only the user and it's organization.

There's also a `prisma/sample-seed.sql` file that you can use to create a sample database.

### Run

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Emails

Your `.env` file uld have the `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASSWORD` variables filled in. For development and staging we can use [mailtrap](https://mailtrap.io/). On production we use AWS SES.

## Development

We're using [google/zx](https://github.com/google/zx) to help us run scripts.

### Timezones

`.env` holds the `TZ=UTC` entry to simulate server conditions (`TZ=UTC`).
