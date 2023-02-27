export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function findWordInArr(text: string, arr: string[]) {
  return arr
    .find(
      (v) =>
        text.includes(v) ||
        text.includes(v.toLowerCase()) ||
        text.includes(capitalize(v)),
    )
    ?.toLowerCase();
}

export function textIncludesFromArr(text: string, arr: string[]) {
  return (
    arr.filter(
      (v) =>
        text.includes(v) ||
        text.includes(v.toLowerCase()) ||
        text.includes(capitalize(v)),
    ).length > 0
  );
}
