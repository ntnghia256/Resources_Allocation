package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.AvailableResourceReportDTO;
import com.fpt.resource_allocation.dto.EmployeeUtilizationReportDTO;
import com.fpt.resource_allocation.dto.EmployeeWorkloadResponseDTO;
import com.fpt.resource_allocation.dto.OverloadedEmployeeReportDTO;
import com.fpt.resource_allocation.entity.Employee;
import com.fpt.resource_allocation.exception.EmployeeNotFoundException;
import com.fpt.resource_allocation.repository.AllocationRepository;
import com.fpt.resource_allocation.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final EmployeeRepository employeeRepository;
    private final AllocationRepository allocationRepository;

    @Override
    public EmployeeWorkloadResponseDTO getEmployeeWorkload(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id " + employeeId));

        int totalAllocation = allocationRepository.sumAllocationPercentByEmployeeId(employeeId);
        int available = Math.max(0, 100 - totalAllocation);

        return EmployeeWorkloadResponseDTO.builder()
                .employeeId(employee.getEmployeeId())
                .employeeName(employee.getFullName())
                .totalAllocation(totalAllocation)
                .available(available)
                .build();
    }

    @Override
    public List<EmployeeUtilizationReportDTO> getEmployeeUtilizationReport() {
        List<Object[]> rawData = allocationRepository.getEmployeeUtilizationReport();
        return rawData.stream()
                .map(row -> EmployeeUtilizationReportDTO.builder()
                        .employeeId((Long) row[0])
                        .employeeName((String) row[1])
                        .totalAllocation(((Number) row[2]).intValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailableResourceReportDTO> getAvailableResourceReport() {
        List<Object[]> rawData = allocationRepository.getEmployeeUtilizationReport();
        return rawData.stream()
                .map(row -> {
                    Long id = (Long) row[0];
                    String name = (String) row[1];
                    int totalAlloc = ((Number) row[2]).intValue();
                    return AvailableResourceReportDTO.builder()
                            .employeeId(id)
                            .employeeName(name)
                            .availableAllocation(Math.max(0, 100 - totalAlloc))
                            .build();
                })
                .filter(dto -> dto.getAvailableAllocation() > 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<OverloadedEmployeeReportDTO> getOverloadedEmployeeReport() {
        List<Object[]> rawData = allocationRepository.getEmployeeUtilizationReport();
        return rawData.stream()
                .map(row -> {
                    Long id = (Long) row[0];
                    String name = (String) row[1];
                    int totalAlloc = ((Number) row[2]).intValue();
                    return OverloadedEmployeeReportDTO.builder()
                            .employeeId(id)
                            .employeeName(name)
                            .totalAllocation(totalAlloc)
                            .build();
                })
                .filter(dto -> dto.getTotalAllocation() > 90)
                .collect(Collectors.toList());
    }
}
