import { type DynamicModule } from '@nestjs/common';

export type ModuleDI = Required<
  Pick<DynamicModule, 'imports' | 'providers' | 'controllers' | 'exports'>
>;

export type ModuleDIfield = {
  import: ModuleDI['imports'][number];
  provider: ModuleDI['providers'][number];
  controller: ModuleDI['controllers'][number];
  export: ModuleDI['exports'][number];
};

export type OptionalModuleDI = Partial<ModuleDI>;

export type OptionalModuleDIfield = {
  import?: ModuleDIfield['import'];
  provider?: ModuleDIfield['provider'];
  controller?: ModuleDIfield['controller'];
  export?: ModuleDIfield['export'];
};
