sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, Dialog, Button, Label, Input, VBox, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("ui5app1.controller.View1", {
        onInit() {
        },

        onTriggerWorkflow() {
            const oOrderNoInput = new Input({ placeholder: "e.g. SO-001" });
            const oAmountInput = new Input({ placeholder: "e.g. 1500.00", type: "Number" });
            const oCurrencyInput = new Input({ placeholder: "e.g. USD", maxLength: 3 });

            const oDialog = new Dialog({
                title: "Trigger Order Workflow",
                type: "Message",
                content: new VBox({
                    items: [
                        new Label({ text: "Order No", labelFor: oOrderNoInput }),
                        oOrderNoInput,
                        new Label({ text: "Amount", labelFor: oAmountInput }),
                        oAmountInput,
                        new Label({ text: "Currency", labelFor: oCurrencyInput }),
                        oCurrencyInput
                    ]
                }).addStyleClass("sapUiSmallMargin"),
                beginButton: new Button({
                    type: "Emphasized",
                    text: "Trigger",
                    press: () => {
                        const sOrderNo = oOrderNoInput.getValue();
                        const sAmount = oAmountInput.getValue();
                        const sCurrency = oCurrencyInput.getValue();

                        if (!sOrderNo) {
                            MessageBox.warning("Please enter an Order No.");
                            return;
                        }

                        oDialog.close();
                        this._callTriggerWorkflow(sOrderNo, parseFloat(sAmount) || 0, sCurrency);
                    }
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: () => oDialog.close()
                }),
                afterClose: () => oDialog.destroy()
            });

            oDialog.open();
        },

        _callTriggerWorkflow(sOrderNo, nAmount, sCurrency) {
            const oModel = this.getView().getModel();
            const oContext = oModel.bindContext("/triggerOrderWorkflow(...)");

            oContext.setParameter("OrderNo", sOrderNo);
            oContext.setParameter("Amount", nAmount);
            oContext.setParameter("Currency", sCurrency);

            oContext.execute().then(() => {
                const oResult = oContext.getBoundContext().getObject();
                MessageToast.show("Workflow triggered successfully!");
                console.log("Workflow result:", oResult);
            }).catch((oError) => {
                MessageBox.error("Failed to trigger workflow: " + oError.message);
                console.error("Workflow error:", oError);
            });
        }
    });
});