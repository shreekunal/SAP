using {my.productCatalog} from '../db/schema';

@odata
service CatalogService {
  entity Categories        as projection on productCatalog.Categories;
  entity Products          as projection on productCatalog.Products;
  entity ProductReviews    as projection on productCatalog.ProductReviews;
  entity OrderProductLinks as projection on productCatalog.OrderProductLinks;
}
