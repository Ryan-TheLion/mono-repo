type MatchedPayload<T> =
  T extends Record<any, any> ? { [K in keyof T]: T[K] } : { resolvedValue: T };

type MatchedFormat<T> = {
  matched: true;
} & MatchedPayload<T>;

interface UnMatchedFormat {
  matched: false;
}

type ReturnMatchedFormat<T> = MatchedFormat<T> | UnMatchedFormat;

type ReturnMatchedArrayFormat =
  | Omit<MatchedFormat<any>, 'resolvedValue'>
  | UnMatchedFormat;

type MatchedRegExpFormat = MatchedFormat<{
  pattern: string;
  flags?: string;
  regexp: RegExp;
}>;

type ReturnMatchedRegExpFormat = MatchedRegExpFormat | UnMatchedFormat;

const BOOLEAN = ['true', 'false'];

const kebabCaseRegex = /^[a-z]$|^[a-z](?:[a-z]|-(?=[a-z]))*[a-z]$/;

export const isBooleanFormat = (
  format: string,
): ReturnMatchedFormat<boolean> => {
  const matched = BOOLEAN.includes(format);

  return {
    matched,
    ...(matched && { resolvedValue: format === 'true' ? true : false }),
  } as ReturnMatchedFormat<boolean>;
};

export const isNumberFormat = (format: string): ReturnMatchedFormat<number> => {
  const matched = ((format: string) => {
    if (!format) {
      return false;
    }

    if (/\s/.test(format)) {
      return false;
    }

    return !Number.isNaN(Number(format));
  })(format);

  return {
    matched,
    ...(matched && { resolvedValue: Number(format) }),
  } as ReturnMatchedFormat<number>;
};

export const isArrayFormat = (format: string): ReturnMatchedArrayFormat => {
  const matched = format.startsWith('[') && format.endsWith(']');

  return {
    matched,
  } as ReturnMatchedArrayFormat;
};

export const isRegExpFormat = (format: string): ReturnMatchedRegExpFormat => {
  const regexPattern = /^\/(?<pattern>.*)\/(?<flags>[gimsudy]*)$/;

  const isValid = regexPattern.test(format);

  if (isValid) {
    const { pattern, flags } = format.match(regexPattern)!.groups as {
      pattern: string;
      flags?: string;
    };

    return {
      matched: true,
      pattern,
      flags,
      regexp: new RegExp(pattern, flags),
    } satisfies MatchedRegExpFormat;
  }

  return {
    matched: false,
  } satisfies UnMatchedFormat;
};

export const isKebabCase = (format: string): ReturnMatchedFormat<string> => {
  const matched = kebabCaseRegex.test(format);

  return {
    matched,
    ...(matched && { resolvedValue: format }),
  } as ReturnMatchedFormat<string>;
};
