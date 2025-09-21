import { type NegativeCriteriaType } from './util-type';

export type NotHaveArgumentsCriteria = {
  ALL: 'ALL';
  ANSWERED: 'ANSWERED';
  DELETED: 'DELETED';
  DRAFT: 'DRAFT';
  FLAGGED: 'FLAGGED';
  NEW: 'NEW';
  SEEN: 'SEEN';
  RECENT: 'RECENT';
  OLD: 'OLD';
  UNANSWERED: 'UNANSWERED';
  UNDELETED: 'UNDELETED';
  UNDRAFT: 'UNDRAFT';
  UNFLAGGED: 'UNFLAGGED';
  UNSEEN: 'UNSEEN';
};

export type NotHaveArgumentsNegativeCriteria = {
  [Type in keyof NotHaveArgumentsCriteria]: NegativeCriteriaType<Type>;
};
