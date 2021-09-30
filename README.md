# Basetool.io

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Install

```bash
yarn install
cp .env.sample .env
# edit your .env and
# set your DATABASE_URL
# generate a SECRET with openssl rand -hex 32
yarn prisma migrate dev
# seed
SEED_PASSWORD=secret yarn prisma db seed --preview-feature
```

You may now log in with `ted.lasso@apple.com` and password `secret`.

There's also a `prisma/sample-seed.sql` file that you can use to create a sample database.

## Run

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Development

We're using [google/zx](https://github.com/google/zx) to help us run scripts.

## Timezones

`.env` holds the `TZ=UTC` entry to simulate server conditions (`TZ=UTC`).

# Testing

## Setup

```bash
cp .env.test.sample .env.test
```

Update `YOUR_USERNAME` to match to your current username. Also make sure you have seeded the `sample-seed.sql` mentioned above.

### Setup the database

Create a testing database `basetool_test`. Add those credentials in your `.env.test` file.

Run `yarn test:migrate` for your initial and subsequent migrations.

### Testing env

We're going to run a separate server for our testing needs on port `4099`.

### Seeding


## Run Cypress

To run both the test server and cypress run `yarn test:start-cypress`.

## Emails

When on production, emails will be sent using mailgun. On all other environments (event vercel preview) you will need a [mailtrap.io](https://mailtra.io) account. Fill in the `MAILTRAP_USERNAME` and `MAILTRAP_PASSWORD` variables.
