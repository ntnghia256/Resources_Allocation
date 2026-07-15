package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.ProjectRequestDTO;
import com.fpt.resource_allocation.entity.Project;
import java.util.List;

public interface ProjectService {
    Project createProject(ProjectRequestDTO request);
    Project updateProject(Long id, ProjectRequestDTO request);
    List<Project> getAllProjects();
    Project getProjectById(Long id);
}
