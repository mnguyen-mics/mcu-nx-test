export function printStringArray(table: string[] = []) {
  return table.reduce(
    (acc, strValue, i) => `${acc}${`${i > 0 && i < table.length ? ',' : ''} ${strValue}`}`,
    '',
  );
}
