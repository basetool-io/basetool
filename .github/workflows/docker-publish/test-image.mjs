#!/usr/bin/env zx

const port = process.env.PORT;
const url = `http://localhost:${port}/api/hello`;
const ipReq = await fetch(url);
const response = await ipReq.json();

if (!response || response.hi !== "there") {
  console.log(`The reponse is not valid (${JSON.stringify(response)}).`);
  process.exit(1);
}

console.log(`The reponse is valid 🎉.`);
