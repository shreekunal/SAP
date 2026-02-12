const cds = require('@sap/cds')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')

module.exports = class EmployeesService extends cds.ApplicationService {
  init() {

    const { Employees } = cds.entities('EmployeesService')

    this.before(['CREATE', 'UPDATE'], Employees, async (req) => {
      console.log('Before CREATE/UPDATE Employees', req.data)
    })
    this.after('READ', Employees, async (employees, req) => {
      console.log('After READ Employees', employees)
    })

    // Action: Trigger SAP Build Process Automation workflow
    this.on('triggerWorkflow', async (req) => {
      try {
        // Static payload for the BPA workflow
        const oPayload = {
          "definitionId": "us10.058e1c82trial.salesordersmanagement.orderProcessing",
          "context": {
            "id": 1004,
            "orderno": "OD-1001",
            "amount": 0,
            "currency": "USD"
          }
        };

        console.log('Workflow Payload:', JSON.stringify(oPayload));

        // Use SAP Cloud SDK to call the destination directly (avoids CDS path duplication)
        const response = await executeHttpRequest(
          { destinationName: 'spa_process_destination' },
          {
            method: 'POST',
            data: oPayload,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        console.log('Workflow triggered successfully:', JSON.stringify(response.data));
        return JSON.stringify(response.data);

      } catch (error) {
        console.error('Error triggering workflow:', error.message);
        req.error(500, `Failed to trigger workflow: ${error.message}`);
      }
    })

    return super.init()
  }
}
