namespace my.employees;

entity Employees {
  key ID     : UUID;
      Name   : String(100);
      Role   : String(50);
      Email  : String(100);
}
