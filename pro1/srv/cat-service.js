const cds = require('@sap/cds')

module.exports = class CatalogService extends cds.ApplicationService {
  init() {
    debugger;
    console.log(' CatalogService handler initialized ');

    const { SalesOrders, SalesOrderItems, OrderAttachments } = cds.entities('CatalogService')

    // Safe demo handler for CREATE only
    this.before('CREATE', SalesOrders, async (req) => {
      debugger; 
      console.log('Before CREATE SalesOrders')
      console.log('Request data:', JSON.stringify(req.data, null, 2))

      // Only set an orderNo if the client didn't provide one
      if (!req.data.orderNo) {
        req.data.orderNo = 'AUTO-' + Date.now()
        console.log('Auto-generated orderNo:', req.data.orderNo)
      }
    })

    this.before(['CREATE', 'UPDATE'], SalesOrders, async (req) => {
      console.log(' Before CREATE/UPDATE SalesOrders (generic) ', req.data)
    })
    this.after('READ', SalesOrders, async (salesOrders, req) => {
      debugger; // Break here when reading orders
      console.log('After READ SalesOrders', salesOrders)
    })
    this.before(['CREATE', 'UPDATE'], SalesOrderItems, async (req) => {
      console.log('Before CREATE/UPDATE SalesOrderItems', req.data)
    })
    this.after('READ', SalesOrderItems, async (salesOrderItems, req) => {
      console.log('After READ SalesOrderItems', salesOrderItems)
    })
    this.before(['CREATE', 'UPDATE'], OrderAttachments, async (req) => {
      console.log('Before CREATE/UPDATE OrderAttachments', req.data)
    })
    this.after('READ', OrderAttachments, async (orderAttachments, req) => {
      console.log('After READ OrderAttachments', orderAttachments)
    })

    return super.init()
  }
}
