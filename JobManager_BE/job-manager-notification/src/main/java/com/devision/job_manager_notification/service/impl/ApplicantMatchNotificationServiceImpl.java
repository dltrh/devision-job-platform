package com.devision.job_manager_notification.service.impl;

import com.devision.job_manager_notification.dto.response.ApiResponse;
import com.devision.job_manager_notification.service.ApplicantMatchNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicantMatchNotificationServiceImpl implements ApplicantMatchNotificationService {

    private final Map<UUID, Map<String, Object>> companySearchProfilesCache = new ConcurrentHashMap<>();
    private final Map<UUID, Set<UUID>> companyNotifiedApplicantsCache = new ConcurrentHashMap<>();

    private static final double MINIMUM_MATCH_SCORE = 60.0;
    private static final double HIGH_MATCH_SCORE = 80.0;
    private static final double EXCELLENT_MATCH_SCORE = 90.0;

    @Override
    public ApiResponse<String> notifyCompanyOfApplicantMatch(
            UUID companyId,
            UUID applicantId,
            Map<String, Object> applicantProfile,
            Map<String, Object> matchingCriteria,
            double matchScore
    ) {
        try {
            log.info("Notifying company {} of applicant match {} with score {}",
                    companyId, applicantId, matchScore);

            String validationError = validateNotificationParameters(
                    companyId, applicantId, applicantProfile, matchingCriteria, matchScore
            );

            if (validationError != null) {
                log.error("Validation failed: {}", validationError);
                return ApiResponse.error(validationError);
            }

            if (hasAlreadyBeenNotified(companyId, applicantId)) {
                log.info("Company {} already notified about applicant {}. Skipping duplicate notification",
                        companyId, applicantId);
                return ApiResponse.success("Duplicate notification prevented", "ALREADY_NOTIFIED");
            }

            String applicantName = extractApplicantName(applicantProfile);
            String companyName = extractCompanyName(companyId);

            String matchDetails = buildDetailedMatchDescription(
                    applicantProfile, matchingCriteria, matchScore
            );

            // TODO: Email notifications are handled by auth service
            // For now, just log the match and mark as notified
            markAsNotified(companyId, applicantId);

            String successMessage = String.format(
                    "Successfully notified company %s about applicant %s (match score: %.2f%%). Details: %s",
                    companyName, applicantName, matchScore, matchDetails
            );

            log.info(successMessage);
            return ApiResponse.success(successMessage, successMessage);

        } catch (Exception e) {
            log.error("Error notifying company {} about applicant {}", companyId, applicantId, e);
            return ApiResponse.error("Failed to notify company: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<List<String>> processApplicantProfileUpdate(
            UUID applicantId,
            Map<String, Object> updatedProfile,
            Map<String, Object> previousProfile
    ) {
        try {
            log.info("Processing profile update for applicant: {}", applicantId);

            if (applicantId == null) {
                return ApiResponse.error("Applicant ID is required");
            }

            if (updatedProfile == null || updatedProfile.isEmpty()) {
                return ApiResponse.error("Updated profile cannot be null or empty");
            }

            Set<String> changedFields = identifyChangedFields(previousProfile, updatedProfile);

            if (changedFields.isEmpty()) {
                log.info("No significant changes detected in applicant {} profile", applicantId);
                return ApiResponse.success("No changes detected", Collections.emptyList());
            }

            log.info("Detected {} field changes for applicant {}: {}",
                    changedFields.size(), applicantId, changedFields);

            boolean shouldReevaluate = shouldReevaluateMatches(changedFields);

            if (!shouldReevaluate) {
                log.info("Changes do not warrant re-evaluation for applicant {}", applicantId);
                return ApiResponse.success("Changes do not require re-evaluation", Collections.emptyList());
            }

            ApiResponse<String> evaluationResult = evaluateApplicantAgainstSearchProfiles(
                    applicantId, updatedProfile
            );

            List<String> notifications = new ArrayList<>();
            if (evaluationResult.isSuccess()) {
                notifications.add(evaluationResult.getData());
            }

            String message = String.format(
                    "Processed %d field changes and triggered %d notifications",
                    changedFields.size(), notifications.size()
            );

            log.info(message);
            return ApiResponse.success(message, notifications);

        } catch (Exception e) {
            log.error("Error processing profile update for applicant: {}", applicantId, e);
            return ApiResponse.error("Failed to process profile update: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<String> evaluateApplicantAgainstSearchProfiles(
            UUID applicantId,
            Map<String, Object> applicantProfile
    ) {
        try {
            log.info("Evaluating applicant {} against all active search profiles", applicantId);

            ApiResponse<String> validationResult = validateApplicantProfile(applicantProfile);
            if (!validationResult.isSuccess()) {
                return validationResult;
            }

            ApiResponse<List<UUID>> companiesResult = findCompaniesWithMatchingSearchProfiles(applicantProfile);

            if (!companiesResult.isSuccess() || companiesResult.getData() == null) {
                log.warn("No matching companies found or error occurred: {}", companiesResult.getMessage());
                return ApiResponse.success("No matching companies found", "0 matches");
            }

            List<UUID> matchingCompanies = companiesResult.getData();

            if (matchingCompanies.isEmpty()) {
                log.info("No companies match the applicant {} profile criteria", applicantId);
                return ApiResponse.success("No matches found", "0 matches");
            }

            int successfulNotifications = 0;
            int failedNotifications = 0;

            for (UUID companyId : matchingCompanies) {
                try {
                    Map<String, Object> searchCriteria = companySearchProfilesCache.get(companyId);

                    if (searchCriteria == null) {
                        log.warn("No search criteria found for company {}", companyId);
                        continue;
                    }

                    ApiResponse<Map<String, Object>> matchScoreResult = calculateMatchScore(
                            applicantProfile, searchCriteria
                    );

                    if (!matchScoreResult.isSuccess() || matchScoreResult.getData() == null) {
                        log.warn("Failed to calculate match score for company {}", companyId);
                        failedNotifications++;
                        continue;
                    }

                    double matchScore = (Double) matchScoreResult.getData().get("totalScore");

                    if (matchScore < MINIMUM_MATCH_SCORE) {
                        log.debug("Match score {} below minimum threshold for company {}",
                                matchScore, companyId);
                        continue;
                    }

                    ApiResponse<String> notificationResult = notifyCompanyOfApplicantMatch(
                            companyId, applicantId, applicantProfile, searchCriteria, matchScore
                    );

                    if (notificationResult.isSuccess()) {
                        successfulNotifications++;
                    } else {
                        failedNotifications++;
                        log.warn("Failed to notify company {}: {}", companyId, notificationResult.getMessage());
                    }

                } catch (Exception e) {
                    log.error("Error processing match for company {}", companyId, e);
                    failedNotifications++;
                }
            }

            String resultMessage = String.format(
                    "Evaluated applicant %s: %d successful notifications, %d failed, out of %d potential matches",
                    applicantId, successfulNotifications, failedNotifications, matchingCompanies.size()
            );

            log.info(resultMessage);
            return ApiResponse.success(resultMessage, resultMessage);

        } catch (Exception e) {
            log.error("Error evaluating applicant {} against search profiles", applicantId, e);
            return ApiResponse.error("Failed to evaluate applicant: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<Integer> notifyAllMatchingCompanies(
            UUID applicantId,
            Map<String, Object> applicantProfile
    ) {
        try {
            log.info("Initiating bulk notification for applicant: {}", applicantId);

            ApiResponse<List<UUID>> matchingCompaniesResult =
                    findCompaniesWithMatchingSearchProfiles(applicantProfile);

            if (!matchingCompaniesResult.isSuccess()) {
                return ApiResponse.error("Failed to find matching companies: " +
                        matchingCompaniesResult.getMessage());
            }

            List<UUID> matchingCompanies = matchingCompaniesResult.getData();

            if (matchingCompanies == null || matchingCompanies.isEmpty()) {
                log.info("No matching companies found for applicant {}", applicantId);
                return ApiResponse.success("No matching companies found", 0);
            }

            int notificationCount = 0;

            for (UUID companyId : matchingCompanies) {
                Map<String, Object> searchCriteria = companySearchProfilesCache.get(companyId);

                if (searchCriteria == null) {
                    continue;
                }

                ApiResponse<Map<String, Object>> scoreResult = calculateMatchScore(
                        applicantProfile, searchCriteria
                );

                if (scoreResult.isSuccess() && scoreResult.getData() != null) {
                    double score = (Double) scoreResult.getData().get("totalScore");

                    if (score >= MINIMUM_MATCH_SCORE) {
                        ApiResponse<String> result = notifyCompanyOfApplicantMatch(
                                companyId, applicantId, applicantProfile, searchCriteria, score
                        );

                        if (result.isSuccess()) {
                            notificationCount++;
                        }
                    }
                }
            }

            String message = String.format("Sent %d notifications out of %d potential matches",
                    notificationCount, matchingCompanies.size());

            log.info(message);
            return ApiResponse.success(message, notificationCount);

        } catch (Exception e) {
            log.error("Error notifying matching companies for applicant: {}", applicantId, e);
            return ApiResponse.error("Failed to notify companies: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<Map<String, Object>> calculateMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        try {
            log.debug("Calculating match score");

            Map<String, Object> scoreBreakdown = new HashMap<>();

            double skillsScore = calculateSkillsMatchScore(applicantProfile, searchCriteria);
            double experienceScore = calculateExperienceMatchScore(applicantProfile, searchCriteria);
            double educationScore = calculateEducationMatchScore(applicantProfile, searchCriteria);
            double locationScore = calculateLocationMatchScore(applicantProfile, searchCriteria);
            double salaryScore = calculateSalaryMatchScore(applicantProfile, searchCriteria);
            double employmentStatusScore = calculateEmploymentStatusMatchScore(applicantProfile, searchCriteria);

            double skillsWeight = 0.30;
            double experienceWeight = 0.25;
            double educationWeight = 0.15;
            double locationWeight = 0.15;
            double salaryWeight = 0.10;
            double employmentStatusWeight = 0.05;

            double totalScore = (skillsScore * skillsWeight) +
                    (experienceScore * experienceWeight) +
                    (educationScore * educationWeight) +
                    (locationScore * locationWeight) +
                    (salaryScore * salaryWeight) +
                    (employmentStatusScore * employmentStatusWeight);

            scoreBreakdown.put("skillsScore", skillsScore);
            scoreBreakdown.put("experienceScore", experienceScore);
            scoreBreakdown.put("educationScore", educationScore);
            scoreBreakdown.put("locationScore", locationScore);
            scoreBreakdown.put("salaryScore", salaryScore);
            scoreBreakdown.put("employmentStatusScore", employmentStatusScore);
            scoreBreakdown.put("totalScore", totalScore);
            scoreBreakdown.put("matchLevel", determineMatchLevel(totalScore));

            log.debug("Calculated total match score: {}", totalScore);

            return ApiResponse.success("Match score calculated", scoreBreakdown);

        } catch (Exception e) {
            log.error("Error calculating match score", e);
            return ApiResponse.error("Failed to calculate match score: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<Boolean> doesApplicantMatchCriteria(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        try {
            ApiResponse<Map<String, Object>> scoreResult = calculateMatchScore(applicantProfile, searchCriteria);

            if (!scoreResult.isSuccess() || scoreResult.getData() == null) {
                return ApiResponse.error("Failed to calculate match");
            }

            double totalScore = (Double) scoreResult.getData().get("totalScore");

            boolean matches = totalScore >= MINIMUM_MATCH_SCORE;

            String message = matches
                    ? String.format("Applicant matches criteria with score %.2f%%", totalScore)
                    : String.format("Applicant does not match criteria (score: %.2f%%, minimum: %.2f%%)",
                    totalScore, MINIMUM_MATCH_SCORE);

            return ApiResponse.success(message, matches);

        } catch (Exception e) {
            log.error("Error checking if applicant matches criteria", e);
            return ApiResponse.error("Failed to check match: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<String> formatMatchDetails(
            Map<String, Object> applicantProfile,
            Map<String, Object> matchingCriteria,
            double matchScore
    ) {
        try {
            StringBuilder details = new StringBuilder();

            details.append(String.format("Match Score: %.2f%% (%s)\n\n",
                    matchScore, determineMatchLevel(matchScore)));

            ApiResponse<Map<String, Object>> matchingFieldsResult = extractMatchingFields(
                    applicantProfile, matchingCriteria
            );

            if (matchingFieldsResult.isSuccess() && matchingFieldsResult.getData() != null) {
                Map<String, Object> matchingFields = matchingFieldsResult.getData();

                if (matchingFields.containsKey("skills")) {
                    details.append("Matching Skills:\n");
                    List<?> skills = (List<?>) matchingFields.get("skills");
                    for (Object skill : skills) {
                        details.append("  • ").append(skill).append("\n");
                    }
                    details.append("\n");
                }

                if (matchingFields.containsKey("education")) {
                    details.append("Education: ").append(matchingFields.get("education")).append("\n");
                }

                if (matchingFields.containsKey("experience")) {
                    details.append("Experience: ").append(matchingFields.get("experience")).append(" years\n");
                }

                if (matchingFields.containsKey("location")) {
                    details.append("Location: ").append(matchingFields.get("location")).append("\n");
                }

                if (matchingFields.containsKey("employmentStatus")) {
                    details.append("Employment Status: ").append(matchingFields.get("employmentStatus")).append("\n");
                }
            }

            return ApiResponse.success("Match details formatted", details.toString());

        } catch (Exception e) {
            log.error("Error formatting match details", e);
            return ApiResponse.error("Failed to format match details: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<List<UUID>> findCompaniesWithMatchingSearchProfiles(
            Map<String, Object> applicantProfile
    ) {
        try {
            log.info("Finding companies with matching search profiles");

            List<UUID> matchingCompanies = new ArrayList<>();

            String applicantCountry = (String) applicantProfile.get("country");

            if (applicantCountry == null || applicantCountry.trim().isEmpty()) {
                log.warn("Applicant profile missing country information");
                applicantCountry = "UNKNOWN";
            }

            for (Map.Entry<UUID, Map<String, Object>> entry : companySearchProfilesCache.entrySet()) {
                UUID companyId = entry.getKey();
                Map<String, Object> searchCriteria = entry.getValue();

                if (searchCriteria == null || searchCriteria.isEmpty()) {
                    continue;
                }

                String requiredCountry = (String) searchCriteria.get("country");

                if (requiredCountry != null && !requiredCountry.equalsIgnoreCase(applicantCountry)) {
                    log.debug("Country mismatch for company {}: required={}, applicant={}",
                            companyId, requiredCountry, applicantCountry);
                    continue;
                }

                ApiResponse<Boolean> matchResult = doesApplicantMatchCriteria(applicantProfile, searchCriteria);

                if (matchResult.isSuccess() && Boolean.TRUE.equals(matchResult.getData())) {
                    matchingCompanies.add(companyId);
                }
            }

            log.info("Found {} companies with matching search profiles", matchingCompanies.size());

            return ApiResponse.success("Matching companies found", matchingCompanies);

        } catch (Exception e) {
            log.error("Error finding companies with matching search profiles", e);
            return ApiResponse.error("Failed to find matching companies: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<Map<String, Object>> extractMatchingFields(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        try {
            Map<String, Object> matchingFields = new HashMap<>();

            List<String> applicantSkills = extractSkills(applicantProfile);
            List<String> requiredSkills = extractSkills(searchCriteria);

            List<String> matchingSkills = applicantSkills.stream()
                    .filter(skill -> requiredSkills.stream()
                            .anyMatch(required -> required.equalsIgnoreCase(skill)))
                    .collect(Collectors.toList());

            if (!matchingSkills.isEmpty()) {
                matchingFields.put("skills", matchingSkills);
            }

            String applicantEducation = (String) applicantProfile.get("education");
            String requiredEducation = (String) searchCriteria.get("education");

            if (applicantEducation != null && requiredEducation != null &&
                    applicantEducation.equalsIgnoreCase(requiredEducation)) {
                matchingFields.put("education", applicantEducation);
            }

            Integer applicantExperience = extractExperience(applicantProfile);
            Integer requiredExperience = extractExperience(searchCriteria);

            if (applicantExperience != null && requiredExperience != null &&
                    applicantExperience >= requiredExperience) {
                matchingFields.put("experience", applicantExperience);
            }

            String applicantLocation = (String) applicantProfile.get("location");
            String requiredLocation = (String) searchCriteria.get("location");

            if (applicantLocation != null && requiredLocation != null &&
                    applicantLocation.equalsIgnoreCase(requiredLocation)) {
                matchingFields.put("location", applicantLocation);
            }

            String applicantStatus = (String) applicantProfile.get("employmentStatus");
            String requiredStatus = (String) searchCriteria.get("employmentStatus");

            if (applicantStatus != null && requiredStatus != null &&
                    applicantStatus.equalsIgnoreCase(requiredStatus)) {
                matchingFields.put("employmentStatus", applicantStatus);
            }

            return ApiResponse.success("Matching fields extracted", matchingFields);

        } catch (Exception e) {
            log.error("Error extracting matching fields", e);
            return ApiResponse.error("Failed to extract matching fields: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<String> validateApplicantProfile(Map<String, Object> applicantProfile) {
        if (applicantProfile == null || applicantProfile.isEmpty()) {
            return ApiResponse.error("Applicant profile cannot be null or empty");
        }

        List<String> missingFields = new ArrayList<>();

        if (!applicantProfile.containsKey("country") || applicantProfile.get("country") == null) {
            missingFields.add("country");
        }

        if (!applicantProfile.containsKey("skills") || applicantProfile.get("skills") == null) {
            missingFields.add("skills");
        }

        if (!missingFields.isEmpty()) {
            String error = "Applicant profile missing required fields: " +
                    String.join(", ", missingFields);
            return ApiResponse.error(error);
        }

        return ApiResponse.success("Applicant profile is valid", "VALID");
    }

    @Override
    public ApiResponse<String> validateSearchCriteria(Map<String, Object> searchCriteria) {
        if (searchCriteria == null || searchCriteria.isEmpty()) {
            return ApiResponse.error("Search criteria cannot be null or empty");
        }

        return ApiResponse.success("Search criteria is valid", "VALID");
    }

    private double calculateSkillsMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        List<String> applicantSkills = extractSkills(applicantProfile);
        List<String> requiredSkills = extractSkills(searchCriteria);

        if (requiredSkills.isEmpty()) {
            return 100.0;
        }

        long matchingSkillsCount = applicantSkills.stream()
                .filter(skill -> requiredSkills.stream()
                        .anyMatch(required -> required.equalsIgnoreCase(skill)))
                .count();

        return (double) matchingSkillsCount / requiredSkills.size() * 100.0;
    }

    private double calculateExperienceMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        Integer applicantExp = extractExperience(applicantProfile);
        Integer requiredExp = extractExperience(searchCriteria);

        if (requiredExp == null || requiredExp == 0) {
            return 100.0;
        }

        if (applicantExp == null) {
            return 0.0;
        }

        if (applicantExp >= requiredExp) {
            return 100.0;
        }

        return (double) applicantExp / requiredExp * 100.0;
    }

    private double calculateEducationMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        String applicantEdu = (String) applicantProfile.get("education");
        String requiredEdu = (String) searchCriteria.get("education");

        if (requiredEdu == null) {
            return 100.0;
        }

        if (applicantEdu == null) {
            return 0.0;
        }

        Map<String, Integer> educationLevels = new HashMap<>();
        educationLevels.put("BACHELOR", 1);
        educationLevels.put("MASTER", 2);
        educationLevels.put("DOCTORATE", 3);

        int applicantLevel = educationLevels.getOrDefault(applicantEdu.toUpperCase(), 0);
        int requiredLevel = educationLevels.getOrDefault(requiredEdu.toUpperCase(), 0);

        if (applicantLevel >= requiredLevel) {
            return 100.0;
        }

        return (double) applicantLevel / requiredLevel * 100.0;
    }

    private double calculateLocationMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        String applicantLocation = (String) applicantProfile.get("location");
        String requiredLocation = (String) searchCriteria.get("location");

        if (requiredLocation == null) {
            return 100.0;
        }

        if (applicantLocation == null) {
            return 50.0;
        }

        if (applicantLocation.equalsIgnoreCase(requiredLocation)) {
            return 100.0;
        }

        String applicantCountry = (String) applicantProfile.get("country");
        String requiredCountry = (String) searchCriteria.get("country");

        if (applicantCountry != null && requiredCountry != null &&
                applicantCountry.equalsIgnoreCase(requiredCountry)) {
            return 70.0;
        }

        return 30.0;
    }

    private double calculateSalaryMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        Integer applicantSalary = extractSalary(applicantProfile);
        Integer minSalary = (Integer) searchCriteria.get("minSalary");
        Integer maxSalary = (Integer) searchCriteria.get("maxSalary");

        if (minSalary == null && maxSalary == null) {
            return 100.0;
        }

        if (applicantSalary == null) {
            return 80.0;
        }

        if (minSalary != null && applicantSalary < minSalary) {
            return 50.0;
        }

        if (maxSalary != null && applicantSalary > maxSalary) {
            return 70.0;
        }

        return 100.0;
    }

    private double calculateEmploymentStatusMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    ) {
        String applicantStatus = (String) applicantProfile.get("employmentStatus");
        String requiredStatus = (String) searchCriteria.get("employmentStatus");

        if (requiredStatus == null) {
            return 100.0;
        }

        if (applicantStatus == null) {
            return 50.0;
        }

        if (applicantStatus.equalsIgnoreCase(requiredStatus)) {
            return 100.0;
        }

        return 60.0;
    }

    private List<String> extractSkills(Map<String, Object> profile) {
        Object skillsObj = profile.get("skills");

        if (skillsObj instanceof List) {
            return ((List<?>) skillsObj).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }

        if (skillsObj instanceof String) {
            String skillsStr = (String) skillsObj;
            return Arrays.stream(skillsStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    private Integer extractExperience(Map<String, Object> profile) {
        Object exp = profile.get("experience");

        if (exp instanceof Integer) {
            return (Integer) exp;
        }

        if (exp instanceof String) {
            try {
                return Integer.parseInt((String) exp);
            } catch (NumberFormatException e) {
                log.warn("Failed to parse experience value: {}", exp);
            }
        }

        return null;
    }

    private Integer extractSalary(Map<String, Object> profile) {
        Object salary = profile.get("salary");

        if (salary instanceof Integer) {
            return (Integer) salary;
        }

        if (salary instanceof String) {
            try {
                return Integer.parseInt((String) salary);
            } catch (NumberFormatException e) {
                log.warn("Failed to parse salary value: {}", salary);
            }
        }

        return null;
    }

    private String determineMatchLevel(double score) {
        if (score >= EXCELLENT_MATCH_SCORE) {
            return "EXCELLENT MATCH";
        } else if (score >= HIGH_MATCH_SCORE) {
            return "HIGH MATCH";
        } else if (score >= MINIMUM_MATCH_SCORE) {
            return "GOOD MATCH";
        } else {
            return "WEAK MATCH";
        }
    }

    private String extractApplicantName(Map<String, Object> applicantProfile) {
        String firstName = (String) applicantProfile.get("firstName");
        String lastName = (String) applicantProfile.get("lastName");

        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        } else {
            return "Unknown Applicant";
        }
    }

    private String extractCompanyEmail(UUID companyId) {
        return "company-" + companyId + "@example.com";
    }

    private String extractCompanyName(UUID companyId) {
        return "Company " + companyId.toString().substring(0, 8);
    }

    private String buildDetailedMatchDescription(
            Map<String, Object> applicantProfile,
            Map<String, Object> matchingCriteria,
            double matchScore
    ) {
        ApiResponse<String> result = formatMatchDetails(applicantProfile, matchingCriteria, matchScore);
        return result.isSuccess() ? result.getData() : "Match details unavailable";
    }

    private String validateNotificationParameters(
            UUID companyId,
            UUID applicantId,
            Map<String, Object> applicantProfile,
            Map<String, Object> matchingCriteria,
            double matchScore
    ) {
        if (companyId == null) {
            return "Company ID is required";
        }

        if (applicantId == null) {
            return "Applicant ID is required";
        }

        if (applicantProfile == null || applicantProfile.isEmpty()) {
            return "Applicant profile cannot be null or empty";
        }

        if (matchingCriteria == null || matchingCriteria.isEmpty()) {
            return "Matching criteria cannot be null or empty";
        }

        if (matchScore < 0 || matchScore > 100) {
            return "Match score must be between 0 and 100";
        }

        return null;
    }

    private boolean hasAlreadyBeenNotified(UUID companyId, UUID applicantId) {
        Set<UUID> notifiedApplicants = companyNotifiedApplicantsCache.get(companyId);
        return notifiedApplicants != null && notifiedApplicants.contains(applicantId);
    }

    private void markAsNotified(UUID companyId, UUID applicantId) {
        companyNotifiedApplicantsCache.computeIfAbsent(companyId, k -> ConcurrentHashMap.newKeySet())
                .add(applicantId);
        log.debug("Marked applicant {} as notified for company {}", applicantId, companyId);
    }

    private Set<String> identifyChangedFields(
            Map<String, Object> previousProfile,
            Map<String, Object> updatedProfile
    ) {
        Set<String> changedFields = new HashSet<>();

        if (previousProfile == null) {
            return updatedProfile.keySet();
        }

        for (Map.Entry<String, Object> entry : updatedProfile.entrySet()) {
            String key = entry.getKey();
            Object newValue = entry.getValue();
            Object oldValue = previousProfile.get(key);

            if (!Objects.equals(newValue, oldValue)) {
                changedFields.add(key);
            }
        }

        return changedFields;
    }

    private boolean shouldReevaluateMatches(Set<String> changedFields) {
        Set<String> significantFields = new HashSet<>(Arrays.asList(
                "skills", "experience", "education", "location",
                "country", "employmentStatus", "salary"
        ));

        return changedFields.stream().anyMatch(significantFields::contains);
    }
}
