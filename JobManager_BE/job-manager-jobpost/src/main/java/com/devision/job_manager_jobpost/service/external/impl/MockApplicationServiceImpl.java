package com.devision.job_manager_jobpost.service.external.impl;

import com.devision.job_manager_jobpost.dto.external.ApplicationResponseDto;
import com.devision.job_manager_jobpost.dto.external.PageableResponseDto;
import com.devision.job_manager_jobpost.model.ApplicationArchive;
import com.devision.job_manager_jobpost.repository.ApplicationArchiveRepository;
import com.devision.job_manager_jobpost.service.external.ApplicationService;
import com.devision.job_manager_jobpost.util.MockPdfGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Mock implementation of ApplicationService for development/demo purposes.
 * This simulates the behavior of the real Job Applicant subsystem.
 *
 * Activated by setting spring.profiles.active=mock in application.properties
 */
@Service
@Profile("mock")
@RequiredArgsConstructor
@Slf4j
public class MockApplicationServiceImpl implements ApplicationService {

    private final ApplicationArchiveRepository archiveRepository;
    private final MockPdfGenerator mockPdfGenerator;

    // Mock data storage - simulates the Job Applicant subsystem's database
    private static final Map<UUID, List<ApplicationResponseDto>> MOCK_APPLICATIONS_BY_JOB = new ConcurrentHashMap<>();

    // Static initializer to create mock data when class loads
    static {
        initializeMockData();
    }

    /**
     * Initialize mock application data for demo purposes.
     * Creates realistic applications for job posts.
     */
    private static void initializeMockData() {
        log.info("Initializing mock application data...");

        // Mock applicant data - realistic names and contact info
        List<MockApplicant> mockApplicants = Arrays.asList(
                new MockApplicant("Alice Johnson", "alice.johnson@email.com", "+1 (555) 123-4567"),
                new MockApplicant("Bob Smith", "bob.smith@gmail.com", "+1 (555) 234-5678"),
                new MockApplicant("Charlie Brown", "charlie.brown@outlook.com", "+44 20 7123 4567"),
                new MockApplicant("Diana Prince", "diana.prince@email.com", "+61 2 9876 5432"),
                new MockApplicant("Ethan Hunt", "ethan.hunt@mail.com", "+1 (555) 345-6789"),
                new MockApplicant("Fiona Green", "fiona.green@email.com", "+1 (555) 456-7890"),
                new MockApplicant("George Wilson", "george.wilson@email.com", "+44 20 8234 5678"),
                new MockApplicant("Hannah Lee", "hannah.lee@mail.com", "+65 6234 5678"),
                new MockApplicant("Ivan Petrov", "ivan.petrov@email.com", "+7 495 123 4567"),
                new MockApplicant("Julia Martinez", "julia.martinez@email.com", "+34 91 123 4567")
        );

        // Mock cover letters - varied and realistic
        List<String> mockCoverLetters = Arrays.asList(
                "Dear Hiring Manager,\n\nI am writing to express my strong interest in this position. With over 5 years of experience in software development and a proven track record of delivering high-quality solutions, I am confident in my ability to contribute effectively to your team.\n\nThroughout my career, I have successfully led multiple projects from conception to deployment, collaborating with cross-functional teams to deliver features on time and within budget. My technical expertise combined with my passion for creating intuitive user experiences makes me an ideal fit for this role.\n\nI would welcome the opportunity to discuss how my skills and experience align with your needs.\n\nBest regards,",
                "To the Hiring Team,\n\nI am excited to apply for this opportunity. As a passionate developer with a strong background in modern web technologies, I believe I would be a valuable addition to your organization.\n\nMy experience includes building scalable applications, implementing best practices in code quality, and mentoring junior developers. I thrive in collaborative environments and am always eager to learn new technologies.\n\nThank you for considering my application. I look forward to the possibility of contributing to your team.\n\nSincerely,",
                "Dear Sir/Madam,\n\nI am applying for this position because I am genuinely excited about the opportunity to work with your innovative team. My background in full-stack development and my commitment to writing clean, maintainable code align perfectly with the requirements outlined in the job posting.\n\nI have consistently delivered results in fast-paced environments and am confident that my skills and enthusiasm would make me a strong contributor to your projects.\n\nThank you for your time and consideration.\n\nKind regards,",
                null, // Some applicants don't submit cover letters
                "Hello,\n\nI am very interested in joining your team. With my strong technical skills and collaborative mindset, I believe I can make immediate contributions to your projects. I am particularly drawn to your company's mission and values.\n\nI would love the opportunity to discuss how my experience can benefit your team.\n\nBest,",
                null,
                "Dear Hiring Manager,\n\nYour job posting immediately caught my attention. The combination of challenging technical work and a collaborative team environment is exactly what I'm looking for in my next role.\n\nI bring hands-on experience with modern frameworks, a strong understanding of software architecture principles, and a track record of delivering features that delight users.\n\nI am eager to contribute to your team's success.\n\nWarm regards,"
        );

        // Mock notes - internal notes that hiring manager might add
        List<String> mockNotes = Arrays.asList(
                "Strong candidate with excellent React experience. Good communication skills.",
                "Impressive portfolio. Has experience with our tech stack.",
                "Junior developer but shows great potential. Consider for entry-level role.",
                "Senior developer with leadership experience. Top candidate.",
                null,
                "Good technical background. Needs to improve communication skills.",
                "Overqualified for this position. Might be a flight risk.",
                null,
                "Perfect fit for our team culture. Strong recommendation from referral.",
                "Interesting background in both frontend and backend. Versatile candidate."
        );

        log.info("Mock application data initialized successfully");
    }

    @Override
    public PageableResponseDto<ApplicationResponseDto> getApplicationsByJobPost(
            UUID jobPostId,
            UUID companyId,
            int page,
            int size,
            Boolean archived) {

        log.info("[MOCK] Fetching applications for jobPostId: {}, page: {}, size: {}, archived: {}",
                jobPostId, page, size, archived);

        // Get or create mock applications for this job post
        List<ApplicationResponseDto> allApplications = MOCK_APPLICATIONS_BY_JOB.computeIfAbsent(
                jobPostId,
                k -> generateMockApplicationsForJob(jobPostId)
        );

        // Get archived application IDs from database
        List<UUID> archivedIds = archiveRepository
                .findArchivedApplicationIdsByJobPostAndCompany(jobPostId, companyId);

        // Filter based on archived status
        List<ApplicationResponseDto> filteredApplications;
        if (archived != null) {
            if (archived) {
                // Return only archived applications
                filteredApplications = allApplications.stream()
                        .filter(app -> archivedIds.contains(app.getId()))
                        .collect(Collectors.toList());
            } else {
                // Return only non-archived (pending) applications
                filteredApplications = allApplications.stream()
                        .filter(app -> !archivedIds.contains(app.getId()))
                        .collect(Collectors.toList());
            }
        } else {
            // Return all applications
            filteredApplications = new ArrayList<>(allApplications);
        }

        // Sort by applied date (newest first)
        filteredApplications.sort((a, b) -> b.getAppliedAt().compareTo(a.getAppliedAt()));

        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, filteredApplications.size());
        List<ApplicationResponseDto> paginatedContent = filteredApplications.subList(
                Math.min(start, filteredApplications.size()),
                Math.min(end, filteredApplications.size())
        );

        // Build pageable response
        PageableResponseDto<ApplicationResponseDto> response = new PageableResponseDto<>();
        response.setContent(paginatedContent);
        response.setPageNumber(page);
        response.setPageSize(size);
        response.setTotalElements(filteredApplications.size());
        response.setTotalPages((int) Math.ceil((double) filteredApplications.size() / size));
        response.setFirst(page == 0);
        response.setLast(end >= filteredApplications.size());

        log.info("[MOCK] Returning {} applications (page {}/{})",
                paginatedContent.size(), page + 1, response.getTotalPages());

        return response;
    }

    @Override
    public void archiveApplication(UUID applicationId, UUID companyId, UUID jobPostId) {
        log.info("[MOCK] Archiving application: {} for company: {}", applicationId, companyId);

        // Check if already archived
        if (archiveRepository.existsByApplicationIdAndCompanyId(applicationId, companyId)) {
            log.warn("[MOCK] Application {} is already archived", applicationId);
            return;
        }

        // Use the real archive repository to maintain archive state
        // This ensures mock and real implementations share the same archive logic
        ApplicationArchive archive = ApplicationArchive.builder()
                .applicationId(applicationId)
                .companyId(companyId)
                .jobPostId(jobPostId)
                .build();

        archiveRepository.save(archive);
        log.info("[MOCK] Application archived successfully");
    }

    @Override
    public void unarchiveApplication(UUID applicationId, UUID companyId) {
        log.info("[MOCK] Unarchiving application: {} for company: {}", applicationId, companyId);

        archiveRepository.deleteByApplicationIdAndCompanyId(applicationId, companyId);
        log.info("[MOCK] Application unarchived successfully");
    }

    @Override
    public byte[] downloadApplicationFile(UUID applicationId, String docType) {
        log.info("[MOCK] Downloading file for application: {}, docType: {}", applicationId, docType);

        // Validate docType
        if (!docType.equals("RESUME") && !docType.equals("COVER_LETTER")) {
            throw new IllegalArgumentException("Invalid document type. Must be RESUME or COVER_LETTER");
        }

        // Find the application to get applicant details
        ApplicationResponseDto application = findApplicationById(applicationId);
        if (application == null) {
            throw new RuntimeException("Application not found: " + applicationId);
        }

        // Generate mock PDF content based on document type
        String content;
        String documentTitle;

        if (docType.equals("RESUME")) {
            documentTitle = "Resume - Applicant " + application.getUserId();
            content = generateMockResumeContent(application);
        } else {
            documentTitle = "Cover Letter - Applicant " + application.getUserId();
            content = application.getCoverLetterUrl() != null
                    ? "Cover Letter Content:\n\n" + application.getUserNotes()
                    : "No cover letter provided.";
        }

        // Generate PDF bytes
        byte[] pdfBytes = mockPdfGenerator.generatePdf(documentTitle, content);

        log.info("[MOCK] Generated {} PDF, size: {} bytes", docType, pdfBytes.length);
        return pdfBytes;
    }

    @Override
    public long[] getApplicationCounts(UUID jobPostId, UUID companyId) {
        log.info("[MOCK] Getting application counts for jobPostId: {}", jobPostId);

        // Get all applications for this job post
        List<ApplicationResponseDto> allApplications = MOCK_APPLICATIONS_BY_JOB.computeIfAbsent(
                jobPostId,
                k -> generateMockApplicationsForJob(jobPostId)
        );

        long totalCount = allApplications.size();

        // Get archived count from database
        long archivedCount = archiveRepository.countByJobPostIdAndCompanyId(jobPostId, companyId);
        long pendingCount = totalCount - archivedCount;

        log.info("[MOCK] Application counts - Pending: {}, Archived: {}", pendingCount, archivedCount);

        return new long[]{pendingCount, archivedCount};
    }

    /**
     * Generate mock applications for a specific job post.
     * Creates 3-8 applications with varied data.
     */
    private List<ApplicationResponseDto> generateMockApplicationsForJob(UUID jobPostId) {
        log.info("[MOCK] Generating mock applications for job post: {}", jobPostId);

        Random random = new Random(jobPostId.hashCode()); // Deterministic randomness
        int applicationCount = 3 + random.nextInt(6); // 3 to 8 applications

        List<ApplicationResponseDto> applications = new ArrayList<>();

        for (int i = 0; i < applicationCount; i++) {
            UUID applicationId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();

            // Vary application dates (within last 30 days)
            LocalDateTime appliedAt = LocalDateTime.now().minusDays(random.nextInt(30));

            ApplicationResponseDto application = new ApplicationResponseDto();
            application.setId(applicationId);
            application.setUserId(userId);
            application.setJobPostId(jobPostId);
            application.setResumeUrl("mock://resume/" + applicationId); // Mock URL

            // 70% chance of having a cover letter
            if (random.nextFloat() < 0.7) {
                application.setCoverLetterUrl("mock://cover-letter/" + applicationId);
            }

            application.setStatus("PENDING");

            // 60% chance of having user notes (cover letter preview text)
            if (random.nextFloat() < 0.6) {
                String[] sampleNotes = {
                        "Experienced developer with 5+ years in full-stack development",
                        "Recent graduate with strong academic background in Computer Science",
                        "Senior engineer looking for new challenges in a dynamic team",
                        "Passionate about clean code and test-driven development",
                        "Looking to transition from backend to full-stack development"
                };
                application.setUserNotes(sampleNotes[random.nextInt(sampleNotes.length)]);
            }

            // 40% chance of having admin notes
            if (random.nextFloat() < 0.4) {
                String[] sampleAdminNotes = {
                        "Strong candidate - schedule interview",
                        "Good technical skills, needs culture fit assessment",
                        "Overqualified, might be looking for higher salary",
                        "Promising junior developer",
                        "Experienced but communication skills need improvement"
                };
                application.setAdminNotes(sampleAdminNotes[random.nextInt(sampleAdminNotes.length)]);
            }

            application.setAppliedAt(appliedAt);
            application.setUpdatedAt(appliedAt);
            application.setDeletedAt(null);

            applications.add(application);
        }

        log.info("[MOCK] Generated {} mock applications", applicationCount);
        return applications;
    }

    /**
     * Find application by ID across all job posts
     */
    private ApplicationResponseDto findApplicationById(UUID applicationId) {
        for (List<ApplicationResponseDto> applications : MOCK_APPLICATIONS_BY_JOB.values()) {
            for (ApplicationResponseDto app : applications) {
                if (app.getId().equals(applicationId)) {
                    return app;
                }
            }
        }
        return null;
    }

    /**
     * Generate mock resume content for PDF
     */
    private String generateMockResumeContent(ApplicationResponseDto application) {
        return String.format("""
            CURRICULUM VITAE
            
            Applicant ID: %s
            
            PROFESSIONAL SUMMARY
            Experienced software developer with a strong background in full-stack development.
            Proficient in modern web technologies including React, Spring Boot, and PostgreSQL.
            Demonstrated ability to deliver high-quality solutions in agile environments.
            
            TECHNICAL SKILLS
            • Frontend: React, TypeScript, HTML5, CSS3, TailwindCSS
            • Backend: Java, Spring Boot, Node.js, REST APIs
            • Database: PostgreSQL, MySQL, MongoDB, Redis
            • Tools: Git, Docker, Maven, IntelliJ IDEA
            • Methodologies: Agile, Scrum, Test-Driven Development
            
            WORK EXPERIENCE
            
            Senior Software Developer | Tech Company Inc. | 2020 - Present
            • Led development of microservices-based application serving 100K+ users
            • Implemented CI/CD pipelines reducing deployment time by 60%%
            • Mentored junior developers and conducted code reviews
            
            Software Developer | Digital Solutions Ltd. | 2018 - 2020
            • Developed RESTful APIs using Spring Boot and PostgreSQL
            • Created responsive frontend applications using React and TypeScript
            • Collaborated with cross-functional teams to deliver features on schedule
            
            EDUCATION
            
            Bachelor of Computer Science | University Name | 2014 - 2018
            • GPA: 3.8/4.0
            • Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems
            
            CERTIFICATIONS
            • AWS Certified Solutions Architect
            • Oracle Certified Professional, Java SE
            
            APPLICATION DETAILS
            Applied Date: %s
            Status: %s
            """,
                application.getUserId(),
                application.getAppliedAt(),
                application.getStatus()
        );
    }

    /**
     * Helper class for mock applicant data
     */
    private static class MockApplicant {
        String name;
        String email;
        String phone;

        MockApplicant(String name, String email, String phone) {
            this.name = name;
            this.email = email;
            this.phone = phone;
        }
    }
}
