namespace my.orderShop;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity SalesOrders : cuid, managed {
  orderNo      : String;
  date         : Date;
  customerName : String;
  isDraft      : Boolean;
  status       : String enum {
    Submitted;
    Draft;
  }

  Items        : Composition of many SalesOrderItems
                   on Items.parent = $self;

  Attachments  : Composition of many OrderAttachments
                   on Attachments.parent = $self;
}

entity SalesOrderItems : cuid, managed {
  parent   : Association to SalesOrders;
  price    : Decimal(10, 2);
  unit     : String enum {
    pcs;
    kg;
    liters;
    boxes;
  };
  quantity : Integer;
}

entity OrderAttachments : cuid, managed {
  parent   : Association to SalesOrders;
  fileName : String;
  mimeType : String enum {
    ![application/pdf];
    ![image/jpeg];
    ![image/png];
    ![text/plain];
  };

  @Core.MediaType: mimeType
  content  : LargeBinary;
}
