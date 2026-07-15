package com.fpt.resource_allocation.service;

import com.fpt.resource_allocation.dto.ProjectRequestDTO;
import com.fpt.resource_allocation.entity.Project;
import com.fpt.resource_allocation.exception.InvalidAllocationException;
import com.fpt.resource_allocation.exception.ProjectNotFoundException;
import com.fpt.resource_allocation.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public Project createProject(ProjectRequestDTO request) {
        if (projectRepository.existsByProjectCode(request.getProjectCode())) {
            throw new InvalidAllocationException("Project code " + request.getProjectCode() + " already exists");
        }
        Project project = modelMapper.map(request, Project.class);
        return projectRepository.save(project);
    }

    @Override
    @Transactional
    public Project updateProject(Long id, ProjectRequestDTO request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id " + id));

        if (!project.getProjectCode().equals(request.getProjectCode())
                && projectRepository.existsByProjectCode(request.getProjectCode())) {
            throw new InvalidAllocationException("Project code " + request.getProjectCode() + " already exists");
        }

        modelMapper.map(request, project);

        return projectRepository.save(project);
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id " + id));
    }
}
