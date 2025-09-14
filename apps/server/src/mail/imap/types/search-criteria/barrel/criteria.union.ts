import { type FlattenRecordValues } from 'src/common/types';
import {
  type NotHaveArgumentsCriteria,
  type NotHaveArgumentsNegativeCriteria,
} from '../not-have-arguments.criteria';
import {
  type RequireStringCriteria,
  type RequireStringNegativeCriteria,
} from '../require-string.criteria';
import {
  type RequireIntCriteria,
  type RequireIntNegativeCriteria,
} from '../require-int.criteria';
import {
  type RequireUidSetCriteria,
  type RequireUidSetNegativeCriteria,
} from '../require-uid-set.criteria';
import { type OrCriteria, type OrNegativeCriteria } from '../or.criteria';

export type Include =
  | FlattenRecordValues<NotHaveArgumentsCriteria>
  | FlattenRecordValues<RequireStringCriteria>
  | FlattenRecordValues<RequireIntCriteria>
  | FlattenRecordValues<RequireUidSetCriteria>
  | OrCriteria;

export type Exclude =
  | FlattenRecordValues<NotHaveArgumentsNegativeCriteria>
  | FlattenRecordValues<RequireStringNegativeCriteria>
  | FlattenRecordValues<RequireIntNegativeCriteria>
  | FlattenRecordValues<RequireUidSetNegativeCriteria>
  | OrNegativeCriteria;
