sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
            const oViewModel = new JSONModel({
                rolesText: "",
                hasReadAccess: false
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Auto-check roles on load
            this.getView().attachAfterRendering(this._checkRolesOnLoad.bind(this));
        },

        _checkRolesOnLoad() {
            this.getView().detachAfterRendering(this._checkRolesOnLoad, this);
            this.onCheckSecurityRoles();
        },

        onCheckSecurityRoles() {
            const oModel = this.getView().getModel();
            const oAction = oModel.bindContext("/securityAction(...)");

            oAction.execute()
                .then(() => {
                    const oResult = oAction.getBoundContext().getObject();
                    const oRoles = JSON.parse(oResult.value);

                    const sRolesText = Object.entries(oRoles)
                        .map(([key, val]) => key + ": " + (val ? "\u2705" : "\u274c"))
                        .join("  |  ");

                    const oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/rolesText", sRolesText);
                    oViewModel.setProperty("/hasReadAccess", oRoles.Read === true);

                    MessageToast.show("Security roles loaded");
                })
                .catch((err) => {
                    console.error("Error fetching security roles:", err);
                    MessageToast.show("Failed to fetch security roles");
                });
        }
    });
});