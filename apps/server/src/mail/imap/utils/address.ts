import { type AddressObject } from 'mailparser';

export const addressObjectToEmailAddress = (
  addressObject: AddressObject | AddressObject[],
) => {
  const array = Array.isArray(addressObject)
    ? addressObject.map((addr) => addr.value[0])
    : [addressObject.value[0]];

  return {
    single: array[0],
    array,
  };
};
