package com.fpt.resource_allocation.config;

import com.fpt.resource_allocation.entity.Employee;
import com.fpt.resource_allocation.entity.Project;
import com.fpt.resource_allocation.entity.ProjectStatus;
import com.fpt.resource_allocation.entity.Allocation;
import com.fpt.resource_allocation.repository.EmployeeRepository;
import com.fpt.resource_allocation.repository.ProjectRepository;
import com.fpt.resource_allocation.repository.AllocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final AllocationRepository allocationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (employeeRepository.count() == 0 && projectRepository.count() == 0) {
            log.info("Initializing sample database data...");

            // Create Employees
            Employee emp1 = employeeRepository.save(Employee.builder()
                    .employeeCode("EMP001")
                    .fullName("Tuan Ho Anh")
                    .email("tuanha@company.com")
                    .role("Senior Developer")
                    .department("FSOFT-Q1")
                    .build());

            Employee emp2 = employeeRepository.save(Employee.builder()
                    .employeeCode("EMP002")
                    .fullName("Nguyen Van A")
                    .email("anv@company.com")
                    .role("Java Developer")
                    .department("FSOFT-Q2")
                    .build());

            Employee emp3 = employeeRepository.save(Employee.builder()
                    .employeeCode("EMP003")
                    .fullName("Tran Thi B")
                    .email("btt@company.com")
                    .role("Project Manager")
                    .department("FSOFT-Q1")
                    .build());

            Employee emp4 = employeeRepository.save(Employee.builder()
                    .employeeCode("EMP004")
                    .fullName("Le Van C")
                    .email("clv@company.com")
                    .role("QC Engineer")
                    .department("FSOFT-Q3")
                    .build());

            // Create Projects
            Project proj1 = projectRepository.save(Project.builder()
                    .projectCode("PRJ_NCG")
                    .projectName("NCG System")
                    .customer("NCG Corp")
                    .startDate(LocalDate.now().minusMonths(1))
                    .endDate(LocalDate.now().plusMonths(11))
                    .status(ProjectStatus.ACTIVE)
                    .build());

            Project proj2 = projectRepository.save(Project.builder()
                    .projectCode("PRJ_GRID")
                    .projectName("GRID Platform")
                    .customer("Grid Global")
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(6))
                    .status(ProjectStatus.PLANNING)
                    .build());

            Project proj3 = projectRepository.save(Project.builder()
                    .projectCode("PRJ_COMP")
                    .projectName("Legacy System Support")
                    .customer("FPT Customer")
                    .startDate(LocalDate.now().minusMonths(12))
                    .endDate(LocalDate.now().minusMonths(1))
                    .status(ProjectStatus.COMPLETED)
                    .build());

            // Create Allocations
            // Emp1: 60% NCG, 40% GRID (Total 100%)
            allocationRepository.save(Allocation.builder()
                    .employee(emp1)
                    .project(proj1)
                    .allocationPercent(60)
                    .roleInProject("Backend Developer")
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(6))
                    .build());

            allocationRepository.save(Allocation.builder()
                    .employee(emp1)
                    .project(proj2)
                    .allocationPercent(40)
                    .roleInProject("Fullstack Lead")
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(3))
                    .build());

            // Emp2: 50% NCG (Total 50%)
            allocationRepository.save(Allocation.builder()
                    .employee(emp2)
                    .project(proj1)
                    .allocationPercent(50)
                    .roleInProject("Java Developer")
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(6))
                    .build());

            // Emp3: 95% GRID (Total 95% -> Overloaded > 90%)
            allocationRepository.save(Allocation.builder()
                    .employee(emp3)
                    .project(proj2)
                    .allocationPercent(95)
                    .roleInProject("Project Coordinator")
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(4))
                    .build());

            // Emp4 has 0 allocations (100% available)

            log.info("Sample database initialization completed successfully.");
        } else {
            log.info("Database already contains data, skipping initialization.");
        }
    }
}
