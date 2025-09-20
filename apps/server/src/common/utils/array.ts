type SwapDefaultDelimiter = '<->';

export type SwapPattern<Delimiter extends string> =
  `${number} ${Delimiter} ${number}`;

type SwapPatternIndexing = '0-based' | '1-based';

export const shuffle = <T extends Array<any>>(array: T) => {
  let clone = [...array];

  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    clone = swap(`${i} <-> ${j}`, '0-based')(clone);
  }

  return clone;
};

/**
 * 배열의 두 원소를 swap 하는 함수
 *
 * - swap된 배열의 복사본을 반환
 *
 * @example
 * ```ts
 * const arr = ['a', 'b', 'c', 'd'];
 *
 * const i = 1;
 * const j = 4;
 *
 * // 1-based-indexing
 * swap(`${i} <-> ${j}`)(arr); // ['d', 'b', 'c', 'a']
 * swap(`${i} <-> ${j}`, '1-based')(arr); // ['d', 'b', 'c', 'a']
 *
 * // 0-based-indexing
 * swap(`${i} <-> ${j}`, '0-based')(arr); // error (0-based-indexing일 경우 4는 ['a', 'b', 'c', 'd'] 배열의 유효한 인덱스 범위가 아님)
 * swap('0 <-> 3', '0-based')(arr); // ['d', 'b', 'c', 'a']
 *
 * // custom delimiter(type safe)
 * swap<SwapPattern<','>>(`${i} <-> ${j}`)(arr); // type error
 * swap<SwapPattern<','>>(`${i} , ${j}`)(arr); // ['d', 'b', 'c', 'a']
 * ```
 */
export const swap = <
  Pattern extends SwapPattern<string> = SwapPattern<SwapDefaultDelimiter>,
>(
  pattern: Pattern,
  indexing: SwapPatternIndexing = '1-based',
) => {
  const segments = pattern.split(' ');

  if (segments.length !== 3)
    throw new Error(`패턴('${pattern}')은 유효한 swap 패턴이 아닙니다`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [i, delimiter, j] = segments;

  const basedIndex = indexing === '0-based' ? 0 : 1;

  const isIndex = (n: string) => {
    const num = Number(n);

    const integer = Number.isInteger(num) ? num : null;

    if (integer === null) return false;

    return integer >= basedIndex;
  };

  if (!isIndex(i) || !isIndex(j))
    throw new Error(
      `인덱스는 ${basedIndex} 보다 크거나 같은 정수이어야 합니다 (pattern: '${pattern}')`,
    );

  return <TargetArray extends Array<any>>(array: TargetArray) => {
    const [indexI, indexJ] = [Number(i) - basedIndex, Number(j) - basedIndex];

    if (indexI > array.length - 1 || indexJ > array.length - 1)
      throw new Error(
        `인덱스는 배열의 length 보다 클 수 없습니다 (pattern: '${pattern}', indexing: ${indexing}, array: ${JSON.stringify(array)}, length: ${array.length})`,
      );

    const clone = [...array];

    [clone[indexI], clone[indexJ]] = [clone[indexJ], clone[indexI]];

    return clone;
  };
};
