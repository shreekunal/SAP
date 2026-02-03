sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], (Controller, Filter, FilterOperator, JSONModel, Fragment, MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("orderNo", FilterOperator.Contains, sQuery),
                        new Filter("customerName", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oTable = this.byId("ordersTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onOpenAddOrder: function () {
            var that = this;
            if (!this._oDialog) {
                // load fragment with view-scoped id prefix to avoid duplicate global ids
                Fragment.load({
                    id: this.getView().getId() + "--addOrderFrag",
                    name: "project1.view.AddOrder",
                    controller: this
                }).then(function (oDialog) {
                    that._oDialog = oDialog;
                    that.getView().addDependent(that._oDialog);
                    that._oNewOrderModel = new JSONModel({ orderNo: "", date: "", customerName: "", items: [], attachments: [] });
                    that._oDialog.setModel(that._oNewOrderModel, "newOrder");
                    that._oDialog.open();
                });
            } else {
                this._oNewOrderModel.setData({ orderNo: "", date: "", customerName: "", items: [], attachments: [] });
                this._oDialog.open();
            }
        },

        onCloseAddOrder: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
        },

        onAddItem: function () {
            var aItems = this._oNewOrderModel.getProperty("/items") || [];
            aItems.push({ price: "", unit: "", quantity: "" });
            this._oNewOrderModel.setProperty("/items", aItems);
        },

        onRemoveItem: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var sPath = oItem.getBindingContext("newOrder").getPath();
            var iIndex = parseInt(sPath.split("/").pop(), 10);
            var aItems = this._oNewOrderModel.getProperty("/items") || [];
            aItems.splice(iIndex, 1);
            this._oNewOrderModel.setProperty("/items", aItems);
        },

        onAddAttachment: function () {
            var oDialog = this._oDialog;
            // Find inputs by traversing dialog content
            var oVBox = oDialog.getContent()[0].getContent()[4]; // SimpleForm content index 4 is the Attachments VBox
            var oHBox = oVBox.getItems()[0]; // First item in VBox is the HBox
            var sFileName = oHBox.getItems()[0].getValue(); // First input in HBox
            var sMime = oHBox.getItems()[1].getValue(); // Second input in HBox
            if (!sFileName) {
                MessageToast.show("Please provide a file name");
                return;
            }
            var a = this._oNewOrderModel.getProperty("/attachments") || [];
            a.push({ fileName: sFileName, mimeType: sMime });
            this._oNewOrderModel.setProperty("/attachments", a);
            oHBox.getItems()[0].setValue(""); // Clear file name input
            oHBox.getItems()[1].setValue(""); // Clear mime type input
        },

        onRemoveAttachment: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var sPath = oItem.getBindingContext("newOrder").getPath();
            var iIndex = parseInt(sPath.split("/").pop(), 10);
            var a = this._oNewOrderModel.getProperty("/attachments") || [];
            a.splice(iIndex, 1);
            this._oNewOrderModel.setProperty("/attachments", a);
        },

        onSubmitAddOrder: function () {
            var oData = this._oNewOrderModel.getData();

            function pad(n) { return (n < 10 ? '0' + n : '' + n); }
            function formatDateFlexible(value) {
                if (!value) return null;
                // If already a Date
                if (Object.prototype.toString.call(value) === '[object Date]') {
                    return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
                }
                var s = String(value).trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
                // try ISO parse
                var d = new Date(s);
                if (!isNaN(d.getTime())) return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
                // try numeric split like 2/5/26 or 02/05/2026
                var m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
                if (m) {
                    var a = parseInt(m[1], 10), b = parseInt(m[2], 10), c = parseInt(m[3], 10);
                    var year = c;
                    if (c < 100) year = 2000 + c;
                    // if first part >12 assume day-first (d/m/y), else month-first (m/d/y)
                    var day, month;
                    if (a > 12) { day = a; month = b; }
                    else { month = a; day = b; }
                    var dt = new Date(year, month - 1, day);
                    if (!isNaN(dt.getTime())) return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
                }
                return null;
            }
            var oPayload = {
                orderNo: oData.orderNo,
                date: formatDateFlexible(oData.date),
                customerName: oData.customerName,
                isDraft: false,
                status: "Submitted",
                Items: (oData.items || []).map(function (it) {
                    return {
                        price: it.price || "0",
                        unit: it.unit || "",
                        quantity: it.quantity || 0
                    };
                }),
                Attachments: (oData.attachments || []).map(function (at) {
                    return {
                        fileName: at.fileName,
                        mimeType: at.mimeType
                    };
                })
            };

            // use shared create routine (non-draft)
            this._performCreate(oPayload, true);
        }

        ,

        onShowOrderDetails: function (oEvent) {
            var that = this;
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext();
            if (!oContext) return;
            var sPath = oContext.getPath();

            if (!this._oDetailsDialog) {
                Fragment.load({
                    name: "project1.view.OrderDetails",
                    controller: this
                }).then(function (oDialog) {
                    that._oDetailsDialog = oDialog;
                    that.getView().addDependent(that._oDetailsDialog);
                    // bind dialog to the selected order context
                    that._oDetailsDialog.bindElement(sPath);
                    that._oDetailsDialog.open();
                });
            } else {
                this._oDetailsDialog.bindElement(sPath);
                this._oDetailsDialog.open();
            }
        },

        onCloseOrderDetails: function () {
            if (this._oDetailsDialog) this._oDetailsDialog.close();
        }
        ,

        onSaveDraft: function () {
            var oData = this._oNewOrderModel.getData();
            function pad(n) { return (n < 10 ? '0' + n : '' + n); }
            function formatDateFlexible(value) {
                if (!value) return null;
                if (Object.prototype.toString.call(value) === '[object Date]') {
                    return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
                }
                var s = String(value).trim();
                var d = new Date(s);
                if (!isNaN(d.getTime())) return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
                var m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
                if (m) {
                    var a = parseInt(m[1], 10), b = parseInt(m[2], 10), c = parseInt(m[3], 10);
                    var year = c < 100 ? 2000 + c : c;
                    var day, month;
                    if (a > 12) { day = a; month = b; } else { month = a; day = b; }
                    var dt = new Date(year, month - 1, day);
                    if (!isNaN(dt.getTime())) return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
                }
                return null;
            }

            var oPayload = {
                orderNo: oData.orderNo,
                date: formatDateFlexible(oData.date),
                customerName: oData.customerName,
                isDraft: true,
                status: "Draft",
                Items: (oData.items || []).map(function (it) { return { price: it.price || "0", unit: it.unit || "", quantity: it.quantity || 0 }; }),
                Attachments: (oData.attachments || []).map(function (at) { return { fileName: at.fileName, mimeType: at.mimeType }; })
            };

            this._performCreate(oPayload, true);
        },

        _performCreate: function (oPayload, bCloseDialog) {
            var oModel = this.getView().getModel();
            var that = this;

            // OData V4 model (use binding.create)
            if (oModel && typeof oModel.bindList === "function") {
                try {
                    var oList = oModel.bindList("/SalesOrders");
                    var oCreateContext = oList.create(oPayload);

                    if (oCreateContext && typeof oCreateContext.created === "function") {
                        oCreateContext.created().then(function () {
                            MessageToast.show(oPayload.isDraft ? "Draft saved" : "Order created");
                            if (bCloseDialog && that._oDialog) {
                                that._oDialog.close();
                            }
                            var oTable = that.byId("ordersTable");
                            if (oTable && oTable.getBinding("items")) {
                                oTable.getBinding("items").refresh();
                            }
                        }).catch(function () {
                            MessageToast.show("Failed to create order");
                        });
                        return;
                    }

                    if (oCreateContext && typeof oCreateContext.requestCreated === "function") {
                        oCreateContext.requestCreated().then(function () {
                            MessageToast.show(oPayload.isDraft ? "Draft saved" : "Order created");
                            if (bCloseDialog && that._oDialog) that._oDialog.close();
                            var oTable = that.byId("ordersTable");
                            if (oTable && oTable.getBinding("items")) oTable.getBinding("items").refresh();
                        }).catch(function () {
                            MessageToast.show("Failed to create order");
                        });
                        return;
                    }

                    MessageToast.show(oPayload.isDraft ? "Draft saved" : "Order creation requested");
                    if (bCloseDialog && that._oDialog) that._oDialog.close();
                    var oTable = that.byId("ordersTable");
                    if (oTable && oTable.getBinding("items")) oTable.getBinding("items").refresh();
                    return;
                } catch (e) {
                    console.error(e);
                    MessageToast.show("Failed to create order");
                    return;
                }
            }

            // Last-resort: POST directly to OData endpoint
            try {
                fetch("/odata/v4/catalog/SalesOrders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(oPayload)
                }).then(function (res) {
                    if (res.ok) {
                        MessageToast.show(oPayload.isDraft ? "Draft saved" : "Order created");
                        if (bCloseDialog && that._oDialog) that._oDialog.close();
                        var oTable = that.byId("ordersTable");
                        if (oTable && oTable.getBinding("items")) oTable.getBinding("items").refresh();
                    } else {
                        MessageToast.show("Failed to create order");
                    }
                }).catch(function () {
                    MessageToast.show("Failed to create order");
                });
            } catch (e) {
                console.error(e);
                MessageToast.show("Failed to create order");
            }
        }
    });
});