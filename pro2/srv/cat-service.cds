using my.orderShop as my from '../db/schema';

service CatalogService {
    entity SalesOrders      as projection on my.SalesOrders{
        ID,
        orderNo
    };
    entity SalesOrderItems  as projection on my.SalesOrderItems;
    entity OrderAttachments as projection on my.OrderAttachments;
}

service OpenOrderService {
  // Derived / Calculated Views (SELECT-based)
  entity OpenOrders as
        select from my.SalesOrders
        where status = 'Draft';
}

service ClosedOrderService {
    entity ClosedOrders as
        select from my.SalesOrders
        where status = 'Submitted';
}

service OrderSummaryService {
    // Join-Based Composite Views
    entity OrderSummary as
        select from my.SalesOrders as so
        inner join my.SalesOrderItems as si
        on so.ID = si.parent.ID
        {
            so.ID,
            so.orderNo,
            so.customerName,
            so.date,
            count(si.ID) as itemCount : Integer,
            sum(si.price * si.quantity) as totalAmount : Decimal(15, 2)
        }
        group by so.ID, so.orderNo, so.customerName, so.date;
}

