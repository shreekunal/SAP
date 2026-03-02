using {my.orders} from '../db/schema';

service OrdersService @(requires: 'authenticated-user') {
  entity Orders as projection on orders.Orders;

  function securityAction()                                                returns String;
  action   getData()                                                       returns String;
  action   createOrder(OrderNo: String, Amount: Decimal, Currency: String) returns String;

  @requires: 'Viewer'
  function sayHi(name: String)                                             returns String;

  // @requires: 'Editor'
  action   addRecordToDestinationTableBooks(payload: BooksPayload)         returns String;

  type BooksPayload {
    ID    : Integer;
    title : String;
    stock : Integer;
  };

  entity workflowBasedStatus {
    key orderId   : String;
        totalCost : Decimal;
        status    : String;
  }
}
