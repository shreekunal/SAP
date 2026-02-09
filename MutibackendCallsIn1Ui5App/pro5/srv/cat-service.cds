using {my.employees} from '../db/schema';

service EmployeesService {
  entity Employees as projection on employees.Employees;
}
