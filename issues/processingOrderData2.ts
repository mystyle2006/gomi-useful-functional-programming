import * as fs from 'fs';
import * as path from 'path';
import {IOrderItem} from "./interfaces/IOrderItem";
import {curry, groupBy, map, mapValues, reduce, sumBy, toPairs} from "lodash";
import {go} from "../methods/go";
import {channel} from "diagnostics_channel";

const fileData = fs.readFileSync(path.join(__dirname, './order-json.txt'), 'utf-8');
const toJSON: { data: { orderItems: IOrderItem[] }} = JSON.parse(fileData);

const recursiveGroupBy = curry((target: string, collection: any): any => {
  return Array.isArray(collection) ? groupBy(collection, target) : mapValues(collection, (orderItems: any) => recursiveGroupBy(target, orderItems));
});

const logInfo = curry((label: string, data: any) => {
  console.log(`>>> ${label}`, data);
  return data;
});

const result = go(
  toJSON.data.orderItems,
  recursiveGroupBy( 'gspc'),
  recursiveGroupBy( 'price'),
  recursiveGroupBy( 'channel'),
  recursiveGroupBy( 'orderStatus'),
  toPairs,
  (pairs: any) => reduce(pairs, (acc: any[], [gspc, groupByGspc]): any[] => {
    const rows = go(
      groupByGspc,
      toPairs,
      (pairs: any) => map(pairs, ([price, groupByPrice]: any[], index: number) => {
        const _row = go(
          groupByPrice,
          toPairs,
          (pairs: any) => reduce(pairs, (acc: any, [channel, groupByChannel]) => {
            return go(
              groupByChannel,
              toPairs,
              (pairs: any) => reduce(pairs, (acc2, [status, groupByStatus]) => {
                const sumOfCount = sumBy(groupByStatus, (item: IOrderItem) => item.count);
                const sumOfPrice = sumBy(groupByStatus, (item: IOrderItem) => (item.price || 0) * item.count);
                return {
                  ...acc2,
                  productName: groupByStatus[0].gspcInfo?.name,
                  price: Number(price || 0),
                  [`${channel}-${status}-COUNT`]: sumOfCount,
                  [`${channel}-${status}-AMOUNT`]: sumOfPrice,
                  totalCount: acc2.totalCount + sumOfCount,
                  totalAmount: acc2.totalAmount + sumOfPrice,
                };
              }, {
                gspc,
                rowSpan: index === 0 ? Object.entries(groupByGspc).length : 1,
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
