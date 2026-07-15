package com.fpt.resource_allocation.repository;

import com.fpt.resource_allocation.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    List<Allocation> findByEmployeeEmployeeId(Long employeeId);

    List<Allocation> findByProjectProjectId(Long projectId);

    @Query("SELECT COALESCE(SUM(a.allocationPercent), 0) FROM Allocation a WHERE a.employee.employeeId = :employeeId")
    Integer sumAllocationPercentByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT COALESCE(SUM(a.allocationPercent), 0) FROM Allocation a WHERE a.employee.employeeId = :employeeId AND a.allocationId != :excludeAllocationId")
    Integer sumAllocationPercentByEmployeeIdExcludingAllocation(@Param("employeeId") Long employeeId, @Param("excludeAllocationId") Long excludeAllocationId);

    @Query("SELECT e.employeeId as employeeId, " +
           "e.fullName as employeeName, " +
           "COALESCE(SUM(a.allocationPercent), 0) as totalAllocation " +
           "FROM Employee e LEFT JOIN Allocation a ON a.employee = e " +
           "GROUP BY e.employeeId, e.fullName")
    List<Object[]> getEmployeeUtilizationReport();
}
