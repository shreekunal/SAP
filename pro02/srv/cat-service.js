const cds = require('@sap/cds')

module.exports = class CatalogService extends cds.ApplicationService {
  init() {
    console.log(' CatalogService handler initialized ');

    const { SalesOrders, SalesOrderItems, OrderAttachments } = cds.entities('CatalogService')

    // Safe demo handler for CREATE only
    this.before('CREATE', SalesOrders, async (req) => {
      console.log('Before CREATE SalesOrders')
      console.log('Request data:', JSON.stringify(req.data, null, 2))

      // Only set an orderNo if the client didn't provide one
      if (!req.data.orderNo) {
        req.data.orderNo = 'AUTO-' + Date.now()
        console.log('Auto-generated orderNo:', req.data.orderNo)
      }
      debugger; // Break here when creating a sales order
    })

    this.before(['CREATE', 'UPDATE'], SalesOrders, async (req) => {
      console.log(' Before CREATE/UPDATE SalesOrders (generic) ', req.data)
    })

    // Demo: this.on handlers for SalesOrders
    this.on('CREATE', SalesOrders, async (req, next) => {
      debugger; // Break here when creating a sales order
      console.log('ON CREATE SalesOrders - before processing')
      console.log('Request data:', req.data)

      // You can modify the request data here
      if (req.data.status === 'Draft') {
        req.data.isDraft = true
        console.log('Marked as draft order')
      }

      // Call next() to continue processing
      const result = await next()
      console.log('ON CREATE SalesOrders - after processing', result)
      return result
    })

    this.on('UPDATE', SalesOrders, async (req, next) => {
      debugger; // Break here when updating a sales order
      console.log('ON UPDATE SalesOrders')
      console.log('Original data:', req.data)
      console.log('Query:', req.query)

      // You can add custom business logic here
      if (req.data.status === 'Submitted' && req.data.isDraft) {
        req.data.isDraft = false
        console.log('Order promoted from draft to submitted')
      }

      return next()
    })

    this.on('DELETE', SalesOrders, async (req, next) => {
      debugger; // Break here when deleting a sales order
      console.log('ON DELETE SalesOrders')
      console.log('Deleting order with ID:', req.params[0])

      // You could add validation logic here
      // For example, prevent deletion of submitted orders
      const orderId = req.params[0]
      console.log('Deleting order:', orderId)

      return next()
    })

    // Additional this.before handlers for SalesOrders
    this.before('UPDATE', SalesOrders, async (req) => {
      debugger; // Break here when updating a sales order
      console.log('BEFORE UPDATE SalesOrders')
      console.log('Update data:', req.data)

      // Validation example: Prevent updating submitted orders
      if (req.data.status === 'Submitted') {
        // You could throw an error here to prevent the update
        console.log('Updating submitted order - additional validation could go here')
      }

      // Auto-set modification timestamp
      req.data.modifiedAt = new Date()
      console.log('Set modification timestamp')
    })

    this.before('DELETE', SalesOrders, async (req) => {
      debugger; // Break here when deleting a sales order
      console.log('BEFORE DELETE SalesOrders')
      console.log('Order ID to delete:', req.params[0])

      // You could add pre-deletion logic here
      // For example, check if order has dependencies
      console.log('Pre-deletion checks could go here')
    })

    this.after('READ', SalesOrders, async (salesOrders, req) => {
      debugger; // Break here when reading orders
      console.log('After READ SalesOrders', salesOrders)

      // You can modify the response data here
      if (Array.isArray(salesOrders)) {
        salesOrders.forEach(order => {
          // Add computed fields
          order.displayName = `${order.orderNo} - ${order.customerName}`
          console.log('Added displayName to order:', order.displayName)
        })
      } else {
        // Single order
        salesOrders.displayName = `${salesOrders.orderNo} - ${salesOrders.customerName}`
      }
    })

    // Demo: Custom action handler using this.on
    this.on('submitOrder', SalesOrders, async (req) => {
      debugger; // Break here when submitting an order
      console.log('Custom action: submitOrder called')
      console.log('Order ID:', req.params[0])
      console.log('Action data:', req.data)

      // Custom business logic for submitting an order
      const orderId = req.params[0]

      // You could update the order status here
      console.log('Order submission logic would go here')

      return { success: true, message: 'Order submitted successfully' }
    })

    // Demo: Custom function handler
    this.on('getOrderSummary', SalesOrders, async (req) => {
      debugger; // Break here when getting order summary
      console.log('Custom function: getOrderSummary called')
      console.log('Parameters:', req.params)

      // Return computed data without modifying entities
      return {
        totalOrders: 42,
        pendingOrders: 5,
        completedOrders: 37,
        lastUpdated: new Date()
      }
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
    this.on('getAllOrderTotals', async () => {

      const db = await cds.connect.to('db');

      const result = await db.run(`
      CALL GET_ALL_ORDER_TOTALS(?)
    `);

      // CAP expects plain array → procedure already returns that
      return result;
    });

    return super.init()
  }
}
