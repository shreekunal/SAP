const cds = require('@sap/cds')

module.exports = class OrdersService extends cds.ApplicationService { init() {

  const { Orders } = cds.entities('OrdersService')

  this.before (['CREATE', 'UPDATE'], Orders, async (req) => {
    console.log('Before CREATE/UPDATE Orders', req.data)
  })
  this.after ('READ', Orders, async (orders, req) => {
    console.log('After READ Orders', orders)
  })


  return super.init()
}}
