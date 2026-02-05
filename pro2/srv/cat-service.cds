using my.orderShop as my from '../db/schema';

service CatalogService {
    entity SalesOrders      as projection on my.SalesOrders;
    entity SalesOrderItems  as projection on my.SalesOrderItems;
    entity OrderAttachments as projection on my.OrderAttachments;
}
