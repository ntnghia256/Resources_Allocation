package com.fpt.resource_allocation.repository;

import com.fpt.resource_allocation.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String projectCode);
    boolean existsByProjectCode(String projectCode);
}
