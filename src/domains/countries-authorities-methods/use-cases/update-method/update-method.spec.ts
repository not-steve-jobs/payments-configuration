import casual from 'casual';

import { MethodRepository } from '@infra';
import { MethodEntity } from '@core';

import { UpdateMethod, UpdateMethodOptions } from './update-method';

describe('UpdateMethod', () => {
  let dependencies: UpdateMethodOptions;
  let useCase: UpdateMethod;

  beforeEach(() => {
    dependencies  = { methodRepository: mock<MethodRepository>({}) };
    useCase = new UpdateMethod(dependencies);
  });

  it('Should create a new Method if not found', async () => {
    const methodDto = { name: 'name', code: 'code', description: 'description' };
    const methodEntity = mock<MethodEntity>({
      id: casual.uuid, ...methodDto,
    });
    dependencies.methodRepository.findOne = jest.fn().mockResolvedValue(undefined);
    dependencies.methodRepository.create = jest.fn().mockResolvedValue(methodEntity);
    dependencies.methodRepository.update = jest.fn().mockResolvedValue(undefined);

    const result = await useCase.execute(methodDto);

    expect(result).toStrictEqual(methodDto);
    expect(dependencies.methodRepository.findOne).toBeCalledOnceWith({ code: 'code' });
    expect(dependencies.methodRepository.create).toBeCalledOnceWith({ id: expect.toBeGUID(), ...methodDto });
    expect(dependencies.methodRepository.update).not.toHaveBeenCalled();
  });

  it('Should update a Method', async () => {
    const methodDto = { name: 'name_new', code: 'code', description: 'description' };
    const oldMethodEntity = mock<MethodEntity>({
      id: casual.uuid, code: 'code', name: 'name_old', description: 'description',
    });
    const updatedMethodEntity = mock<MethodEntity>({
      id: casual.uuid, code: 'code', name: 'name_new', description: 'description',
    });
    dependencies.methodRepository.findOne = jest.fn().mockResolvedValue(oldMethodEntity);
    dependencies.methodRepository.create = jest.fn().mockResolvedValue(undefined);
    dependencies.methodRepository.update = jest.fn().mockResolvedValue(updatedMethodEntity);

    const result = await useCase.execute(methodDto);

    expect(result).toStrictEqual(methodDto);
    expect(dependencies.methodRepository.findOne).toBeCalledOnceWith({ code: 'code' });
    expect(dependencies.methodRepository.create).not.toHaveBeenCalled();
    expect(dependencies.methodRepository.update).toBeCalledOnceWith(expect.toBeGUID(), { id: expect.toBeGUID(), ...methodDto });
  });
});
