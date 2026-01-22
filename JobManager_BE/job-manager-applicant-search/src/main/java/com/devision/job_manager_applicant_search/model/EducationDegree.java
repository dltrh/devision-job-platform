package com.devision.job_manager_applicant_search.model;

/**
 * Enumeration representing the highest education degree levels.
 * Used for matching applicants with search profile requirements.
 * 
 * The ordinal order represents the hierarchy:
 * OTHER < BACHELOR < MASTER < DOCTORATE
 */
public enum EducationDegree {
    OTHER(0),
    BACHELOR(1),
    MASTER(2),
    DOCTORATE(3);

    private final int level;

    EducationDegree(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    /**
     * Checks if this degree is equal to or higher than the required degree.
     *
     * @param required the required minimum degree
     * @return true if this degree meets or exceeds the requirement
     */
    public boolean meetsRequirement(EducationDegree required) {
        if (required == null) {
            return true;
        }
        return this.level >= required.level;
    }
}
