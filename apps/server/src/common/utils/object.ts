export const isRecord = <T extends Record<any, any> = Record<any, any>>(
  payload: unknown,
): payload is T => {
  return (
    typeof payload === 'object' && payload !== null && !Array.isArray(payload)
  );
};
