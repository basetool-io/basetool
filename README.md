<p align="center">
  <a href="https://www.basetool.io/">
    <img src="https://user-images.githubusercontent.com/23171533/139704386-947777e3-1837-402d-afbf-372e2094a585.png">
  </a>
</p>

# Basetool

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
SEED_PASSWORD=secret yarn prisma db seed
```

You may now log in with `ted.lasso@apple.com` and password `secret`. The seed script will not seed a datasource. Only the user and it's organization.

There's also a `prisma/sample-seed.sql` file that you can use to create a sample database.

## Run

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Emails

Your `.env` file uld have the `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASSWORD` variables filled in. For development and staging we can use [mailtrap](https://mailtrap.io/). On production we use AWS SES.

# Development

<p align="center">
<img width="300" src="https://user-images.githubusercontent.com/23171533/139704318-219f1f2b-84d7-439e-88e8-3a45c2fdb6fd.png"/>
</p>

---

# Supabase

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

### Migrations & Seeding

To migrate changes to your test db run `yarn test:migrate`. Cypress will automatically seed the test DB for you on each test start.

## Run Cypress

To run both the test server and cypress locally run `yarn test:start-cypress`.

