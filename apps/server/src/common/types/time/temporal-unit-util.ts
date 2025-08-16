import { type TemporalUnit } from '.';

export type TemporalUnitValues = TemporalUnit.Second | TemporalUnit.MilliSecond;

type UnitMap = {
  second: TemporalUnit.Second;
  ms: TemporalUnit.MilliSecond;
};

type UnitOf<K extends TemporalUnit.Name> = UnitMap[K];

export class TemporalUnits {
  static of = <K extends TemporalUnit.Name>(
    unit: K,
    amount: number,
  ): UnitOf<K> => {
    return amount as UnitOf<K>;
  };

  static convert = {
    secondToMilliSecond: (second: TemporalUnit.Second) => {
      return this.of('ms', second * 1000);
    },
    milliSecondToSecond: (ms: TemporalUnit.MilliSecond) => {
      return this.of('second', ms / 1000);
    },
  };
}
