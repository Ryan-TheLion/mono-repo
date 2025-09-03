const FileSizeUnit = {
  Byte: 0,
  KiB: 10,
  MiB: 20,
  GiB: 30,
} as const satisfies Record<string, number>;

const FileSizeUnitKey = {
  Byte: 'Byte',
  KB: 'KiB',
  MB: 'MiB',
  GB: 'GiB',
} as const satisfies Record<string, keyof typeof FileSizeUnit>;

export const toKibiByte = (
  amount: number,
  unit: keyof typeof FileSizeUnitKey,
) => {
  const exponent = FileSizeUnit[FileSizeUnitKey[unit]];

  const unitByteSize = Math.pow(2, exponent);

  return amount * unitByteSize;
};
