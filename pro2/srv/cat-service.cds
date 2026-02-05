using my.orderShop as my from '../db/schema';

service CatalogService {
    // @cds.redirection.target
    entity SalesOrders      as projection on my.SalesOrders;
    entity SalesOrderItems  as projection on my.SalesOrderItems;
    entity OrderAttachments as projection on my.OrderAttachments;

    // Derived / Calculated Views (SELECT-based)
    entity OpenOrders       as
        select from SalesOrderItems
        where
            unit = 'pcs';

    entity ClosedOrders     as
        select from SalesOrders
        where
            status = 'Submitted';

    // Join-Based Composite Views
    entity OrderSummary     as
        select from my.SalesOrders as so
        inner join my.SalesOrderItems as si
            on so.ID = si.parent.ID
        {
            key so.ID                       as ID,
                so.orderNo,
                so.customerName,
                so.date,
                count(si.ID)                as itemCount   : Integer,
                sum(si.price * si.quantity) as totalAmount : Decimal(15, 2)
        }
        group by
            so.ID,
            so.orderNo,
            so.customerName,
            so.date;
}
