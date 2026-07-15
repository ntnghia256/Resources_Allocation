package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.AllocationRequestDTO;
import com.fpt.resource_allocation.entity.Allocation;
import java.util.List;

public interface AllocationService {
    Allocation createAllocation(AllocationRequestDTO request);
    Allocation updateAllocation(Long id, AllocationRequestDTO request);
    List<Allocation> getAllAllocations();
    Allocation getAllocationById(Long id);
    void deleteAllocation(Long id);
}
