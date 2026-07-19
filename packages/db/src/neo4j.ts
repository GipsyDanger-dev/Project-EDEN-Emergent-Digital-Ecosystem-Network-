import neo4j, { type AuthToken, type Config, type Driver } from 'neo4j-driver';

export function createNeo4jDriver(
  uri: string,
  auth: AuthToken,
  config: Config = {}
): Driver {
  return neo4j.driver(uri, auth, config);
}
