#!/usr/bin/env zx

const dotenvBin = await $`yarn bin dotenv`
console.log('dotenvBin->', dotenvBin)

await $`npx dotenv -e .env.test -- yarn prisma migrate dev`

