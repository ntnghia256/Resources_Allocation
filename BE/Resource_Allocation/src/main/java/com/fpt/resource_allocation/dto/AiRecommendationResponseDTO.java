package com.fpt.resource_allocation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiRecommendationResponseDTO {
    private List<AiRecommendationItemDTO> recommendedResources;
}
