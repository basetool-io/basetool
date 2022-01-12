import { REDIS_CACHE_DB } from "@/lib/constants";
import { ValueType } from "ioredis";
import { getRedisClient } from "@/lib/redis";
import { isUndefined } from "lodash";

class CacheDriver {
  public redis;

  constructor() {
    this.redis = getRedisClient(REDIS_CACHE_DB);
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
      await this.set({
        key,
        value: JSON.stringify(result),
        time: options.expiresIn,
        expiryMode: "EX",
      });
    } else {
      await this.set({ key, value: JSON.stringify(result) });
    }

    // Return the result
    return result;
  }
}

const cache = new CacheDriver();

export default cache;
