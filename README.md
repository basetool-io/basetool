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
```

## Run

```bash
yarn dev
```

Open [http://localhost:3099](http://localhost:3099) with your browser to see the result.
