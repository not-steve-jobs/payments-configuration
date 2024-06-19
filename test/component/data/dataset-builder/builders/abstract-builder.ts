import { createHash, randomUUID } from 'crypto';

import { Entity } from '@core';
import { DbTable } from '@internal/component-test-library';

export abstract class Builder<T extends Entity> {
  public readonly abstract tableName: DbTable;
  private entity: T | null = null;

  get getEntity(): T | null {
    return this.entity;
  }

  protected isUndefined(value: unknown): value is undefined {
    return typeof value === 'undefined';
  }

  protected getRandomLetters(length: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      result += alphabet.charAt(randomIndex);
    }

    return result;
  }

  protected getRandomWord(length: number = 16): string {
    const hash = createHash('sha256');

    hash.update(randomUUID());

    return hash.digest('hex').slice(0, length);
  }

  protected abstract getNewEntity(payload: Partial<T>): T;

  protected getValueOrDefault<U>(value: U | undefined, defaultValue: U): U {
    if (typeof value !== 'undefined') {
      return value;
    }

    return defaultValue;
  }

  public build<U extends Builder<T>>(payload: Partial<T>): U {
    if (!this.entity) {
      this.entity = this.getNewEntity(payload);
    } else {
      this.entity = { ...this.entity, ...payload };
    }

    return this as unknown as U;
  }
}
