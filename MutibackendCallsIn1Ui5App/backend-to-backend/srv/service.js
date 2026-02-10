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
      oRequestConfig.url = '/odata/v4/catalog/Items';
      oRequestConfig.headers['Content-Type'] = "application/json";

      let response = await axios.request(oRequestConfig).catch((e) => { console.log(e) });
      console.log(response);
      return 'success'
    })
    return super.init()
  }
}
