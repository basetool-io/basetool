#!/usr/bin/env zx

const dotenvBin = await $`yarn bin dotenv`

await $`${dotenvBin} -e .env.test -- yarn prisma migrate dev`

