package com.devision.job_manager_auth.entity;

import lombok.Getter;

@Getter
public enum Country {
    // Southeast Asia
    VIETNAM("VN", "Vietnam", "auth_shard_vn"),
    SINGAPORE("SG", "Singapore", "auth_shard_sg"),
    MALAYSIA("MY", "Malaysia", "auth_shard_asia"),
    THAILAND("TH", "Thailand", "auth_shard_asia"),
    PHILIPPINES("PH", "Philippines", "auth_shard_asia"),
    INDONESIA("ID", "Indonesia", "auth_shard_asia"),
    JAPAN("JP", "Japan", "auth_shard_asia"),
    SOUTH_KOREA("KR", "South Korea", "auth_shard_asia"),
    CHINA("CN", "China", "auth_shard_asia"),

    // Oceania
    AUSTRALIA("AU", "Australia", "auth_shard_oceania"),
    NEW_ZEALAND("NZ", "New Zealand", "auth_shard_oceania"),

    // North America
    UNITED_STATES("US", "United States", "auth_shard_na"),
    CANADA("CA", "Canada", "auth_shard_na"),

    // Europe
    UNITED_KINGDOM("GB", "United Kingdom", "auth_shard_eu"),
    GERMANY("DE", "Germany", "auth_shard_eu"),
    FRANCE("FR", "France", "auth_shard_eu"),
    NETHERLANDS("NL", "Netherlands", "auth_shard_eu"),

    // Other
    OTHER("XX", "Other", "auth_shard_others");

    private final String code; // ISO 3166-1
    private final String displayName;
    private final String shardKey; // shard identifier

    Country(String code, String displayName, String shardKey) {
        this.code = code;
        this.displayName = displayName;
        this.shardKey = shardKey;
    }

    /**
     * Find Country enum by country code
     *
     * @param code ISO
     * @return Country enum or null
     */
    public static Country fromCode(String code) {
        if (code == null) {
            return null;
        }

        for (Country country : Country.values()) {
            if (country.code.equalsIgnoreCase(code)) {
                return country;
            }
        }
        return null;
    }

    /**
     * Find Country enum by name
     *
     * @param displayName
     * @return Country enum or null
     */
    public static Country fromDisplayName(String displayName) {
        if (displayName == null) {
            return null;
        }

        for (Country country : Country.values()) {
            if (country.displayName.equalsIgnoreCase(displayName)) {
                return country;
            }
        }

        return null;
    }
}
