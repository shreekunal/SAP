using my.orderShop as my from '../db/schema';

service CatalogService {
    @readonly entity SalesOrders as projection on my.SalesOrders;
    @readonly entity SalesOrderItems as projection on my.SalesOrderItems;
    @readonly entity OrderAttachments as projection on my.OrderAttachments;
}
