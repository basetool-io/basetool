
const startServer = `yarn test:start-server`
const startCypress = "yarn cypress open"

await $`concurrently ${startServer} ${startCypress}`
