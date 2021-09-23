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
