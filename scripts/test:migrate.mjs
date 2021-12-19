#!/usr/bin/env zx

await $`npx dotenv -e .env.test -- yarn prisma migrate dev`

