package com.fpt.resource_allocation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiRecommendationItemDTO {
    private String employee;
    private Integer available;
}
