import { type FlattenRecordValues } from 'src/common/types';
import { type NegativeCriteriaType } from './util-type';
import {
  type NotHaveArgumentsCriteria,
  type NotHaveArgumentsNegativeCriteria,
} from './not-have-arguments.criteria';
import {
  type RequireStringCriteria,
  type RequireStringNegativeCriteria,
} from './require-string.criteria';
import {
  type RequireIntCriteria,
  type RequireIntNegativeCriteria,
} from './require-int.criteria';
import {
  type RequireUidSetCriteria,
  type RequireUidSetNegativeCriteria,
} from './require-uid-set.criteria';

type Type = 'OR';

type Criteria = {
  Include:
    | FlattenRecordValues<NotHaveArgumentsCriteria>
    | FlattenRecordValues<RequireStringCriteria>
    | FlattenRecordValues<RequireIntCriteria>
    | FlattenRecordValues<RequireUidSetCriteria>;

  Exclude:
    | FlattenRecordValues<NotHaveArgumentsNegativeCriteria>
    | FlattenRecordValues<RequireStringNegativeCriteria>
    | FlattenRecordValues<RequireIntNegativeCriteria>
    | FlattenRecordValues<RequireUidSetNegativeCriteria>;
};

type Value = {
  Include: [Criteria['Include'], Criteria['Include']];
  Exclude: [Criteria['Exclude'], Criteria['Exclude']];
};

export type OrCriteria = [Type, ...Value['Include']];

export type OrNegativeCriteria = [
  NegativeCriteriaType<Type>,
  ...Value['Exclude'],
];
