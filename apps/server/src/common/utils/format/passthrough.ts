import { isBooleanFormat, isNumberFormat } from './is';

/**
 * env 문자열이 `"true"` | `"boolean"` 이면 해당 boolean 값을 반환하고, 그 외 문자열인 경우 문자열 그대로 반환
 * (유효한 boolean 문자열이 아닌 경우 유효성 검사에서 에러가 발생되도록)
 */
export const envBooleanPassthrough = (envField: string | undefined) => {
  if (envField === undefined) return undefined;

  const isBoolean = isBooleanFormat(envField);

  if (isBoolean.matched) return isBoolean.resolvedValue;

  // 유효하지 않은 스키마로 에러를 발생시키기 위해 env 문자열 그대로 반환
  return envField;
};

/**
 * env 문자열이 number 이면 해당 number 값을 반환하고, 그 외 문자열인 경우 문자열 그대로 반환
 * (유효한 number 문자열이 아닌 경우 유효성 검사에서 에러가 발생되도록)
 */
export const envNumberPassthrough = (envField: string | undefined) => {
  if (envField === undefined) return undefined;

  const isNumber = isNumberFormat(envField);

  if (isNumber.matched) return isNumber.resolvedValue;

  // 유효하지 않은 스키마로 에러를 발생시키기 위해 env 문자열 그대로 반환
  return envField;
};
