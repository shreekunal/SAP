const cds = require('@sap/cds')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')

module.exports = class EmployeesService extends cds.ApplicationService {
  async init() {

    const { Employees } = cds.entities('EmployeesService')

    this.before(['CREATE', 'UPDATE'], Employees, async (req) => {
      console.log('Before CREATE/UPDATE Employees', req.data)
    })
    this.after('READ', Employees, async (employees, req) => {
      console.log('After READ Employees', employees)
    })

    // =======================
    // TRIGGER BPA WORKFLOW
    // =======================
    this.on('triggerWorkflow', async (req) => {
      const { orderId, orderNo, amount, currency } = req.data;

      if (!orderId) {
        return req.error(400, 'orderId is required');
      }

      const oPayload = {
        definitionId: 'us10.058e1c82trial.salesordersmanagement.orderProcessing',
        context: {
          id: parseInt(orderId) || 0,
          orderno: orderNo || '',
          amount: parseFloat(amount) || 0,
          currency: currency || 'USD'
        }
      };

      console.log('Workflow Payload:', JSON.stringify(oPayload));

      try {
        const response = await executeHttpRequest(
          { destinationName: 'spa_process_destination' },
          {
            method: 'POST',
            url: '/',
            data: oPayload,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        console.log('Workflow triggered successfully:', JSON.stringify(response.data));
        return response.data.id; // workflow instance id
      } catch (error) {
        console.error('Error triggering workflow:', error.response?.data || error.message);
        return req.error(500, `Failed to trigger workflow: ${error.message}`);
      }
    })

    return super.init()
  }
}
