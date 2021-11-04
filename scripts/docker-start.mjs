#!/usr/bin/env zx

if (process.env.BASETOOL_TELEMETRY_DISABLED !== "1") {
  $.verbose = false;

  const ipReq = await fetch("https://api.ipify.org/?format=json");
  const ip = (await ipReq.json())?.ip;

  try {
    fetch("https://api.basetool.io/api/docker/install", {
      method: "post",
      body: JSON.stringify({
        ip,
        hostedSecret: process.env.BASETOOL_HOSTED_SECRET,
      }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {}

  $.verbose = true;
}

await $`yarn prisma migrate deploy`;
