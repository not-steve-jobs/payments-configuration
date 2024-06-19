import Knex from 'knex';
import { Knex as KnexNS } from 'knex/types';

import { DataSource } from '@core';

export abstract class KnexDataSource implements DataSource<KnexNS> {
  readonly #config: KnexNS.Config;
  #knex: KnexNS | null = null;

  protected constructor(config: KnexNS.Config) {
    this.#config = config;
  }

  public getDataSource(): KnexNS {
    if (!this.#knex) {
      this.#knex = Knex(this.#config);
    }

    return this.#knex;
  }
}
