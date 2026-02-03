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
                Fragment.load({
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
            var sFileName = oDialog.byId("attachFileName").getValue();
            var sMime = oDialog.byId("attachMimeType").getValue();
            if (!sFileName) {
                MessageToast.show("Please provide a file name");
                return;
            }
            var a = this._oNewOrderModel.getProperty("/attachments") || [];
            a.push({ fileName: sFileName, mimeType: sMime });
            this._oNewOrderModel.setProperty("/attachments", a);
            oDialog.byId("attachFileName").setValue("");
            oDialog.byId("attachMimeType").setValue("");
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

            var oModel = this.getView().getModel();
            var that = this;

            // If OData V2 model (has create), use it
            if (oModel && typeof oModel.create === "function") {
                oModel.create("/SalesOrders", oPayload, {
                    success: function () {
                        MessageToast.show("Order created");
                        if (that._oDialog) {
                            that._oDialog.close();
                        }
                        var oTable = that.byId("ordersTable");
                        if (oTable && oTable.getBinding("items")) {
                            oTable.getBinding("items").refresh();
                        }
                    },
                    error: function (oErr) {
                        MessageToast.show("Failed to create order");
                    }
                });

                return;
            }

            // If OData V4 model (use binding.create)
            if (oModel && typeof oModel.bindList === "function") {
                try {
                    var oList = oModel.bindList("/SalesOrders");
                    var oCreateContext = oList.create(oPayload);

                    // try common promise hooks on returned context
                    if (oCreateContext && typeof oCreateContext.created === "function") {
                        oCreateContext.created().then(function () {
                            MessageToast.show("Order created");
                            if (that._oDialog) {
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
                            MessageToast.show("Order created");
                            if (that._oDialog) that._oDialog.close();
                            var oTable = that.byId("ordersTable");
                            if (oTable && oTable.getBinding("items")) oTable.getBinding("items").refresh();
                        }).catch(function () {
                            MessageToast.show("Failed to create order");
                        });
                        return;
                    }

                    // Fallback: assume create was requested
                    MessageToast.show("Order creation requested");
                    if (that._oDialog) that._oDialog.close();
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
                        MessageToast.show("Order created");
                        if (that._oDialog) that._oDialog.close();
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