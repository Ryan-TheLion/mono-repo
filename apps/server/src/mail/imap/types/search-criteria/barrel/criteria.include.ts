import { type NotHaveArgumentsCriteria } from '../not-have-arguments.criteria';
import { type RequireStringCriteria } from '../require-string.criteria';
import { type RequireIntCriteria } from '../require-int.criteria';
import { type RequireUidSetCriteria } from '../require-uid-set.criteria';
import { type OrCriteria } from '../or.criteria';

/// NotHaveArgumentsCriteria

export type ALL = NotHaveArgumentsCriteria['ALL'];
export type ANSWERED = NotHaveArgumentsCriteria['ANSWERED'];
export type DELETED = NotHaveArgumentsCriteria['DELETED'];
export type DRAFT = NotHaveArgumentsCriteria['DRAFT'];
export type FLAGGED = NotHaveArgumentsCriteria['FLAGGED'];
export type NEW = NotHaveArgumentsCriteria['NEW'];
export type SEEN = NotHaveArgumentsCriteria['SEEN'];
export type RECENT = NotHaveArgumentsCriteria['RECENT'];
export type OLD = NotHaveArgumentsCriteria['OLD'];
export type UNANSWERED = NotHaveArgumentsCriteria['UNANSWERED'];
export type UNDELETED = NotHaveArgumentsCriteria['UNDELETED'];
export type UNDRAFT = NotHaveArgumentsCriteria['UNDRAFT'];
export type UNFLAGGED = NotHaveArgumentsCriteria['UNFLAGGED'];
export type UNSEEN = NotHaveArgumentsCriteria['UNSEEN'];

/// RequireStringCriteria

export type BCC = RequireStringCriteria['BCC'];
export type CC = RequireStringCriteria['CC'];
export type FROM = RequireStringCriteria['FROM'];
export type SUBJECT = RequireStringCriteria['SUBJECT'];
export type TO = RequireStringCriteria['TO'];
export type BODY = RequireStringCriteria['BODY'];
export type TEXT = RequireStringCriteria['TEXT'];
export type KEYWORD = RequireStringCriteria['KEYWORD'];
export type HEADER = RequireStringCriteria['HEADER'];

export type BEFORE = RequireStringCriteria['BEFORE'];
export type ON = RequireStringCriteria['ON'];
export type SINCE = RequireStringCriteria['SINCE'];
export type SENTBEFORE = RequireStringCriteria['SENTBEFORE'];
export type SENTON = RequireStringCriteria['SENTON'];
export type SENTSINCE = RequireStringCriteria['SENTSINCE'];

/// RequireIntCriteria

export type LARGER = RequireIntCriteria['LARGER'];
export type SMALLER = RequireIntCriteria['SMALLER'];

/// RequireUidSetCriteria

export type UID = RequireUidSetCriteria['UID'];

/// OrCriteria

export type OR = OrCriteria;
