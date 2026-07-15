package com.fpt.resource_allocation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "allocation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    private Long allocationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "allocation_percent", nullable = false)
    private Integer allocationPercent;

    @Column(name = "role_in_project", length = 100)
    private String roleInProject;

    @Column(name = "start_date", nullable = false)
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "dd/MM/yyyy")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fpt.resource_allocation.config.MultiFormatLocalDateDeserializer.class)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "dd/MM/yyyy")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fpt.resource_allocation.config.MultiFormatLocalDateDeserializer.class)
    private LocalDate endDate;
}
