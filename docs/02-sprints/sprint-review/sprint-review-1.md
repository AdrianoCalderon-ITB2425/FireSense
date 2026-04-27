# Meeting Minutes - Sprint Review

## Sprint Information

**Sprint:**
- Code / Sprint Name: Sprint 1 - Organization Phase
- Sprint Dates: 15/12/2025 - 27/01/2026

---

**Meeting Details:**
- Date: 19/01/2026 15:00
- Meeting: Sprint Review
- Attendees:
  - Erick García Badaraco
  - Francisco Díaz Encalada
  - Adrià Montero Sánchez

---

## Sprint Goal

| Task / Topic | Notes | Owner | Status | Last Updated |
|------|-------|-------------|--------|---------------------|
| **Task 1.1:** Sprint Planning Meeting + Preliminary Analysis | First team meeting to understand the project, risks, and dependencies. Sprint 1 goal defined: have a clear architecture diagram, technology justification, and a functional MVP. | Francisco Díaz<br>Erick García<br>Adrià Montero | **Completed** | 19/01/2026 |
| **Task 1.2:** Definition of Roles and Key Capabilities | Team alignment: 8 key capabilities, role distribution, shared knowledge, and pair programming plan. | Francisco Díaz<br>Erick García<br>Adrià Montero | **Completed** | 12/01/2026 |
| **Task 1.3:** Detailed Analysis of P0.1 Requirements | Exhaustively extract functional and non-functional requirements, cross-reference with the rubric to ensure total coverage. | Francisco Díaz<br>Erick García<br>Adrià Montero | **Completed** | 12/01/2026 |
| **Task 1.4:** Architecture and Network Topology Design | Create a comprehensive S1-S7 architecture diagram, documenting data flows, ports, protocols, and critical points. | Erick García<br>Adrià Montero | **Completed** | 26/01/2026 |
| **Task 1.5:** ProofHub Setup | Central tool setup: 3 sprints, dashboard, tasks with dates and assignees. | Francisco Díaz<br>Erick García<br>Adrià Montero | **Completed** | 12/01/2026 |
| **Task 1.6:** GitHub Repository Creation and Configuration | Create repository with professional structure, SSH authentication, and version control procedures. | Francisco Díaz<br>Erick García | **Completed** | 12/01/2026 |
| **Task 1.7:** Meeting and Minutes Protocol | Define protocol: Sprint Planning, Sprint Review. Minutes + ProofHub screenshots. | Francisco Díaz<br>Erick García<br>Adrià Montero | **Completed** | 12/01/2026 |
| **Task 1.8:** Markdown Documentation Tree | Create comprehensive structure: README, ARCHITECTURE, INSTALLATION, CONFIGURATION, etc. | Francisco Díaz<br>Erick García<br>Adrià Montero | **Completed** | 12/01/2026 |
| **Task 1.9:** Database Schema Definition | Design complete schema including image metadata for future evolutions. | Francisco Díaz | **Completed** | 19/01/2026 |

---

## Instructor Feedback

### Positive comments:

- The minutes format was accepted and will be used for the rest of the project.

---

### Proposed improvements:

- Write the title of each task, in addition to its name.

---

### ProofHub screenshot:

<div align="center">
  <img src="../../../../media/erick/proofhub_sprint1.png" alt="ProofHub screenshot">
</div>

---

## Pending Actions

_[Space for Sprint 1 pending actions - Usually none, all completed]_

---

## Executive Summary

**Overall Sprint 1 progress:** 100% completed (9 out of 9 main tasks finished) ✅

**Total Sprint duration:** 43 days (15/12/2025 - 27/01/2026)

### Completed tasks:

**Task 1.1:** Planning meeting and preliminary project analysis  
**Task 1.2:** Definition of team roles, responsibilities, and key capabilities  
**Task 1.3:** Exhaustive analysis of functional and non-functional requirements  
**Task 1.4:** Complete 7-server architecture design with topological diagram  
**Task 1.5:** ProofHub setup with 3 sprints and all assigned tasks  
**Task 1.6:** GitHub repository creation with professional structure and SSH  
**Task 1.7:** Establishment of standardized meeting protocols and minutes  
**Task 1.8:** Creation of comprehensive Markdown documentation structure  
**Task 1.9:** Detailed database schema design with metadata  

---

## Main Milestones Achieved

### 1. Team Alignment
- Definition of 8 required key capabilities
- Clear role assignment (Product Owner, Scrum Master, Technical Lead)
- Establishment of a shared knowledge plan through pair programming

### 2. Technological Research
- Comparative analysis of Nginx vs Apache
- In-depth study of PHP-FPM as a scalable alternative
- Docker and containerization research
- MySQL analysis for high availability
- Benchmarking of similar commercial solutions

### 3. Architecture and Design
- Complete 7-server architecture diagram
- Documentation of data flows (HTTP, uploads, static, DB)
- Definition of ports, protocols, and critical points
- Justification of chosen technologies

### 4. Project Infrastructure
- GitHub repository configured with SSH authentication
- Directory structure: /docs, /docker, /src, /static, /database, /sprints
- .gitignore and first commit executed
- Version control established

### 5. Project Management
- ProofHub configured with 3 full sprints
- All Product Backlog tasks created
- Standardized meeting protocol
- Minutes templates for Sprint Planning and Review

### 6. Core Documentation
- README.md with general overview and index
- Documents: ARCHITECTURE, INSTALLATION, CONFIGURATION, DEPENDENCIES
- Documents: MAINTENANCE, TROUBLESHOOTING, SCALING
- Exhaustive references to sources

### 7. Requirements Analysis
- List of functional requirements (7 servers, PHP, MySQL, uploads)
- List of non-functional requirements (high availability, scalability, documentation)
- Total rubric coverage verified

### 8. Database
- Initial schema based on the provided posts table
- Expansion with improved fields (timestamps, BLOB, name, extension, MIME)
- Entity-Relationship Diagram documented
- Structure ready for future evolutions

---

## Sprint 1 Deliverables

### Documentation
- P0.1 requirements analysis document
- Architecture document with diagrams
- Role definition document
- Complete Markdown documentation tree
- Standardized minutes templates

### Code/Configuration
- Initialized GitHub repository
- Professional directory structure
- Base configuration files
- Configured .gitignore

### Artifacts
- Topological architecture diagram (visual)
- DB Entity-Relationship Diagram
- ProofHub dashboard with sprints
- Project status screenshots

### Established Processes
- Meeting protocol
- Version control procedure
- Shared knowledge plan
- Documentation standards

---

## Sprint 1 Statistics

| Metric | Value |
|---------|-------|
| Total main tasks | 9 |
| Completed tasks | 9 |
| Completion rate | 100% |
| Duration in days | 43 |
| Team members | 3 |
| Meetings held | 1 (Sprint Planning) |
| Documents created | 8+ |
| Architecture components | 7 servers |
| Identified key capabilities | 8 |

---

## Identified Key Capabilities

1. **Linux systems administration** - Server configuration, permissions, services
2. **Architecture design** - Topology, data flows, scalability
3. **PHP backend development** - Application scripts, DB integration
4. **Database configuration** - MySQL, schemas, security
5. **Web server administration** - Nginx, virtual hosts, reverse proxy
6. **Containerization with Docker** - Dockerfiles, docker-compose, orchestration
7. **Git version control** - Workflows, commits, collaboration
8. **Technical documentation** - Clear writing, diagrams, procedures

---

## Justified Technologies

| Technology | Reason for selection | Advantages |
|------------|-------------------|----------|
| **Nginx** | Efficient reverse proxy | Low resource consumption, ideal for load balancing |
| **PHP-FPM** | Scalable processing | Better performance than mod_php, process separation |
| **MySQL** | ACID database | Reliability, replication, possible clustering |
| **Docker** | Containerization | Isolation, portability, reproducibility |
| **GitHub** | Version control | Collaboration, traceability, industry standards |

---

## Preparation for Sprint 2

Sprint 1 has laid a solid foundation so that Sprint 2 can focus on:

1. Installation of the LEMP stack on a single machine
2. Validation of core functionalities (extagram.php, upload.php)
3. Creation of Dockerfiles for all services
4. Definition of docker-compose.yml with orchestration
5. NGINX reverse proxy configuration

---

## Important Notes

- **Exhaustive documentation** from the start facilitates future maintenance
- **Well-defined architecture** prevents costly changes later
- **Aligned team** in vision and roles ensures efficient execution
- **Established protocols** guarantee consistency in upcoming sprints
- **Preliminary research** justifies technical decisions before any audit

---

[Sprints Index](../sprints-index.md)