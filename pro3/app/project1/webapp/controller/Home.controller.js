sap.ui.define([
    "sap/fe/core/PageController"
], function (PageController) {
    "use strict";

    return PageController.extend("project1.controller.Home", {

        onInit: function () {
            // Initialization logic
        },

        /**
         * Navigate to Categories List (Fiori Elements)
         */
        onNavCategories: function () {
            var oRouter = this.getAppComponent().getRouter();
            oRouter.navTo("CategoriesList");
        },

        /**
         * Navigate to Products List (Fiori Elements)
         */
        onNavProducts: function () {
            var oRouter = this.getAppComponent().getRouter();
            oRouter.navTo("ProductsList");
        },

        /**
         * Navigate to Reviews List (Fiori Elements)
         */
        onNavReviews: function () {
            var oRouter = this.getAppComponent().getRouter();
            oRouter.navTo("ReviewsList");
        },

        /**
         * Navigate to Order Links List (Fiori Elements)
         */
        onNavOrderLinks: function () {
            var oRouter = this.getAppComponent().getRouter();
            oRouter.navTo("OrderLinksList");
        }

    });
});
