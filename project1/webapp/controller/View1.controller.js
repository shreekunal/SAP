sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
            const oViewModel = new JSONModel({
                rolesText: ""
            });
            this.getView().setModel(oViewModel, "viewModel");
        },

        onCheckSecurityRoles() {
            const sUrl = "/odata/v4/orders/securityAction";

            fetch(sUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })
                .then(response => response.json())
                .then(data => {
                    const oRoles = JSON.parse(data.value);
                    const sRolesText = Object.entries(oRoles)
                        .map(([key, val]) => key + ": " + (val ? "✅" : "❌"))
                        .join("  |  ");

                    this.getView().getModel("viewModel").setProperty("/rolesText", sRolesText);
                    MessageToast.show("Security roles loaded");
                })
                .catch(err => {
                    console.error("Error fetching security roles:", err);
                    MessageToast.show("Failed to fetch security roles");
                });
        }
    });
});