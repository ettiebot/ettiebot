export default function getAverage(numbers: number[]) {
  const sum = numbers.reduce((acc: number, number: number) => acc + number, 0);
  const length = numbers.length;
  return sum / length;
}
