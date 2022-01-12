import Redis from "ioredis";

const getRedisClient = (db: number) => {
  const options = {
    keyPrefix: `basetool_${process.env.NEXT_PUBLIC_APP_ENV}:`,
    lazyConnect: true,
    db,
  };
  const client = new Redis(process.env.REDIS_URL, options);

  return client;
};

export { getRedisClient };
