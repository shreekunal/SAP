service test {
    action getData()                                                       returns String;
    action createOrder(OrderNo: String, Amount: Decimal, Currency: String) returns String;
}
