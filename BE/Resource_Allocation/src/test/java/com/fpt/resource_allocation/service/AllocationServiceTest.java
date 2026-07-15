package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.AllocationRequestDTO;
import com.fpt.resource_allocation.entity.Allocation;
import com.fpt.resource_allocation.entity.Employee;
import com.fpt.resource_allocation.entity.Project;
import com.fpt.resource_allocation.entity.ProjectStatus;
import com.fpt.resource_allocation.exception.AllocationExceededException;
import com.fpt.resource_allocation.exception.InvalidAllocationException;
import com.fpt.resource_allocation.repository.AllocationRepository;
import com.fpt.resource_allocation.repository.EmployeeRepository;
import com.fpt.resource_allocation.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTest {

    @Mock
    private AllocationRepository allocationRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @org.mockito.Spy
    private org.modelmapper.ModelMapper modelMapper = new org.modelmapper.ModelMapper();

    @InjectMocks
    private AllocationServiceImpl allocationService;

    private Employee employee;
    private Project activeProject;
    private Project completedProject;
    private AllocationRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        modelMapper.getConfiguration()
                .setMatchingStrategy(org.modelmapper.convention.MatchingStrategies.STRICT)
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setSkipNullEnabled(true);

        employee = Employee.builder()
                .employeeId(1L)
                .employeeCode("EMP001")
                .fullName("Tuan Ho Anh")
                .email("tuanha@company.com")
                .build();

        activeProject = Project.builder()
                .projectId(1L)
                .projectCode("PRJ_ACTIVE")
                .projectName("Active Project")
                .status(ProjectStatus.ACTIVE)
                .build();

        completedProject = Project.builder()
                .projectId(2L)
                .projectCode("PRJ_COMPLETED")
                .projectName("Completed Project")
                .status(ProjectStatus.COMPLETED)
                .build();

        validRequest = new AllocationRequestDTO();
        validRequest.setEmployeeId(1L);
        validRequest.setProjectId(1L);
        validRequest.setAllocationPercent(50);
        validRequest.setRoleInProject("Backend Developer");
        validRequest.setStartDate(LocalDate.now());
        validRequest.setEndDate(LocalDate.now().plusMonths(6));
    }

    @Test
    void createAllocation_WhenProjectIsCompleted_ShouldThrowInvalidAllocationException() {
        validRequest.setProjectId(completedProject.getProjectId());

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(completedProject));

        InvalidAllocationException exception = assertThrows(InvalidAllocationException.class, () -> {
            allocationService.createAllocation(validRequest);
        });

        assertEquals("Cannot allocate to a completed project", exception.getMessage());
        verify(allocationRepository, never()).save(any(Allocation.class));
    }

    @Test
    void createAllocation_WhenPercentIsInvalid_ShouldThrowInvalidAllocationException() {
        validRequest.setAllocationPercent(101); // Invalid: > 100

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(activeProject));

        InvalidAllocationException exception = assertThrows(InvalidAllocationException.class, () -> {
            allocationService.createAllocation(validRequest);
        });

        assertEquals("Allocation percent must be between 1 and 100", exception.getMessage());
        verify(allocationRepository, never()).save(any(Allocation.class));
    }

    @Test
    void createAllocation_WhenTotalAllocationExceeds100_ShouldThrowAllocationExceededException() {
        // Emp has current allocation of 60%
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.sumAllocationPercentByEmployeeId(1L)).thenReturn(60);

        // Valid request tries to add 50% (Total: 110% -> exceeds 100%)
        validRequest.setAllocationPercent(50);

        AllocationExceededException exception = assertThrows(AllocationExceededException.class, () -> {
            allocationService.createAllocation(validRequest);
        });

        assertEquals("Employee allocation exceeds 100%", exception.getMessage());
        verify(allocationRepository, never()).save(any(Allocation.class));
    }

    @Test
    void createAllocation_WhenValid_ShouldSaveSuccessfully() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.sumAllocationPercentByEmployeeId(1L)).thenReturn(40);

        Allocation expectedAllocation = Allocation.builder()
                .allocationId(10L)
                .employee(employee)
                .project(activeProject)
                .allocationPercent(50)
                .roleInProject("Backend Developer")
                .startDate(validRequest.getStartDate())
                .endDate(validRequest.getEndDate())
                .build();

        when(allocationRepository.save(any(Allocation.class))).thenReturn(expectedAllocation);

        Allocation result = allocationService.createAllocation(validRequest);

        assertNotNull(result);
        assertEquals(10L, result.getAllocationId());
        assertEquals(50, result.getAllocationPercent());
        verify(allocationRepository, times(1)).save(any(Allocation.class));
    }
}
