type arrWithObj = { [key: string]: any }[];

const isPropValuesEqual = (
  subject: arrWithObj,
  target: arrWithObj,
  propNames: string[]
) => propNames.every((propName: any) => subject[propName] === target[propName]);

const getUniqueItemsByProperties = (
  items: arrWithObj,
  propNames: string[]
): any =>
  items.filter(
    (item: any, index: any, array: any) =>
      index ===
      array.findIndex((foundItem: any) =>
        isPropValuesEqual(foundItem, item, propNames)
      )
  );

export { getUniqueItemsByProperties, isPropValuesEqual };
