package com.fpt.resource_allocation.controller;

import com.fpt.resource_allocation.dto.AllocationRequestDTO;
import com.fpt.resource_allocation.entity.Allocation;
import com.fpt.resource_allocation.service.AllocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/allocations")
@RequiredArgsConstructor
public class AllocationController {

    private final AllocationService allocationService;

    @PostMapping
    public ResponseEntity<Allocation> createAllocation(@Valid @RequestBody AllocationRequestDTO request) {
        Allocation allocation = allocationService.createAllocation(request);
        return new ResponseEntity<>(allocation, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Allocation> updateAllocation(@PathVariable Long id, @Valid @RequestBody AllocationRequestDTO request) {
        Allocation allocation = allocationService.updateAllocation(id, request);
        return ResponseEntity.ok(allocation);
    }

    @GetMapping
    public ResponseEntity<List<Allocation>> getAllAllocations() {
        return ResponseEntity.ok(allocationService.getAllAllocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Allocation> getAllocationById(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.getAllocationById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long id) {
        allocationService.deleteAllocation(id);
        return ResponseEntity.noContent().build();
    }
}
