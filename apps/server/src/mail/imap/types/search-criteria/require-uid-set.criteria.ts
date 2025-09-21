import { type AtLeastOneArray } from 'src/common/types';
import {
  type CriteriaTypeWith,
  type GenericOfCriterialTypeWith,
  type NegativeCriterialTypeWith,
} from './util-type';

export type UidSetCriteria = AtLeastOneArray<string | number>;

export type RequireUidSetCriteria = {
  UID: CriteriaTypeWith<'UID', UidSetCriteria>;
};

export type RequireUidSetNegativeCriteria = {
  [Type in keyof RequireUidSetCriteria]: NegativeCriterialTypeWith<
    Type,
    GenericOfCriterialTypeWith<RequireUidSetCriteria[Type]>['value']
  >;
};
