using {my.orders} from '../db/schema';

service OrdersService @(requires: 'authenticated-user') {
  entity Orders as projection on orders.Orders;
  action securityAction()                                                returns String;
  action getData()                                                       returns String;
  action createOrder(OrderNo: String, Amount: Decimal, Currency: String) returns String;
}
