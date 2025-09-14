import {
  type GenericOfCriterialTypeWith,
  type NegativeCriterialTypeWith,
  type CriteriaTypeWith,
} from './util-type';

type StringCriteria = {
  BCC: CriteriaTypeWith<'BCC', string>;
  CC: CriteriaTypeWith<'CC', string>;
  FROM: CriteriaTypeWith<'FROM', string>;
  SUBJECT: CriteriaTypeWith<'SUBJECT', string>;
  TO: CriteriaTypeWith<'TO', string>;
  BODY: CriteriaTypeWith<'BODY', string>;
  TEXT: CriteriaTypeWith<'TEXT', string>;
  KEYWORD: CriteriaTypeWith<'KEYWORD', string>;
  HEADER: CriteriaTypeWith<'HEADER', [string, string]>;
};

type RequireDateStringCriteria = {
  BEFORE: CriteriaTypeWith<'BEFORE', string>;
  ON: CriteriaTypeWith<'ON', string>;
  SINCE: CriteriaTypeWith<'SINCE', string>;
  SENTBEFORE: CriteriaTypeWith<'SENTBEFORE', string>;
  SENTON: CriteriaTypeWith<'SENTON', string>;
  SENTSINCE: CriteriaTypeWith<'SENTSINCE', string>;
};

export type RequireStringCriteria = StringCriteria & RequireDateStringCriteria;

export type RequireStringNegativeCriteria = {
  [Type in keyof RequireStringCriteria]: NegativeCriterialTypeWith<
    Type,
    GenericOfCriterialTypeWith<RequireStringCriteria[Type]>['value']
  >;
};
