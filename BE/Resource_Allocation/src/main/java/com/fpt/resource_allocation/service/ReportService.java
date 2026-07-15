package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.AvailableResourceReportDTO;
import com.fpt.resource_allocation.dto.EmployeeUtilizationReportDTO;
import com.fpt.resource_allocation.dto.EmployeeWorkloadResponseDTO;
import com.fpt.resource_allocation.dto.OverloadedEmployeeReportDTO;
import java.util.List;

public interface ReportService {
    EmployeeWorkloadResponseDTO getEmployeeWorkload(Long employeeId);
    List<EmployeeUtilizationReportDTO> getEmployeeUtilizationReport();
    List<AvailableResourceReportDTO> getAvailableResourceReport();
    List<OverloadedEmployeeReportDTO> getOverloadedEmployeeReport();
}
