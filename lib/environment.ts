const inDevelopment = process.env.NODE_ENV === "development";
const inProduction = process.env.NODE_ENV === "production";

export { inDevelopment, inProduction };
