package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.EmployeeRequestDTO;
import com.fpt.resource_allocation.entity.Employee;
import com.fpt.resource_allocation.exception.EmployeeNotFoundException;
import com.fpt.resource_allocation.exception.InvalidAllocationException;
import com.fpt.resource_allocation.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public Employee createEmployee(EmployeeRequestDTO request) {
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new InvalidAllocationException("Employee code " + request.getEmployeeCode() + " already exists");
        }
        Employee employee = modelMapper.map(request, Employee.class);
        return employeeRepository.save(employee);
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id " + id));
    }
}
