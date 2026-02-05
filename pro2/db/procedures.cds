namespace my.orderShop;

using my.orderShop from './schema';

/**
 * Result type for order total calculation
 */
type OrderTotalResult {
    totalAmount : Decimal(15, 2);
    itemCount   : Integer;
    orderStatus : String;
}
