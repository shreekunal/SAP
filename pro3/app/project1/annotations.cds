using CatalogService as service from '../../srv/cat-service';

// ==================== CATEGORIES ====================
annotate service.Categories with @(
    UI.HeaderInfo                : {
        TypeName      : 'Category',
        TypeNamePlural: 'Categories',
        Title         : {Value: name},
        Description   : {Value: description}
    },
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Name',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Description',
                Value: description,
            },
        ],
    },
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ProductsFacet',
            Label : 'Products',
            Target: 'Products/@UI.LineItem',
        },
    ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'Name',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Description',
            Value: description,
        },
    ],
);

// ==================== PRODUCTS ====================
annotate service.Products with @(
    UI.HeaderInfo                : {
        TypeName      : 'Product',
        TypeNamePlural: 'Products',
        Title         : {Value: name},
        Description   : {Value: productCode}
    },
    UI.SelectionFields           : [
        name,
        productCode,
        isActive
    ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'Product Code',
            Value: productCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Name',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Price',
            Value: price,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Currency',
            Value: currency,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Stock',
            Value: stockQuantity,
        },
        {
            $Type            : 'UI.DataField',
            Label            : 'Active',
            Value            : isActive,
            Criticality      : isActive,
            ![@UI.Importance]: #High,
        },
    ],
    UI.FieldGroup #ProductDetails: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                Value: productCode,
                Label: 'Product Code'
            },
            {
                Value: name,
                Label: 'Name'
            },
            {
                Value: description,
                Label: 'Description'
            },
            {
                Value: price,
                Label: 'Price'
            },
            {
                Value: currency,
                Label: 'Currency'
            },
            {
                Value: unit,
                Label: 'Unit'
            },
            {
                Value: stockQuantity,
                Label: 'Stock Quantity'
            },
            {
                Value: isActive,
                Label: 'Active'
            },
            {
                Value: category_ID,
                Label: 'Category'
            },
        ],
    },
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ProductDetailsFacet',
            Label : 'Product Details',
            Target: '@UI.FieldGroup#ProductDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ReviewsFacet',
            Label : 'Reviews',
            Target: 'reviews/@UI.LineItem',
        },
    ],
);

// ==================== PRODUCT REVIEWS ====================
annotate service.ProductReviews with @(
    UI.HeaderInfo               : {
        TypeName      : 'Review',
        TypeNamePlural: 'Reviews',
        Title         : {Value: reviewer},
        Description   : {Value: comment}
    },
    UI.SelectionFields          : [
        reviewer,
        rating
    ],
    UI.LineItem                 : [
        {
            $Type: 'UI.DataField',
            Label: 'Reviewer',
            Value: reviewer,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Rating',
            Value: rating,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Comment',
            Value: comment,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date',
            Value: createdAt,
        },
    ],
    UI.FieldGroup #ReviewDetails: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                Value: reviewer,
                Label: 'Reviewer'
            },
            {
                Value: rating,
                Label: 'Rating'
            },
            {
                Value: comment,
                Label: 'Comment'
            },
            {
                Value: createdAt,
                Label: 'Created At'
            },
        ],
    },
    UI.Facets                   : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'ReviewDetailsFacet',
        Label : 'Review Details',
        Target: '@UI.FieldGroup#ReviewDetails',
    }, ],
);

// ==================== ORDER PRODUCT LINKS ====================
annotate service.OrderProductLinks with @(
    UI.HeaderInfo                  : {
        TypeName      : 'Order Link',
        TypeNamePlural: 'Order Links',
        Title         : {Value: orderItemId}
    },
    UI.LineItem                    : [
        {
            $Type: 'UI.DataField',
            Label: 'Order Item ID',
            Value: orderItemId,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Product',
            Value: product_ID,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Quantity',
            Value: quantity,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Unit Price',
            Value: unitPrice,
        },
    ],
    UI.FieldGroup #OrderLinkDetails: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                Value: orderItemId,
                Label: 'Order Item ID'
            },
            {
                Value: product_ID,
                Label: 'Product'
            },
            {
                Value: quantity,
                Label: 'Quantity'
            },
            {
                Value: unitPrice,
                Label: 'Unit Price'
            },
        ],
    },
    UI.Facets                      : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'OrderLinkDetailsFacet',
        Label : 'Order Link Details',
        Target: '@UI.FieldGroup#OrderLinkDetails',
    }, ],
);
