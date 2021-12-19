
const startServer = `NODE_ENV=test PORT=4099 next dev -p 4099`
const startCypress = "yarn cypress open"

await $`concurrently ${startServer} ${startCypress}`
