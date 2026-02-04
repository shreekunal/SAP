sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, Filter, FilterOperator, JSONModel, Fragment, MessageToast, MessageBox) => {
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

        onFileChange: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oFileUploader.oFileUpload.files;
            if (aFiles.length > 0) {
                this._selectedFile = aFiles[0];
            } else {
                this._selectedFile = null;
            }
        },

        onAddAttachment: function () {
            if (!this._selectedFile) {
                MessageToast.show("Please select a file first");
                return;
            }
            var oFile = this._selectedFile;
            var sFileName = oFile.name;
            var sMimeType = oFile.type || "application/octet-stream";
            var that = this;
            var reader = new FileReader();
            reader.onload = function (e) {
                var sContent = e.target.result.split(',')[1]; // Get base64 part
                var a = that._oNewOrderModel.getProperty("/attachments") || [];
                a.push({ fileName: sFileName, mimeType: sMimeType, content: sContent });
                that._oNewOrderModel.setProperty("/attachments", a);
                // Clear the file uploader
                var oFileUploader = that._oDialog.getContent()[0].getContent()[9].getItems()[0].getItems()[0];
                oFileUploader.clear();
                that._selectedFile = null;
                MessageToast.show("Attachment added");
            };
            reader.readAsDataURL(oFile); // Reads as data URL, which includes base64
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
                        mimeType: at.mimeType,
                        content: at.content
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
                    id: this.getView().getId() + "--orderDetailsFrag",
                    name: "project1.view.OrderDetails",
                    controller: this
                }).then(function (oDialog) {
                    that._oDetailsDialog = oDialog;
                    that.getView().addDependent(that._oDetailsDialog);
                    that._oDetailsModel = new JSONModel({ isEditable: false });
                    that._oDetailsDialog.setModel(that._oDetailsModel, "orderDetailsModel");
                    that._oDetailsDialog.bindElement(sPath);
                    that._oDetailsDialog.open();
                });
            } else {
                this._oDetailsModel.setProperty("/isEditable", false);
                this._oDetailsDialog.bindElement(sPath);
                this._oDetailsDialog.open();
            }
        },

        onEditOrderDetails: function () {
            this._oDetailsModel.setProperty("/isEditable", true);
            this._toggleDetailButtons(true);
        },

        onSaveOrderDetails: function () {
            var that = this;
            var oContext = this._oDetailsDialog.getBindingContext();
            if (!oContext) return;

            // Get the updated values from the dialog controls
            var oDialog = this._oDetailsDialog;
            var oForm = oDialog.getContent()[0];
            var aContent = oForm.getContent();

            // Extract values from controls: DatePicker at index 3, Input at index 5, Select at index 7
            var sDate = aContent[3].getValue();
            var sCustomer = aContent[5].getValue();
            var sStatus = aContent[7].getSelectedKey();

            var oModel = this.getView().getModel();

            function pad(n) { return (n < 10 ? '0' + n : '' + n); }
            function formatDateFlexible(value) {
                if (!value) return null;
                if (Object.prototype.toString.call(value) === '[object Date]') {
                    return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
                }
                var s = String(value).trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
                var d = new Date(s);
                if (!isNaN(d.getTime())) {
                    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
                }
                return value;
            }

            var oData = oContext.getObject();
            var oModel = this.getView().getModel();

            // Use OData V4 binding to update the entity
            oContext.setProperty("date", formatDateFlexible(sDate));
            oContext.setProperty("customerName", sCustomer);
            oContext.setProperty("status", sStatus);

            // Submit the changes using OData V4 binding
            oModel.submitBatch("update").then(function () {
                MessageToast.show("Order updated");
                that._oDetailsModel.setProperty("/isEditable", false);
                that._toggleDetailButtons(false);
                // Refresh the table and rebind the dialog
                var oTable = that.byId("ordersTable");
                if (oTable && oTable.getBinding("items")) {
                    oTable.getBinding("items").refresh();
                }
                // Rebind the dialog to get updated data
                setTimeout(function () {
                    oContext.refresh();
                }, 100);
            }).catch(function (oError) {
                MessageToast.show("Failed to update order: " + (oError.message || "Unknown error"));
            });
        },

        onCancelEditOrderDetails: function () {
            this._oDetailsModel.setProperty("/isEditable", false);
            this._toggleDetailButtons(false);
        },

        _toggleDetailButtons: function (bEditing) {
            var oDialog = this._oDetailsDialog;
            if (!oDialog) return;
            var oFooter = oDialog.getFooter();
            if (!oFooter) return;
            var aButtons = oFooter.getContent();
            for (var i = 0; i < aButtons.length; i++) {
                if (aButtons[i].getId && aButtons[i].getId().indexOf("editBtn") > -1) {
                    aButtons[i].setVisible(!bEditing);
                } else if (aButtons[i].getId && aButtons[i].getId().indexOf("saveBtn") > -1) {
                    aButtons[i].setVisible(bEditing);
                } else if (aButtons[i].getId && aButtons[i].getId().indexOf("cancelBtn") > -1) {
                    aButtons[i].setVisible(bEditing);
                }
            }
        },

        onCloseOrderDetails: function () {
            if (this._oDetailsDialog) {
                this._oDetailsDialog.close();
            }
        },

        onPreviewAttachment: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            if (!oContext) return;

            var oAttachment = oContext.getObject();
            console.log("Attachment object:", oAttachment);

            if (!oAttachment.content) {
                MessageToast.show("No content available for this attachment");
                return;
            }

            // Create data URL from base64 content
            var sDataUrl = "data:" + oAttachment.mimeType + ";base64," + oAttachment.content;

            // Create a temporary link and trigger download
            var oLink = document.createElement("a");
            oLink.href = sDataUrl;
            oLink.download = oAttachment.fileName;
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);

            MessageToast.show("File downloaded: " + oAttachment.fileName);
        },

        onDeleteSelectedOrders: function () {
            var oTable = this.byId("ordersTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select orders to delete");
                return;
            }

            // Confirm deletion
            MessageBox.confirm("Are you sure you want to delete " + aSelectedItems.length + " selected order(s)?", {
                title: "Confirm Deletion",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this._performDelete(aSelectedItems);
                    }
                }.bind(this)
            });
        },

        _performDelete: function (aSelectedItems) {
            var that = this;
            var oModel = this.getView().getModel();
            var aPromises = [];

            aSelectedItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext();
                if (oContext) {
                    var sPath = oContext.getPath();
                    var oDeletePromise = oModel.delete(sPath);
                    aPromises.push(oDeletePromise);
                }
            });

            Promise.all(aPromises).then(function () {
                MessageToast.show("Selected orders deleted successfully");
                var oTable = that.byId("ordersTable");
                oTable.removeSelections();
                // Refresh the table
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh();
                }
            }).catch(function (oError) {
                MessageToast.show("Error deleting orders: " + oError.message);
            });
        },

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
                Attachments: (oData.attachments || []).map(function (at) { return { fileName: at.fileName, mimeType: at.mimeType, content: at.content }; })
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
                    console.error("OData V4 binding create failed:", e);
                    MessageToast.show("Failed to create order: " + (e.message || "Unknown error"));
                }
            } else {
                MessageToast.show("OData V4 model not available");
            }
        }
    });
});