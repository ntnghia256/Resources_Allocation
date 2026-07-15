-- SQL Script to Create Tables for Resource Allocation Management System

-- 1. Create employee table
CREATE TABLE IF NOT EXISTS employee (
    employee_id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    department VARCHAR(50)
);

-- 2. Create project table
CREATE TABLE IF NOT EXISTS project (
    project_id BIGSERIAL PRIMARY KEY,
    project_code VARCHAR(20) UNIQUE NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    customer VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL -- Status can be PLANNING, ACTIVE, COMPLETED
);

-- 3. Create allocation table
CREATE TABLE IF NOT EXISTS allocation (
    allocation_id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    allocation_percent INTEGER NOT NULL,
    role_in_project VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT fk_allocation_employee FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_project FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE
);
