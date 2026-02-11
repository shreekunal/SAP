using {my.orders} from '../db/schema';

service OrdersService @(path: '/orders')@(requires: 'authenticated-user') {
  entity Orders as projection on orders.Orders;
  action securityAction() returns String;
}
