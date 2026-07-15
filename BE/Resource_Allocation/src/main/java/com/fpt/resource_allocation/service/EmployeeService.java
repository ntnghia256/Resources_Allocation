package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.EmployeeRequestDTO;
import com.fpt.resource_allocation.entity.Employee;
import java.util.List;

public interface EmployeeService {
    Employee createEmployee(EmployeeRequestDTO request);
    List<Employee> getAllEmployees();
    Employee getEmployeeById(Long id);
}
