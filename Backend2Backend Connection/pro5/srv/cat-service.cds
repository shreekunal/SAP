using {my.employees} from '../db/schema';

service EmployeesService {
  entity Employees as projection on employees.Employees;

  // Action to trigger SAP Build Process Automation workflow
  action triggerWorkflow() returns String;
}
