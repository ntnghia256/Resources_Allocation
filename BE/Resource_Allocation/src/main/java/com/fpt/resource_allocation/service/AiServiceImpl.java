package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.AiRecommendationItemDTO;
import com.fpt.resource_allocation.dto.AiRecommendationResponseDTO;
import com.fpt.resource_allocation.entity.Employee;
import com.fpt.resource_allocation.repository.AllocationRepository;
import com.fpt.resource_allocation.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final EmployeeRepository employeeRepository;
    private final AllocationRepository allocationRepository;

    @Autowired(required = false)
    private ChatModel chatModel;

    @Override
    public AiRecommendationResponseDTO getRecommendation(String prompt) {
        log.info("Processing AI resource recommendation for prompt: \"{}\"", prompt);
        
        if (chatModel != null) {
            try {
                // Prepare database context
                List<Employee> employees = employeeRepository.findAll();
                StringBuilder context = new StringBuilder("Here is the list of employees and their roles and available capacity:\n");
                for (Employee emp : employees) {
                    int totalAlloc = allocationRepository.sumAllocationPercentByEmployeeId(emp.getEmployeeId());
                    int available = 100 - totalAlloc;
                    context.append(String.format("- Name: %s, Role: %s, Available Capacity: %d%%\n", 
                            emp.getFullName(), emp.getRole(), available));
                }

                String systemPrompt = "You are a Resource Management Assistant. " +
                        "Based on the employee data context provided, answer the user's recommendation request. " +
                        "You must return ONLY a JSON response in the following format:\n" +
                        "{\n" +
                        "  \"recommendedResources\": [\n" +
                        "    { \"employee\": \"Employee Name\", \"available\": 60 }\n" +
                        "  ]\n" +
                        "}\n" +
                        "Do not include any explanation or markdown formatting like ```json. Just raw JSON.\n\n" +
                        context.toString();

                String aiResponse = chatModel.call(systemPrompt + "\nUser request: " + prompt);
                log.info("Received OpenAI response: {}", aiResponse);
                
                // Parse JSON using Jackson
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                // Clean response in case markdown wrap is returned
                String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
                return mapper.readValue(cleanJson, AiRecommendationResponseDTO.class);
            } catch (Exception e) {
                log.warn("Spring AI call failed or api-key is invalid. Falling back to Rule-based recommendation. Error: {}", e.getMessage());
            }
        }
        
        return getRuleBasedRecommendation(prompt);
    }

    @Override
    public String getRiskDetection(String prompt) {
        log.info("Processing AI risk detection for prompt: \"{}\"", prompt);

        if (chatModel != null) {
            try {
                List<Employee> employees = employeeRepository.findAll();
                StringBuilder context = new StringBuilder("Here is the list of employees, roles, and available capacity:\n");
                for (Employee emp : employees) {
                    int totalAlloc = allocationRepository.sumAllocationPercentByEmployeeId(emp.getEmployeeId());
                    int available = 100 - totalAlloc;
                    context.append(String.format("- Name: %s, Role: %s, Available Capacity: %d%%\n", 
                            emp.getFullName(), emp.getRole(), available));
                }

                String systemPrompt = "You are a Resource Risk Management Expert. " +
                        "Based on the company resource status provided, analyze the risk of the user's plan. " +
                        "Respond with a short list of risks in text format exactly like:\n" +
                        "Risk:\n" +
                        "- Team is using X% capacity.\n" +
                        "- Only Y resources available above Z%.\n\n" +
                        context.toString();

                String aiResponse = chatModel.call(systemPrompt + "\nUser plan: " + prompt);
                return aiResponse.trim();
            } catch (Exception e) {
                log.warn("Spring AI call failed or api-key is invalid. Falling back to Rule-based risk detection. Error: {}", e.getMessage());
            }
        }

        return getRuleBasedRiskDetection(prompt);
    }

    private AiRecommendationResponseDTO getRuleBasedRecommendation(String prompt) {
        String promptLower = prompt.toLowerCase();
        
        // Parse role keyword
        String roleKeyword = "";
        if (promptLower.contains("java")) {
            roleKeyword = "java";
        } else if (promptLower.contains("qc") || promptLower.contains("tester")) {
            roleKeyword = "qc";
        } else if (promptLower.contains("pm") || promptLower.contains("project manager")) {
            roleKeyword = "project manager";
        } else if (promptLower.contains("senior")) {
            roleKeyword = "senior";
        }

        // Parse min available percent
        int minAvailable = 0;
        Pattern pattern = Pattern.compile("(\\d+)");
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            minAvailable = Integer.parseInt(matcher.group(1));
        }

        List<Employee> allEmployees = employeeRepository.findAll();
        List<AiRecommendationItemDTO> recommended = new ArrayList<>();
        
        for (Employee emp : allEmployees) {
            int totalAlloc = allocationRepository.sumAllocationPercentByEmployeeId(emp.getEmployeeId());
            int available = 100 - totalAlloc;
            
            boolean roleMatches = roleKeyword.isEmpty() 
                    || (emp.getRole() != null && emp.getRole().toLowerCase().contains(roleKeyword));
            
            if (roleMatches && available >= minAvailable) {
                recommended.add(new AiRecommendationItemDTO(emp.getFullName(), available));
            }
        }

        return new AiRecommendationResponseDTO(recommended);
    }

    private String getRuleBasedRiskDetection(String prompt) {
        String promptLower = prompt.toLowerCase();

        // Parse role keyword
        String roleKeyword = "";
        if (promptLower.contains("java")) {
            roleKeyword = "java";
        } else if (promptLower.contains("qc") || promptLower.contains("tester")) {
            roleKeyword = "qc";
        } else if (promptLower.contains("pm") || promptLower.contains("project manager")) {
            roleKeyword = "project manager";
        } else if (promptLower.contains("senior")) {
            roleKeyword = "senior";
        }

        final String finalRoleKeyword = roleKeyword;
        List<Employee> team = employeeRepository.findAll().stream()
                .filter(e -> e.getRole() != null && e.getRole().toLowerCase().contains(finalRoleKeyword))
                .collect(Collectors.toList());

        int teamUsage = 0;
        int availableResourceWithAtLeast50 = 0;

        if (!team.isEmpty()) {
            int totalAllocationSum = 0;
            for (Employee emp : team) {
                int alloc = allocationRepository.sumAllocationPercentByEmployeeId(emp.getEmployeeId());
                totalAllocationSum += alloc;
                if (100 - alloc >= 50) {
                    availableResourceWithAtLeast50++;
                }
            }
            teamUsage = totalAllocationSum / team.size();
        }

        return "Risk:\n" +
                "- Team " + (roleKeyword.isEmpty() ? "" : roleKeyword + " ") + "đang sử dụng " + teamUsage + "% capacity.\n" +
                "- Chỉ còn " + availableResourceWithAtLeast50 + " resource available trên 50%.";
    }
}
