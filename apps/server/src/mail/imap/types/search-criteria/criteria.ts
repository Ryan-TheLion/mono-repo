import * as Include from './barrel/criteria.include';
import * as Exclude from './barrel/criteria.negative';
import * as Union from './barrel/criteria.union';

type Any = Union.Include | Union.Exclude;

export { type Include, type Exclude, type Union, type Any };
