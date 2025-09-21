import { type NotHaveArgumentsNegativeCriteria } from '../not-have-arguments.criteria';
import { type RequireStringNegativeCriteria } from '../require-string.criteria';
import { type RequireIntNegativeCriteria } from '../require-int.criteria';
import { type RequireUidSetNegativeCriteria } from '../require-uid-set.criteria';
import { type OrNegativeCriteria } from '../or.criteria';

/// NotHaveArgumentsNegativeCriteria

export type ALL = NotHaveArgumentsNegativeCriteria['ALL'];
export type ANSWERED = NotHaveArgumentsNegativeCriteria['ANSWERED'];
export type DELETED = NotHaveArgumentsNegativeCriteria['DELETED'];
export type DRAFT = NotHaveArgumentsNegativeCriteria['DRAFT'];
export type FLAGGED = NotHaveArgumentsNegativeCriteria['FLAGGED'];
export type NEW = NotHaveArgumentsNegativeCriteria['NEW'];
export type SEEN = NotHaveArgumentsNegativeCriteria['SEEN'];
export type RECENT = NotHaveArgumentsNegativeCriteria['RECENT'];
export type OLD = NotHaveArgumentsNegativeCriteria['OLD'];
export type UNANSWERED = NotHaveArgumentsNegativeCriteria['UNANSWERED'];
export type UNDELETED = NotHaveArgumentsNegativeCriteria['UNDELETED'];
export type UNDRAFT = NotHaveArgumentsNegativeCriteria['UNDRAFT'];
export type UNFLAGGED = NotHaveArgumentsNegativeCriteria['UNFLAGGED'];
export type UNSEEN = NotHaveArgumentsNegativeCriteria['UNSEEN'];

/// RequireStringNegativeCriteria

export type BCC = RequireStringNegativeCriteria['BCC'];
export type CC = RequireStringNegativeCriteria['CC'];
export type FROM = RequireStringNegativeCriteria['FROM'];
export type SUBJECT = RequireStringNegativeCriteria['SUBJECT'];
export type TO = RequireStringNegativeCriteria['TO'];
export type BODY = RequireStringNegativeCriteria['BODY'];
export type TEXT = RequireStringNegativeCriteria['TEXT'];
export type KEYWORD = RequireStringNegativeCriteria['KEYWORD'];
export type HEADER = RequireStringNegativeCriteria['HEADER'];

export type BEFORE = RequireStringNegativeCriteria['BEFORE'];
export type ON = RequireStringNegativeCriteria['ON'];
export type SINCE = RequireStringNegativeCriteria['SINCE'];
export type SENTBEFORE = RequireStringNegativeCriteria['SENTBEFORE'];
export type SENTON = RequireStringNegativeCriteria['SENTON'];
export type SENTSINCE = RequireStringNegativeCriteria['SENTSINCE'];

/// RequireIntNegativeCriteria

export type LARGER = RequireIntNegativeCriteria['LARGER'];
export type SMALLER = RequireIntNegativeCriteria['SMALLER'];

/// RequireUidSetNegativeCriteria

export type UID = RequireUidSetNegativeCriteria['UID'];

/// OrCriteria

export type OR = OrNegativeCriteria;
