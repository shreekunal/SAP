const cds = require('@sap/cds')

module.exports = class DashboardService extends cds.ApplicationService {
  async init() {

    const ordersSrv = await cds.connect.to('OrdersServiceRemote');
    const empSrv = await cds.connect.to('EmployeesServiceRemote');

    this.on('getDashboard', async (req) => {

      try {
        const [orders, employees] = await Promise.all([
          ordersSrv.run(SELECT.from('Orders')),
          empSrv.run(SELECT.from('Employees'))
        ]);

        return {
          orders,
          employees
        };

      } catch (err) {
        return req.error(500, 'Failed to fetch dashboard data', err);
      }
    })

    return super.init()
  }
}
