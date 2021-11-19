import { REDIS_OPTIONS_DB } from "@/lib/constants";
import { isUndefined } from "lodash";
import Redis, { ValueType } from "ioredis";

class Options {
  public redis;

  constructor({ url }: { url: string }) {
    const options = {
      keyPrefix: `basetool_${process.env.NODE_ENV}:`,
      lazyConnect: true,
      db: REDIS_OPTIONS_DB,
    };
    this.redis = new Redis(url, options);
  }

  public async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  public async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) !== 0;
  }

  public async set(
    key: string,
    value: ValueType,
    options: {
      expiryMode?: "EX";
      time?: number;
    } = {
      expiryMode: "EX",
    }
  ) {
    if (!isUndefined(options.time)) {
      return this.redis.set(key, value, options.expiryMode, options.time);
    }

    return this.redis.set(key, value);
  }
}

const options = new Options({ url: process.env.REDIS_URL as string });

export default options;
