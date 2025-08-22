import {
  type BuilderCommandNames,
  type Builder,
  type BuilderCommand,
} from '../types';

export const createBuilder = <T extends Record<any, any>>(): Builder<T> => {
  const data: Partial<T> = {};

  const handler: ProxyHandler<Builder<T>> = {
    get(target, prop: keyof T | BuilderCommandNames) {
      if (prop === 'build') {
        return () => ({ ...data });
      }

      if (prop === 'defaults') {
        return ((defaults) => ({
          build: () => ({ ...data, ...defaults }),
        })) as BuilderCommand.SetDefault<T>;
      }

      return (value: Required<T>[keyof T]) => {
        data[prop] = value;

        return new Proxy({} as Builder<T>, handler);
      };
    },
  };

  return new Proxy({} as Builder<T>, handler);
};
