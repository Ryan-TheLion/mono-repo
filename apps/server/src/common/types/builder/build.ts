import { type BuilderCommand } from '.';
import { type RequiredKeys, type OptionalKeys } from '../object';
import { type EmptyObject } from '../primitive';

export type BuilderCommandNames = 'build' | 'defaults';

type OptionalFieldsFulfilled<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T = never,
> =
  Omit<Pick<T, OptionalKeys<T>>, ResolvedKeys> extends EmptyObject
    ? true
    : false;

type CanCommitBuilder<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T = never,
> = RequiredKeys<T> extends ResolvedKeys ? true : false;

export type BuildResult<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T,
  ResolvedDefaultKeys extends keyof T = never,
> = Required<Pick<T, ResolvedKeys | ResolvedDefaultKeys>> &
  Omit<T, ResolvedKeys | ResolvedDefaultKeys>;

type BuilderCommandMap<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T,
> = {
  build: BuilderCommand.Build<T, ResolvedKeys>;
  defaults: BuilderCommand.SetDefault<T, ResolvedKeys>;
};

type BuilderActivedCommands<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T,
> =
  CanCommitBuilder<T, ResolvedKeys> extends true
    ? Pick<BuilderCommandMap<T, ResolvedKeys>, 'build'> &
        (OptionalFieldsFulfilled<T, ResolvedKeys> extends false
          ? Pick<BuilderCommandMap<T, ResolvedKeys>, 'defaults'>
          : EmptyObject)
    : EmptyObject;

type BuilderChainMethod<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T = never,
> = {
  [Prop in Exclude<keyof T, ResolvedKeys>]: (
    value: Required<T>[Prop],
  ) => Builder<T, ResolvedKeys | Prop>;
};

export type Builder<
  T extends Record<any, any>,
  ResolvedKeys extends keyof T = never,
> = BuilderChainMethod<T, ResolvedKeys> &
  BuilderActivedCommands<T, ResolvedKeys>;
