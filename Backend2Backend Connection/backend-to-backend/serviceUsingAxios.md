const cds = require('@sap/cds')
const { SELECT } = require('@sap/cds/lib/ql/cds-ql')
const cloudSDK = require('@sap-cloud-sdk/core')
const axios = require('axios')
module.exports = class test extends cds.ApplicationService {
  init() {
    this.on('getData', async (req) => {
      let oDestination = await cloudSDK.getDestination('devpro4');
      let oRequestConfig = await cloudSDK.buildHttpRequest(oDestination);
      oRequestConfig.method = 'GET';
      oRequestConfig.url = '/odata/v4/orders/Orders';
      oRequestConfig.headers['Content-Type'] = "application/json";

      try {
        let response = await axios.request(oRequestConfig);
        console.log('Response data:', JSON.stringify(response.data));
        return response.data;
      } catch (e) {
        console.error('Error calling pro4:', e.response?.status, e.response?.data || e.message);
        req.error(500, 'Failed to fetch data from pro4');
      }
    })

    this.on('createOrder', async (req) => {
      const { OrderNo, Amount, Currency } = req.data;

      let oDestination = await cloudSDK.getDestination('devpro4');
      let oRequestConfig = await cloudSDK.buildHttpRequest(oDestination);
      oRequestConfig.method = 'POST';
      oRequestConfig.url = '/odata/v4/orders/Orders';
      oRequestConfig.headers['Content-Type'] = 'application/json';
      oRequestConfig.data = { OrderNo, Amount, Currency };

      try {
        let response = await axios.request(oRequestConfig);
        console.log('Created order:', JSON.stringify(response.data));
        return JSON.stringify(response.data);
      } catch (e) {
        console.error('Error creating order in pro4:', e.response?.status, e.response?.data || e.message);
        req.error(500, 'Failed to create order in pro4');
      }
    })

    return super.init()
  }
}