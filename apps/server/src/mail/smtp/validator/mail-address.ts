import { trimmedStringSchema } from 'src/common/validator';
import {
  type ValidatorConstraintInterface,
  type ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
} from 'class-validator';
import * as addressparser from 'nodemailer/lib/addressparser';
import * as z from 'zod';

export class NodeMailerAddressSchema {
  static string = trimmedStringSchema.refine((str) => {
    // `Name <address>` 문자열
    const parsedAddress = addressparser(str, { flatten: true });

    // 단일 `Name <address>` 문자열만 허용
    if (parsedAddress.length !== 1) return false;

    const [payload] = parsedAddress;

    if (!payload.address) return false;

    // nodemailer의 addressparser는 address@domain 처럼 이메일이 아닌 형식도 주소로 반환해서 이메일 유효성 검사 적용
    return z.safeParse(z.email(), payload.address).success;
  });

  static object = z.object({
    name: z.string(),
    address: z.email(),
  });

  static single = z.union([this.string, this.object]);

  static array = z.array(this.single).refine((arr) => arr.length > 0);

  static singleOrArray = z.union([this.single, this.array]);
}

const name = 'isNodeMailerAddress' as const;

@ValidatorConstraint({ name, async: false })
class NodeMailerAddressValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return isNodeMailerAddress(value);
  }

  defaultMessage(): string {
    return `유효한 mail address 형식이 아닙니다`;
  }
}

export const isNodeMailerAddress = (value: unknown) => {
  if (typeof value === 'string') {
    return z.safeParse(NodeMailerAddressSchema.string, value).success;
  }

  if (typeof value === 'object') {
    return z.safeParse(
      Array.isArray(value)
        ? NodeMailerAddressSchema.array
        : NodeMailerAddressSchema.object,
      value,
    ).success;
  }

  return false;
};

export const IsNodeMailerAddress = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NodeMailerAddressValidator,
    });
  };
};
