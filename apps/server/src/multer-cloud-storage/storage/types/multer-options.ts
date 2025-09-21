import { type MulterModuleOptions } from '@nestjs/platform-express';

type Options = Required<MulterModuleOptions>;

export type Limits = Options['limits'];
