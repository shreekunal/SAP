service DashboardService {
  type OrderDTO {
    ID       : UUID;
    OrderNo  : String;
    Amount   : Decimal(15,2);
    Currency : String;
  }

  type EmployeeDTO {
    ID    : UUID;
    Name  : String;
    Role  : String;
    Email : String;
  }

  function getDashboard()
    returns {
      orders    : many OrderDTO;
      employees : many EmployeeDTO;
    };
}
