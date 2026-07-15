package com.fpt.resource_allocation.controller;

import com.fpt.resource_allocation.dto.AiRequestDTO;
import com.fpt.resource_allocation.dto.AiRecommendationResponseDTO;
import com.fpt.resource_allocation.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/recommend")
    public ResponseEntity<AiRecommendationResponseDTO> recommendResources(@Valid @RequestBody AiRequestDTO request) {
        AiRecommendationResponseDTO response = aiService.getRecommendation(request.getPrompt());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/risk-detect")
    public ResponseEntity<String> detectRisks(@Valid @RequestBody AiRequestDTO request) {
        String riskReport = aiService.getRiskDetection(request.getPrompt());
        return ResponseEntity.ok(riskReport);
    }
}
