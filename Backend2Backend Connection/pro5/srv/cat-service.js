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
          currency: currency || 'USD',
          status: 'Initiated'
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
            headers: { 'Content-Type': 'application/json' },
            fetchCsrfToken: false
          }
        );

        console.log('Workflow triggered successfully:', JSON.stringify(response.data));
        return response.data.id; // workflow instance id
      } catch (error) {
        console.error('Error triggering workflow:', error.response?.data || error.message);
        return req.error(500, `Failed to trigger workflow: ${error.message}`);
      }
    })

    // =======================
    // ACCEPT WORKFLOW (called by BPA)
    // =======================
    this.on('acceptWorkflow', async (req) => {
      const { instanceId } = req.data;

      if (!instanceId) {
        return req.error(400, 'instanceId is required');
      }

      const updatePayload = {
        status: 'Accepted'
      };

      console.log(`Updating workflow instance ${instanceId} to Accepted`);

      try {
        const response = await executeHttpRequest(
          { destinationName: 'spa_process_destination' },
          {
            method: 'PATCH',
            url: `/${instanceId}/context`,
            data: updatePayload,
            headers: { 'Content-Type': 'application/json' },
            fetchCsrfToken: false
          }
        );

        console.log('Workflow context updated to Accepted:', JSON.stringify(response.data));
        return `Workflow instance ${instanceId} context updated to Accepted`;
      } catch (error) {
        console.error('Error updating workflow to Accepted:', error.response?.data || error.message);
        return req.error(500, `Failed to update workflow: ${error.message}`);
      }
    })

    // =======================
    // REJECT WORKFLOW (called by BPA)
    // =======================
    this.on('rejectWorkflow', async (req) => {
      const { instanceId } = req.data;

      if (!instanceId) {
        return req.error(400, 'instanceId is required');
      }

      const updatePayload = {
        status: 'Rejected'
      };

      console.log(`Updating workflow instance ${instanceId} to Rejected`);

      try {
        const response = await executeHttpRequest(
          { destinationName: 'spa_process_destination' },
          {
            method: 'PATCH',
            url: `/${instanceId}/context`,
            data: updatePayload,
            headers: { 'Content-Type': 'application/json' },
            fetchCsrfToken: false
          }
        );

        console.log('Workflow context updated to Rejected:', JSON.stringify(response.data));
        return `Workflow instance ${instanceId} context updated to Rejected`;
      } catch (error) {
        console.error('Error updating workflow to Rejected:', error.response?.data || error.message);
        return req.error(500, `Failed to update workflow: ${error.message}`);
      }
    })

    return super.init()
  }
}
