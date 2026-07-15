package com.fpt.resource_allocation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverloadedEmployeeReportDTO {
    private Long employeeId;
    private String employeeName;
    private Integer totalAllocation;
}
