const cds = require('@sap/cds')
const { SELECT, INSERT } = require('@sap/cds/lib/ql/cds-ql')

module.exports = class OrdersService extends cds.ApplicationService {
  async init() {

    const { Orders } = cds.entities('OrdersService')

    // =======================
    // SECURITY SCOPE HELPER
    // =======================
    const getSecurityScope = (req) => ({
      Read: req.user.is('Read'),
      Create: req.user.is('Create'),
      Delete: req.user.is('Delete'),
      Update: req.user.is('Update'),
    });

    // =======================
    // SECURITY ACTION
    // =======================
    this.on('securityAction', async (req) => {
      let securityScope = getSecurityScope(req);
      console.log('Security Roles', JSON.stringify(securityScope));
      return JSON.stringify(securityScope);
    })

    // =======================
    // GET DATA (requires Read scope)
    // =======================
    this.on('getData', async (req) => {
      const securityScope = getSecurityScope(req);
      console.log('Security Roles for getData:', JSON.stringify(securityScope));

      if (!securityScope.Read) return req.error(403, 'Insufficient scope: Read required');

      try {
        const orders = await SELECT.from(Orders);
        console.log('getData result:', JSON.stringify(orders));
        return JSON.stringify(orders);
      } catch (e) {
        console.error('Error fetching orders:', e.message);
        return req.error(500, 'Failed to fetch orders');
      }
    })

    // =======================
    // CREATE ORDER (requires Create scope)
    // =======================
    this.on('createOrder', async (req) => {
      const securityScope = getSecurityScope(req);
      console.log('Security Roles for createOrder:', JSON.stringify(securityScope));

      if (!securityScope.Create) return req.error(403, 'Insufficient scope: Create required');

      const { OrderNo, Amount, Currency } = req.data;

      if (!OrderNo) return req.error(400, 'OrderNo is required');

      try {
        const result = await INSERT.into(Orders).entries({ OrderNo, Amount, Currency });
        console.log('Created order:', JSON.stringify(result));
        return JSON.stringify({ OrderNo, Amount, Currency });
      } catch (e) {
        console.error('Error creating order:', e.message);
        return req.error(500, 'Failed to create order');
      }
    })

    // =======================
    // TRIGGER ORDER WORKFLOW (SAP Build Process Automation)
    // =======================
    this.on('triggerOrderWorkflow', async (req) => {
      const { OrderNo, Amount, Currency } = req.data;

      const oPayload = {
        "definitionId": "us10.058e1c82trial.salesordersmanagement.orderProcessing",
        "context": {
          "id": 0,
          "orderno": OrderNo || "",
          "amount": Amount || 0,
          "currency": Currency || ""
        }
      };

      console.log('Workflow Payload:', JSON.stringify(oPayload));

      try {
        const destination = await cds.connect.to('spa_process_destination');
        if (!destination) {
          throw new Error('Destination service not found.');
        }

        const sURL = "/workflow/rest/v1/workflow-instances";
        const result = await destination.send('POST', sURL, oPayload, {
          "Content-Type": "application/json"
        });

        console.log('Workflow triggered successfully:', JSON.stringify(result));
        return JSON.stringify(result);
      } catch (e) {
        console.error('Error triggering workflow:', e.message);
        return req.error(500, `Failed to trigger workflow: ${e.message}`);
      }
    })

    return super.init()
  }
}
