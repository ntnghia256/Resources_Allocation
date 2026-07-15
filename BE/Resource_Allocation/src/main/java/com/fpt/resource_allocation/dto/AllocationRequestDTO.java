package com.fpt.resource_allocation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AllocationRequestDTO {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Allocation percent is required")
    @Min(value = 1, message = "Allocation percent must be greater than 0")
    @Max(value = 100, message = "Allocation percent cannot exceed 100")
    private Integer allocationPercent;

    @NotBlank(message = "Role in project is required")
    private String roleInProject;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "dd/MM/yyyy")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fpt.resource_allocation.config.MultiFormatLocalDateDeserializer.class)
    private LocalDate startDate;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "dd/MM/yyyy")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fpt.resource_allocation.config.MultiFormatLocalDateDeserializer.class)
    private LocalDate endDate;
}
