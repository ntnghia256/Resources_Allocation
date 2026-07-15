package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.AiRecommendationResponseDTO;

public interface AiService {
    AiRecommendationResponseDTO getRecommendation(String prompt);
    String getRiskDetection(String prompt);
}
