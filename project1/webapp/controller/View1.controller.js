sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
    (Controller, MessageToast) => {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit() { },

            // =======================
            // SAY HI
            // =======================
            onCallSayHi: function () {
                var oView = this.getView();
                var oModel = oView.getModel();
                var sName = oView.byId("nameInput").getValue();
                var oResultText = oView.byId("sayHiResult");

                var oContextBinding = oModel.bindContext("/sayHi(...)");
                oContextBinding.setParameter("name", sName);

                oContextBinding
                    .execute()
                    .then(function () {
                        var oResult = oContextBinding.getBoundContext().getObject();
                        oResultText.setText("Response: " + oResult.value);
                        MessageToast.show(oResult.value);
                    })
                    .catch(function (oError) {
                        oResultText.setText("Error calling sayHi");
                        MessageToast.show("Error calling sayHi");
                        console.error(oError);
                    });
            },

            // =======================
            // CREATE ORDER
            // =======================
            onCreateOrder: function () {
                var oView = this.getView();
                var oModel = oView.getModel();
                var sOrderNo = oView.byId("newOrderNo").getValue();
                var sAmount = oView.byId("newAmount").getValue();
                var sCurrency = oView.byId("newCurrency").getValue();
                var oResultText = oView.byId("createOrderResult");

                if (!sOrderNo) {
                    MessageToast.show("Order No is required");
                    return;
                }

                var oActionBinding = oModel.bindContext("/createOrder(...)");
                oActionBinding.setParameter("OrderNo", sOrderNo);
                oActionBinding.setParameter("Amount", parseFloat(sAmount) || 0);
                oActionBinding.setParameter("Currency", sCurrency);

                oActionBinding
                    .execute()
                    .then(function () {
                        var oResult = oActionBinding.getBoundContext().getObject();
                        oResultText.setText("Created: " + oResult.value);
                        MessageToast.show("Order created successfully!");
                        oModel.refresh();
                    })
                    .catch(function (oError) {
                        oResultText.setText("Error creating order");
                        MessageToast.show("Error creating order");
                        console.error(oError);
                    });
            },

            // =======================
            // ADD BOOK TO DESTINATION
            // =======================
            onAddBook: function () {
                var oView = this.getView();
                var oModel = oView.getModel();
                var sId = oView.byId("bookId").getValue();
                var sTitle = oView.byId("bookTitle").getValue();
                var sStock = oView.byId("bookStock").getValue();
                var oResultText = oView.byId("addBookResult");

                if (!sId || !sTitle) {
                    MessageToast.show("ID and Title are required");
                    return;
                }

                var oActionBinding = oModel.bindContext("/addRecordToDestinationTableBooks(...)");
                oActionBinding.setParameter("payload", {
                    ID: parseInt(sId),
                    title: sTitle,
                    stock: parseInt(sStock) || 0,
                });

                oActionBinding
                    .execute()
                    .then(function () {
                        var oResult = oActionBinding.getBoundContext().getObject();
                        oResultText.setText("Added: " + oResult.value);
                        MessageToast.show("Book added successfully!");
                    })
                    .catch(function (oError) {
                        oResultText.setText("Error adding book");
                        MessageToast.show("Error adding book");
                        console.error(oError);
                    });
            },

            // =======================
            // SECURITY SCOPES
            // =======================
            onCheckSecurity: function () {
                var oView = this.getView();
                var oModel = oView.getModel();
                var oResultText = oView.byId("securityResult");

                var oActionBinding = oModel.bindContext("/securityAction(...)");

                oActionBinding
                    .execute()
                    .then(function () {
                        var oResult = oActionBinding.getBoundContext().getObject();
                        var oScopes;

                        try {
                            oScopes = JSON.parse(oResult.value);
                        } catch (e) {
                            oResultText.setText("Could not parse security response");
                            return;
                        }

                        var sText = Object.entries(oScopes)
                            .map(function ([key, val]) {
                                return key + ": " + (val ? "✅" : "❌");
                            })
                            .join("  |  ");

                        oResultText.setText(sText);
                        MessageToast.show("Security scopes loaded");
                    })
                    .catch(function (oError) {
                        oResultText.setText("Error fetching security info");
                        MessageToast.show("Error fetching security info");
                        console.error(oError);
                    });
            },
        });
    }
);