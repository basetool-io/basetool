// import { logflarePinoVercel } from 'pino-logflare'
import pino from "pino";

// create pino-logflare console stream for serverless functions and send function for browser logs
// Browser logs are going to: https://logflare.app/sources/13989
// Vercel log drain was setup to send logs here: https://logflare.app/sources/13830

// const { stream, send } = logflarePinoVercel({
//   apiKey: 'eA_3wro12LpZ',
//   sourceToken: 'eb1d841a-e0e4-4d23-af61-84465c808157',
// })

// create pino loggger
const logger = pino({
  // browser: {
  //   transmit: {
  //     level: 'info',
  //     // send,
  //   },
  // },
  level: "debug",
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
  },
});

export default logger;
