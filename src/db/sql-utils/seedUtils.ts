import { DeepPartial, EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

export function createList<Entity>(
  manager: EntityManager,
  entityClass: EntityTarget<ObjectLiteral>,
  entityLikeList: DeepPartial<Entity>[]
): Promise<DeepPartial<Entity>[] & ObjectLiteral> {
  const repository = manager.getRepository(entityClass);
  const entityList = repository.create(entityLikeList);
  return repository.save(entityList as DeepPartial<Entity>[], { reload: true });
}
