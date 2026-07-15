package com.fpt.resource_allocation.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fpt.resource_allocation.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectRequestDTO {

    @NotBlank(message = "Project code is required")
    private String projectCode;

    @NotBlank(message = "Project name is required")
    private String projectName;

    private String customer;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fpt.resource_allocation.config.MultiFormatLocalDateDeserializer.class)
    private LocalDate startDate;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fpt.resource_allocation.config.MultiFormatLocalDateDeserializer.class)
    private LocalDate endDate;

    @NotNull(message = "Project status is required")
    private ProjectStatus status;
}
