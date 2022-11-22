/**
 * We only support a-z and number for now, all lowercase
 * @param name
 */
export function isMNSNameValid(name: string) {
  return /^[a-z0-9]+$/.test(name);
}
