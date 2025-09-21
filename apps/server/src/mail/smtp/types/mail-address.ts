import { type infer as zodInfer } from 'zod';
import { NodeMailerAddressSchema } from '../validator';

export type String = zodInfer<typeof NodeMailerAddressSchema.string>;

export type Object = zodInfer<typeof NodeMailerAddressSchema.object>;

export type Single = zodInfer<typeof NodeMailerAddressSchema.single>;

export type SingleOrArray = zodInfer<
  typeof NodeMailerAddressSchema.singleOrArray
>;
