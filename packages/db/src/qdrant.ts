import { QdrantClient } from '@qdrant/js-client-rest';

type QdrantClientConfig = ConstructorParameters<typeof QdrantClient>[0];

export function createQdrantClient(config: QdrantClientConfig): QdrantClient {
  return new QdrantClient(config);
}
