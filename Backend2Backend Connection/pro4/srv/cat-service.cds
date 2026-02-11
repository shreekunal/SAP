using {my.orders} from '../db/schema';

service OrdersService {
  entity Orders as projection on orders.Orders;
}
