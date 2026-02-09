const cds = require('@sap/cds')

module.exports = class EmployeesService extends cds.ApplicationService { init() {

  const { Employees } = cds.entities('EmployeesService')

  this.before (['CREATE', 'UPDATE'], Employees, async (req) => {
    console.log('Before CREATE/UPDATE Employees', req.data)
  })
  this.after ('READ', Employees, async (employees, req) => {
    console.log('After READ Employees', employees)
  })


  return super.init()
}}
