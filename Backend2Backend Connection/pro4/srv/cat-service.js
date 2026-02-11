const cds = require('@sap/cds')

module.exports = class OrdersService extends cds.ApplicationService {
  async init() {

    const { Orders } = cds.entities('OrdersService')

    this.before(['CREATE', 'UPDATE'], Orders, async (req) => {
      console.log('Before CREATE/UPDATE Orders', req.data)
    })
    this.after('READ', Orders, async (orders, req) => {
      console.log('After READ Orders', orders)
    })

    // =======================
    // SECURITY ACTION
    // =======================
    this.on('securityAction', async (req) => {
      let securityScope = {
        Read: req.user.is('Read'),
        Create: req.user.is('Create'),
        Delete: req.user.is('Delete'),
        Update: req.user.is('Update'),
      };

      console.log('Security Roles', JSON.stringify(securityScope));
      return JSON.stringify(securityScope);
    })

    return super.init()
  }
}
