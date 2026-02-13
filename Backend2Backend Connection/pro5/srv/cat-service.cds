using {my.employees} from '../db/schema';

service EmployeesService {
  entity Employees as projection on employees.Employees;

  // Action to trigger SAP Build Process Automation workflow
  action triggerWorkflow(orderId: String, orderNo: String, amount: Decimal, currency: String) returns String;
  // Actions called by BPA to update workflow status
  action acceptWorkflow(instanceId: String)                                                   returns String;
  action rejectWorkflow(instanceId: String)                                                   returns String;
}
