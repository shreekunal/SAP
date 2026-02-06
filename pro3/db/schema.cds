namespace my.productCatalog;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity Categories : cuid, managed {
  name        : String;
  description : String;
  Products    : Composition of many Products
                  on Products.category = $self;
}

entity Products : cuid, managed {
  productCode   : String;
  name          : String;
  description   : String;
  price         : Decimal(10, 2);
  currency      : String default 'USD';
  unit          : String enum {
    pcs;
    kg;
    liters;
    boxes;
  };
  stockQuantity : Integer;
  isActive      : Boolean default true;

  category      : Association to Categories;
  reviews       : Composition of many ProductReviews
                    on reviews.product = $self;
}

entity ProductReviews : cuid, managed {
  product   : Association to Products;
  rating    : Integer;
  comment   : String;
  reviewer  : String;
  createdAt : Date;
}

// External association to Project2 Orders
entity OrderProductLinks : cuid, managed {
  orderItemId : String; // References SalesOrderItems from Project2
  product     : Association to Products;
  quantity    : Integer;
  unitPrice   : Decimal(10, 2);
}
