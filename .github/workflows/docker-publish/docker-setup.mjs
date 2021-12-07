#!/usr/bin/env zx
const YAML = require("yaml");

const file = fs.readFileSync(
  "./../../../deploy/docker/docker-compose.yml",
  "utf8"
);
const parsed = YAML.parse(file);

parsed.services.app.image = `${process.env.DOCKER_IMAGE_NAME}:${process.env.DOCKER_IMAGE_TAG}`;
parsed.services.database = {
  image: "postgres",
  ports: ["5432:5432"],
  environment: {
    POSTGRES_USER: "basetool",
    POSTGRES_PASSWORD: "basetool",
    POSTGRES_DB: "basetool",
  },
};

fs.writeFileSync(
  "./../../../deploy/docker/docker-compose.yml",
  YAML.stringify(parsed)
);

console.log(`The docker-compose.yml file has been updated 🎉`);
