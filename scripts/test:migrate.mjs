#!/usr/bin/env zx

await $`yarn dotenv -e .env.test -- yarn prisma migrate dev`
