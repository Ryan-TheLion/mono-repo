import {
  type GenericOfCriterialTypeWith,
  type NegativeCriterialTypeWith,
  type CriteriaTypeWith,
} from './util-type';

export type RequireIntCriteria = {
  LARGER: CriteriaTypeWith<'LARGER', number>;
  SMALLER: CriteriaTypeWith<'SMALLER', number>;
};

export type RequireIntNegativeCriteria = {
  [Type in keyof RequireIntCriteria]: NegativeCriterialTypeWith<
    Type,
    GenericOfCriterialTypeWith<RequireIntCriteria[Type]>['value']
  >;
};
