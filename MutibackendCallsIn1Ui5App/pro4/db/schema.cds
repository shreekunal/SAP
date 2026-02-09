namespace my.orders;

entity Orders {
  key ID        : UUID;
      OrderNo   : String(20);
      Amount    : Decimal(15,2);
      Currency  : String(3);
}
