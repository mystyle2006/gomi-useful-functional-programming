import * as fs from 'fs';
import * as path from 'path';
import {IOrderItem} from "./interfaces/IOrderItem";
import { groupBy, map, mapValues, reduce, sumBy, toPairs} from "lodash";
import {go} from "../methods/go";
import {channel} from "diagnostics_channel";

const fileData = fs.readFileSync(path.join(__dirname, './order-json.txt'), 'utf-8');
const toJSON: { data: { orderItems: IOrderItem[] }} = JSON.parse(fileData);

const recursiveGroupBy = (collection: any, target: string): any => {
  return Array.isArray(collection) ? groupBy(collection, target) : mapValues(collection, (orderItems: any) => recursiveGroupBy(orderItems, target));
}

const result = go(
  toJSON.data.orderItems,
  (data: any) => recursiveGroupBy(data, 'gspc'),
  (data: any) => recursiveGroupBy(data, 'price'),
  (data: any) => recursiveGroupBy(data, 'channel'),
  (data: any) => recursiveGroupBy(data, 'orderStatus'),
  toPairs,
  (pairs: any) => reduce(pairs, (acc: any[], [gspc, values]): any[] => {
    const rows = go(
      values,
      toPairs,
      (pairs: any) => map(pairs, ([price, value0]: any[], index: number) => {
        const _row = go(
          value0,
          toPairs,
          (pairs: any) => reduce(pairs, (acc: any, [channel, value1]) => {
            return go(
              value1,
              toPairs,
              (pairs: any) => reduce(pairs, (acc2, [status, value2]) => {
                const sumOfCount = sumBy(value2, (item: IOrderItem) => item.count);
                const sumOfPrice = sumBy(value2, (item: IOrderItem) => (item.price || 0) * item.count);

                return {
                  ...acc2,
                  productName: value2.gspcInfo?.name,
                  price: Number(price || 0),
                  [`${channel}-${status}-COUNT`]: sumOfCount,
                  [`${channel}-${status}-AMOUNT`]: sumOfPrice,
                  totalCount: acc2.totalCount + sumOfCount,
                  totalAmount: acc2.totalAmount + sumOfPrice,
                };
              }, {
                gspc,
                rowSpan: index === 0 ? Object.entries(values).length : 1,
                totalCount: 0,
                totalAmount: 0,
              }),
            )
          }, {}),
        )

        return _row;
      })
    );

    return [
      ...acc,
      ...rows,
    ];
  }, []),
);

console.log(result);
