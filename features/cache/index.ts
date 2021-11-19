import { REDIS_CACHE_DB } from "@/lib/constants"
import { isUndefined } from "lodash";
import Redis, { ValueType } from "ioredis";

class CacheDriver {
  public redis;

  constructor({ url }: { url: string }) {
    const options = {
      keyPrefix: `basetool_${process.env.NODE_ENV}:`,
      lazyConnect: true,
      db: REDIS_CACHE_DB,
    };
    this.redis = new Redis(url, options);
  }

  public async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  public async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) !== 0;
  }

  public async set({
    key,
    value,
    expiryMode = "EX",
    time,
  }: {
    key: string;
    value: ValueType;
    expiryMode?: "EX";
    time?: number;
  }) {
    if (!isUndefined(time)) {
      return this.redis.set(key, value, expiryMode, time);
    }

    return this.redis.set(key, value);
  }

  public async fetch<T>({
    key,
    options = { fresh: false },
    callback,
  }: {
    key: string;
    options?: { fresh?: boolean; expiresIn?: number };
    callback: () => any;
    expiryMode?: "EX";
    time?: number;
  }): Promise<T> {
    if (options.fresh !== true && (await this.exists(key))) {
      const response = await this.get(key);
      if (response) {
        return JSON.parse(response);
      }

      return response as any;
    }

    // Run the callback
    const result = await callback();

    // Store the result
    if (!isUndefined(options.expiresIn)) {
      await this.set({ key, value: JSON.stringify(result), time: options.expiresIn, expiryMode: 'EX' });
    } else{
      await this.set({ key, value: JSON.stringify(result)});
    }

    // Return the result
    return result;
  }
}

const cache = new CacheDriver({ url: process.env.REDIS_URL as string });

export default cache;
