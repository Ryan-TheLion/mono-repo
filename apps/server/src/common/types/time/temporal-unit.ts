declare const __unit: unique symbol;

export type Name = 'second' | 'ms';

type Brand<B extends Name> = { [__unit]: B };

type Branded<T, B extends Name> = T & Brand<B>;

export type Second = Branded<number, 'second'>;

export type MilliSecond = Branded<number, 'ms'>;
