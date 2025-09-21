import {
  type ValidatorConstraintInterface,
  type ValidationOptions,
  type ValidationArguments,
  ValidatorConstraint,
  registerDecorator,
} from 'class-validator';
import * as z from 'zod';

const ERROR_MESSAGE = {
  format: '문자열 형식이 아닙니다',
  empty: '빈 문자열을 허용하지 않습니다',
  trimmed: `시작과 끝 공백은 허용되지 않습니다`,
};

const buildErrorMessage = (input: unknown) => {
  if (typeof input === 'string') {
    return !input ? ERROR_MESSAGE.empty : ERROR_MESSAGE.trimmed;
  }

  return ERROR_MESSAGE.format;
};

/**
 * 공백이 아닌 문자가 포함된 유효한 문자열인지 검사하는 zod 스키마
 *
 * - `' 1 '`, `' 1'`과 같이 시작과 끝 공백이 포함된 문자열은 유효성 검사 실패
 * - 빈 문자열인 경우 유효성 검사 실패
 * - string 타입이 아닌 경우 유효성 검사 실패
 */
export const trimmedStringSchema = z
  .string({ error: ERROR_MESSAGE.format })
  .refine(
    (str) => {
      // 빈 문자열
      if (!str) return false;
      // 시작과 끝에 공백이 있는 문자열
      if (str !== str.trim()) return false;

      return true;
    },
    {
      error: ({ input }) => {
        return {
          message: buildErrorMessage(input),
        };
      },
    },
  );

const name = 'isTrimmed' as const;

@ValidatorConstraint({ name, async: false })
class TrimmedStringValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return isTrimmedString(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return buildErrorMessage(validationArguments?.value);
  }
}

/**
 * 공백이 아닌 문자가 포함된 유효한 문자열인지 검사
 *
 * - `' 1 '`, `' 1'`과 같이 시작과 끝 공백이 포함된 문자열은 `false` 반환
 * - 빈 문자열인 경우 `false` 반환
 * - string 타입이 아닌 경우 `false` 반환
 */
export const isTrimmedString = (value: unknown) => {
  return z.safeParse(trimmedStringSchema, value).success;
};

/**
 * 공백이 아닌 문자가 포함된 유효한 문자열인지 검사
 *
 * - `' 1 '`, `' 1'`과 같이 시작과 끝 공백이 포함된 문자열은 유효성 검사 실패
 * - 빈 문자열인 경우 유효성 검사 실패
 * - string 타입이 아닌 경우 유효성 검사 실패
 */
export const IsTrimmedString = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: TrimmedStringValidator,
    });
  };
};
