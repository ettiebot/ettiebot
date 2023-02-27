export default function avgStringsArr(arr: string[]) {
  const data = {};
  arr.forEach(function (x) {
    data[x] = (data[x] || 0) + 1;
  });
  return Object.keys(data).reduce((a, b) => (data[a] > data[b] ? a : b));
}
