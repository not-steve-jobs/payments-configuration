import path from 'path';
import * as fs from 'fs';

import { LoggerDecorator, createLogger, createLoggerConfig } from '@internal/logger-library';
import { IConfig } from '@internal/logger-library/lib/legacy/config';

export async function buildLogger(appRoot: string, config: IConfig): Promise<LoggerDecorator> {
  const pkgString = await fs.promises.readFile(path.join(appRoot, 'package.json'), 'utf8');
  const pkg = JSON.parse(pkgString);
  const loggerConfig = createLoggerConfig({ pkg, config });

  return createLogger(loggerConfig);
}
