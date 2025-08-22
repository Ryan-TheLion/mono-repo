import { type RequiredKeys, type OptionalKeys } from '../object';
import { type BuildResult } from './build';

export type SetDefault<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T = RequiredKeys<T>,
> = <Defaults extends Omit<Pick<T, OptionalKeys<T>>, ResolvedKeys>>(
  defaults: Defaults,
) => {
  build: Build<T, ResolvedKeys, keyof Defaults>;
};

export type Build<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T = never,
  ResolvedDefaultKeys extends keyof T = never,
> = () => BuildResult<T, ResolvedKeys, ResolvedDefaultKeys>;
