const cds = require('@sap/cds')
const { SELECT, INSERT } = require('@sap/cds/lib/ql/cds-ql')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')

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
      Display: req.user.is('Display'),
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
    // SAY HI (requires Read scope)
    // =======================
    this.on('sayHi', async (req) => {
      return `Hi ${req.data.name}`
    })

    // =======================
    // ADD RECORD TO DESTINATION TABLE (requires Create scope)
    // =======================
    this.on('addRecordToDestinationTableBooks', async (req) => {
      const { ID, title, stock } = req.data.payload

      if (!ID || !title) return req.error(400, 'ID and title are required')

      try {
        const response = await executeHttpRequest(
          { destinationName: 'test-app-1-dest' },
          {
            method: 'POST',
            url: '/odata/v4/catalog/Books',
            data: { ID, title, stock },
          }
        )
        return JSON.stringify(response.data)
      } catch (e) {
        console.error(e.response?.data || e.message)
        return req.error(500, 'Failed to insert book')
      }
    })

    return super.init()
  }
}
