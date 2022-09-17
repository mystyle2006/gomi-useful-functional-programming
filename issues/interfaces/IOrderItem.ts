export interface Gspc {
  name: string;
  salesCode: string;
}

export interface IOrderItem {
  id: string;
  gspc: string;
  brandCode: string;
  channel: string;
  count: number;
  countryId: string;
  itemName: string;
  orderId: string;
  orderItemId : string;
  orderNumber : string;
  orderStatus : string;
  priceOriginal : number;
  payMethod: string;
  paymentStatus: string;
  price: number;
  shippingStatus: string;
  sourceName: string;
  gspcInfo: Gspc;
  settlementYearMonth: string;
  synced: boolean;
  paidAt?: Date;
  cancelledAt?: Date;
  deliveredAt? : Date;
  orderedAt : Date;
  createdAt : Date;
  updatedAt : Date;
  deletedAt? : Date;
  deleted: boolean;
}
