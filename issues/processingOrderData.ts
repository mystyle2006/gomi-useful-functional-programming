import * as fs from 'fs';
import * as path from 'path';
import {IOrderItem} from "./interfaces/IOrderItem";
import { groupBy, mapValues, sumBy } from "lodash";

const fileData = fs.readFileSync(path.join(__dirname, './order-json.txt'), 'utf-8');
const toJSON: { data: { orderItems: IOrderItem[] }} = JSON.parse(fileData);

// 상품별 판매현황

// 상품별 groupBy
const groupByGspc = groupBy(toJSON.data.orderItems, (orderItem: IOrderItem) => orderItem.gspc);

// 가격별 groupBy
const groupByPrice = mapValues(groupByGspc, (orderItems) => groupBy(orderItems, (orderItem: IOrderItem) => orderItem.price));

// 채널별 groupBy
const groupByChannel = mapValues(groupByPrice, (groupByPriceDict) => mapValues(groupByPriceDict, (orderItems: IOrderItem[]) => groupBy(orderItems, (orderItem: IOrderItem) => orderItem.channel)));

// 주문상태별 groupBy
const groupByOrderStatus = mapValues(groupByChannel, (groupByPriceDict) => mapValues(groupByPriceDict, (groupByChannelDict) => mapValues(groupByChannelDict, (orderItems: IOrderItem[]) => groupBy(orderItems, (orderItem: IOrderItem) => orderItem.orderStatus))));

const rowData = Object.entries(groupByOrderStatus).reduce(
  (acc: any[], [gspc, values]): any[] => {
    const rows: any[] = [];

    Object.entries(values).forEach(([price, value0], index) => {
      const row: { [key: string]: any } = {
        productName: groupByGspc[gspc][0].gspcInfo?.name,
        rowSpan: index === 0 ? Object.entries(values).length : 1,
      };
      let totalCount = 0;
      let totalAmount = 0;

      Object.entries(value0).forEach(([channel, value1]) => {
        Object.entries(value1).forEach(([status, value2]) => {
          const sumOfCount = sumBy(value2, (item) => item.count);
          const sumOfPrice = sumBy(value2, (item) => (item.price || 0) * item.count);

          row.price = Number(price || 0);
          totalCount += sumOfCount;
          totalAmount += sumOfPrice;
          row[`${channel}-${status}-COUNT`] = sumOfCount;
          row[`${channel}-${status}-AMOUNT`] = sumOfPrice;
        });
      });

      rows.push({
        ...row,
        totalCount,
        totalAmount,
      });
    });

    return [...acc, ...rows];
  },
  []
);

console.log(rowData);
