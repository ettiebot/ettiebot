export default function stringToUUID(str: string) {
  str = str.replace('-', '');
  return 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'.replace(
    /[x]/g,
    function (_, p) {
      return str[p % str.length];
    },
  );
}
