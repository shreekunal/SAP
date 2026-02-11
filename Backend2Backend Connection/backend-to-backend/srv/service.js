const cds = require("@sap/cds");
const { executeHttpRequest } = require("@sap-cloud-sdk/http-client");

module.exports = class test extends cds.ApplicationService {
  async init() {

    // =======================
    // GET DATA
    // =======================
    this.on("getData", async (req) => {
      try {
        const response = await executeHttpRequest(
          { destinationName: "devpro4" },
          {
            method: "GET",
            url: "/odata/v4/orders/Orders",
          }
        );

        console.log("Response data:", JSON.stringify(response.data));
        return response.data;
      } catch (e) {
        console.error(e.response?.data || e.message);
        return req.error(500, "Failed to fetch orders from pro4");
      }
    });

    // =======================
    // CREATE ORDER
    // =======================
    this.on("createOrder", async (req) => {
      const { OrderNo, Amount, Currency } = req.data;

      try {
        const response = await executeHttpRequest(
          { destinationName: "devpro4" },
          {
            method: "POST",
            url: "/odata/v4/orders/Orders",
            data: { OrderNo, Amount, Currency },
          }
        );

        console.log("Created order:", JSON.stringify(response.data));
        return JSON.stringify(response.data);
      } catch (e) {
        console.error(e.response?.data || e.message);
        return req.error(500, "Failed to create order in pro4");
      }
    });

    return super.init();
  }
};