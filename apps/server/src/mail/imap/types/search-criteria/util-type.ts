import { type UidSetCriteria } from './require-uid-set.criteria';

export type NegativeCriteriaType<Type extends string> = `!${Type}`;

export type GenericOfCriterialTypeWith<TypeWith> = TypeWith extends [
  infer Type,
  ...infer V,
]
  ? { type: Type; value: V extends [infer I] ? I : V }
  : never;

export type CriteriaTypeWith<
  Type extends string,
  Value extends string | number | [string, string] | UidSetCriteria,
> = Value extends [string, string] | UidSetCriteria
  ? [Type, ...Value]
  : [Type, Value];

export type NegativeCriterialTypeWith<
  Type extends string,
  Value extends string | number | [string, string] | UidSetCriteria,
> = Value extends [string, string] | UidSetCriteria
  ? [NegativeCriteriaType<Type>, ...Value]
  : [NegativeCriteriaType<Type>, Value];
