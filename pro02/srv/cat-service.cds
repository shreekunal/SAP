using my.orderShop as my from '../db/schema';

service CatalogService {
    entity SalesOrders      as projection on my.SalesOrders;
    entity SalesOrderItems  as projection on my.SalesOrderItems;
    entity OrderAttachments as projection on my.OrderAttachments;
    function getAllOrderTotals() returns array of OrderTotal;
}

type OrderTotal {
    ORDER_ID      : UUID;
    ORDER_NO      : String(5000);
    CUSTOMER_NAME : String(5000);
    TOTAL_COST    : Decimal(15, 2);
}

service view1 {
    entity SalesOrders                as
        projection on my.SalesOrders {
            ID as customName
        };

    @readonly
    entity OrderItemsViaAssociation   as
        select from my.SalesOrders {
            key ID       as OrderID,
            key Items.ID as ItemID,
                Items.quantity,
                Items.price
        }

    @readonly
    entity OrderItemsViaAssociation_2 as
        select from my.SalesOrders {
            key ID,
                customerName,
                cast(
                    ifNull(
                        count(Items.ID), 0
                    ) as Int16
                ) as ItemCount
        }
        group by
            ID,
            customerName;

    @readonly
    entity OrderItemsViaAssociation_3 as
        select from my.SalesOrders {
            key ID,
                customerName,
                cast(
                    ifnull(
                        sum(Items.quantity * Items.price), 0
                    ) as Decimal(15, 2)
                ) as TotalPrice
        }
        group by
            ID,
            customerName
}
