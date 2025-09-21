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
  empty: '공백을 포함한 빈 문자열을 허용하지 않습니다',
};

const buildErrorMessage = (input: unknown) => {
  if (typeof input === 'string') {
    return ERROR_MESSAGE.empty;
  }

  return ERROR_MESSAGE.format;
};

/**
 * 공백이 아닌 문자가 포함된 유효한 문자열인지 검사하는 zod 스키마
 *
 * - `'  '`와 같이 공백만 포함된 문자열은 유효성 검사 실패
 * - string 타입이 아닌 경우 유효성 검사 실패
 */
export const notEmptyStringSchema = z
  .string({ error: ERROR_MESSAGE.format })
  .refine((str) => !!str.trim(), {
    error: ({ input }) => {
      return {
        message: buildErrorMessage(input),
      };
    },
  });

const name = 'isNotEmptyString' as const;

@ValidatorConstraint({ name, async: false })
class NotEmptyStringValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return isNotEmptyString(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return buildErrorMessage(validationArguments?.value);
  }
}

/**
 * 공백이 아닌 문자가 포함된 유효한 문자열인지 검사
 *
 * - `'  '`와 같이 공백만 포함된 문자열은 `false` 반환
 * - string 타입이 아닌 경우 `false` 반환
 */
export const isNotEmptyString = (value: unknown) => {
  return z.safeParse(notEmptyStringSchema, value).success;
};

/**
 * 공백이 아닌 문자가 포함된 유효한 문자열인지 검사
 *
 * - `'  '`와 같이 공백만 포함된 문자열은 유효성 검사 실패
 * - string 타입이 아닌 경우 유효성 검사 실패
 */
export const IsNotEmptyString = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NotEmptyStringValidator,
    });
  };
};
