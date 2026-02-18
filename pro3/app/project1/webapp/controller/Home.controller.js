sap.ui.define([
    "sap/fe/core/PageController"
], function (PageController) {
    "use strict";

    return PageController.extend("project1.controller.Home", {

        onInit: function () {
            // Initialization logic
        },

        /**
         * Toggle Side Navigation Panel
         */
        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();
            oToolPage.setSideExpanded(!bSideExpanded);
        },

        /**
         * Handle Side Navigation Item Selection
         */
        onItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            var oRouter = this.getAppComponent().getRouter();

            switch (sKey) {
                case "home":
                    // Already on home, do nothing
                    break;
                case "categories":
                    oRouter.navTo("CategoriesList");
                    break;
                case "products":
                    oRouter.navTo("ProductsList");
                    break;
                case "reviews":
                    oRouter.navTo("ReviewsList");
                    break;
                case "orderlinks":
                    oRouter.navTo("OrderLinksList");
                    break;
                default:
                    break;
            }
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
