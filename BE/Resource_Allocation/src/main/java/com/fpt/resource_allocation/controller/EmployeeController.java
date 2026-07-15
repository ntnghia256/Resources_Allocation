package com.fpt.resource_allocation.controller;

import com.fpt.resource_allocation.dto.EmployeeRequestDTO;
import com.fpt.resource_allocation.dto.EmployeeWorkloadResponseDTO;
import com.fpt.resource_allocation.entity.Employee;
import com.fpt.resource_allocation.service.EmployeeService;
import com.fpt.resource_allocation.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody EmployeeRequestDTO request) {
        Employee employee = employeeService.createEmployee(request);
        return new ResponseEntity<>(employee, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/{id}/workload")
    public ResponseEntity<EmployeeWorkloadResponseDTO> getEmployeeWorkload(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getEmployeeWorkload(id));
    }
}
