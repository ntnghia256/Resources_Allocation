package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.AllocationRequestDTO;
import com.fpt.resource_allocation.entity.Allocation;
import com.fpt.resource_allocation.entity.Employee;
import com.fpt.resource_allocation.entity.Project;
import com.fpt.resource_allocation.entity.ProjectStatus;
import com.fpt.resource_allocation.exception.AllocationExceededException;
import com.fpt.resource_allocation.exception.AllocationNotFoundException;
import com.fpt.resource_allocation.exception.EmployeeNotFoundException;
import com.fpt.resource_allocation.exception.InvalidAllocationException;
import com.fpt.resource_allocation.exception.ProjectNotFoundException;
import com.fpt.resource_allocation.repository.AllocationRepository;
import com.fpt.resource_allocation.repository.EmployeeRepository;
import com.fpt.resource_allocation.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AllocationServiceImpl implements AllocationService {

    private final AllocationRepository allocationRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public Allocation createAllocation(AllocationRequestDTO request) {
        log.info("Creating allocation for employeeId: {}, projectId: {}, percent: {}",
                request.getEmployeeId(), request.getProjectId(), request.getAllocationPercent());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id " + request.getEmployeeId()));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id " + request.getProjectId()));

        // Business Rule 3: Cannot allocate to a COMPLETED project
        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new InvalidAllocationException("Cannot allocate to a completed project");
        }

        // Business Rule 1: 0 < allocation <= 100
        int newPercent = request.getAllocationPercent();
        if (newPercent <= 0 || newPercent > 100) {
            throw new InvalidAllocationException("Allocation percent must be between 1 and 100");
        }

        // Business Rule 2: Total allocation of an employee cannot exceed 100%
        int currentSum = allocationRepository.sumAllocationPercentByEmployeeId(request.getEmployeeId());
        if (currentSum + newPercent > 100) {
            throw new AllocationExceededException("Employee allocation exceeds 100%");
        }

        Allocation allocation = modelMapper.map(request, Allocation.class);
        allocation.setEmployee(employee);
        allocation.setProject(project);
        if (allocation.getStartDate() == null) {
            allocation.setStartDate(LocalDate.now());
        }
        if (allocation.getEndDate() == null) {
            allocation.setEndDate(LocalDate.now().plusMonths(6));
        }

        Allocation saved = allocationRepository.save(allocation);
        log.info("Successfully created allocation with id: {}", saved.getAllocationId());
        return saved;
    }

    @Override
    @Transactional
    public Allocation updateAllocation(Long id, AllocationRequestDTO request) {
        log.info("Updating allocation id: {}, percent: {}", id, request.getAllocationPercent());

        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new AllocationNotFoundException("Allocation not found with id " + id));

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id " + request.getEmployeeId()));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id " + request.getProjectId()));

        // Business Rule 3: Cannot allocate to a COMPLETED project
        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new InvalidAllocationException("Cannot allocate to a completed project");
        }

        // Business Rule 1: 0 < allocation <= 100
        int newPercent = request.getAllocationPercent();
        if (newPercent <= 0 || newPercent > 100) {
            throw new InvalidAllocationException("Allocation percent must be between 1 and 100");
        }

        // Business Rule 2: Total allocation of an employee cannot exceed 100% (excluding this allocation)
        int otherSum = allocationRepository.sumAllocationPercentByEmployeeIdExcludingAllocation(request.getEmployeeId(), id);
        if (otherSum + newPercent > 100) {
            throw new AllocationExceededException("Employee allocation exceeds 100%");
        }

        modelMapper.map(request, allocation);
        allocation.setEmployee(employee);
        allocation.setProject(project);

        Allocation updated = allocationRepository.save(allocation);
        log.info("Successfully updated allocation id: {}", updated.getAllocationId());
        return updated;
    }

    @Override
    public List<Allocation> getAllAllocations() {
        return allocationRepository.findAll();
    }

    @Override
    public Allocation getAllocationById(Long id) {
        return allocationRepository.findById(id)
                .orElseThrow(() -> new AllocationNotFoundException("Allocation not found with id " + id));
    }

    @Override
    @Transactional
    public void deleteAllocation(Long id) {
        log.info("Removing allocation id: {}", id);
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new AllocationNotFoundException("Allocation not found with id " + id));
        allocationRepository.delete(allocation);
        log.info("Successfully removed allocation id: {}", id);
    }
}
