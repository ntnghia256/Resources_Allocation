package com.fpt.resource_allocation.controller;

import com.fpt.resource_allocation.dto.AvailableResourceReportDTO;
import com.fpt.resource_allocation.dto.EmployeeUtilizationReportDTO;
import com.fpt.resource_allocation.dto.OverloadedEmployeeReportDTO;
import com.fpt.resource_allocation.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/utilization")
    public ResponseEntity<List<EmployeeUtilizationReportDTO>> getEmployeeUtilizationReport() {
        return ResponseEntity.ok(reportService.getEmployeeUtilizationReport());
    }

    @GetMapping("/available")
    public ResponseEntity<List<AvailableResourceReportDTO>> getAvailableResourceReport() {
        return ResponseEntity.ok(reportService.getAvailableResourceReport());
    }

    @GetMapping("/overloaded")
    public ResponseEntity<List<OverloadedEmployeeReportDTO>> getOverloadedEmployeeReport() {
        return ResponseEntity.ok(reportService.getOverloadedEmployeeReport());
    }
}
