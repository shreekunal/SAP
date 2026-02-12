using {my.orders} from '../db/schema';

service OrdersService @(requires: 'authenticated-user') {
  @(restrict: [
    {
      grant: 'READ',
      to   : 'Read'
    },
    {
      grant: 'CREATE',
      to   : 'Create'
    },
    {
      grant: 'UPDATE',
      to   : 'Update'
    },
    {
      grant: 'DELETE',
      to   : 'Delete'
    }
  ])
  entity Orders as projection on orders.Orders;

  function securityAction()                                                returns String;
  action   getData()                                                       returns String;
  action   createOrder(OrderNo: String, Amount: Decimal, Currency: String) returns String;
}
