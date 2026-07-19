import Redis, { type RedisOptions } from 'ioredis';

export function createRedisClient(
  url: string,
  options: RedisOptions = {}
): Redis {
  return new Redis(url, options);
}
