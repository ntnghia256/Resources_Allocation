package com.fpt.resource_allocation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiRequestDTO {
    @NotBlank(message = "Prompt is required")
    private String prompt;
}
