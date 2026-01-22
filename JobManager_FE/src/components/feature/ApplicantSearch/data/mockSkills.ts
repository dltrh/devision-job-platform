import type { Skill } from "@/types/skill";

/**
 * Mock skills data for UI testing when JA service is unavailable.
 * Aligned with JA service's SkillDto structure:
 * - id: UUID string
 * - name: Skill name
 * - usageCount: Number of users with this skill
 * 
 * Skills extracted from mockApplicants.ts for consistency.
 */
export const MOCK_SKILLS: Skill[] = [
    // Frontend & JavaScript Ecosystem
    { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", name: "React", usageCount: 45 },
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "TypeScript", usageCount: 38 },
    { id: "550e8400-e29b-41d4-a716-446655440020", name: "JavaScript", usageCount: 52 },
    { id: "550e8400-e29b-41d4-a716-446655440021", name: "HTML/CSS", usageCount: 48 },
    { id: "550e8400-e29b-41d4-a716-446655440042", name: "Vue.js", usageCount: 22 },
    { id: "550e8400-e29b-41d4-a716-446655440026", name: "React Native", usageCount: 18 },
    { id: "550e8400-e29b-41d4-a716-446655440027", name: "Flutter", usageCount: 15 },

    // Backend & Server-side
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "Node.js", usageCount: 35 },
    { id: "550e8400-e29b-41d4-a716-446655440022", name: "Java", usageCount: 42 },
    { id: "550e8400-e29b-41d4-a716-446655440023", name: "Spring Boot", usageCount: 28 },
    { id: "550e8400-e29b-41d4-a716-446655440005", name: "Python", usageCount: 55 },
    { id: "550e8400-e29b-41d4-a716-446655440024", name: "Microservices", usageCount: 24 },

    // Databases
    { id: "550e8400-e29b-41d4-a716-446655440003", name: "PostgreSQL", usageCount: 32 },
    { id: "550e8400-e29b-41d4-a716-446655440008", name: "SQL", usageCount: 45 },
    { id: "550e8400-e29b-41d4-a716-446655440038", name: "MongoDB", usageCount: 28 },
    { id: "550e8400-e29b-41d4-a716-446655440039", name: "Redis", usageCount: 22 },

    // Cloud & DevOps
    { id: "550e8400-e29b-41d4-a716-446655440004", name: "AWS", usageCount: 38 },
    { id: "550e8400-e29b-41d4-a716-446655440015", name: "Kubernetes", usageCount: 20 },
    { id: "550e8400-e29b-41d4-a716-446655440016", name: "Docker", usageCount: 35 },
    { id: "550e8400-e29b-41d4-a716-446655440017", name: "Terraform", usageCount: 15 },
    { id: "550e8400-e29b-41d4-a716-446655440018", name: "CI/CD", usageCount: 28 },
    { id: "550e8400-e29b-41d4-a716-446655440019", name: "Linux", usageCount: 40 },

    // AI & Machine Learning
    { id: "550e8400-e29b-41d4-a716-446655440006", name: "Machine Learning", usageCount: 25 },
    { id: "550e8400-e29b-41d4-a716-446655440007", name: "TensorFlow", usageCount: 18 },
    { id: "550e8400-e29b-41d4-a716-446655440010", name: "PyTorch", usageCount: 16 },
    { id: "550e8400-e29b-41d4-a716-446655440009", name: "Data Analysis", usageCount: 30 },
    { id: "550e8400-e29b-41d4-a716-446655440046", name: "NLP", usageCount: 12 },
    { id: "550e8400-e29b-41d4-a716-446655440047", name: "Transformers", usageCount: 8 },
    { id: "550e8400-e29b-41d4-a716-446655440048", name: "LLMs", usageCount: 10 },

    // Mobile Development
    { id: "550e8400-e29b-41d4-a716-446655440028", name: "iOS", usageCount: 20 },
    { id: "550e8400-e29b-41d4-a716-446655440029", name: "Android", usageCount: 22 },

    // Design & UX
    { id: "550e8400-e29b-41d4-a716-446655440011", name: "Figma", usageCount: 28 },
    { id: "550e8400-e29b-41d4-a716-446655440012", name: "UI Design", usageCount: 25 },
    { id: "550e8400-e29b-41d4-a716-446655440013", name: "UX Research", usageCount: 18 },
    { id: "550e8400-e29b-41d4-a716-446655440014", name: "Prototyping", usageCount: 20 },
    { id: "550e8400-e29b-41d4-a716-446655440040", name: "Design Systems", usageCount: 15 },
    { id: "550e8400-e29b-41d4-a716-446655440041", name: "Storybook", usageCount: 12 },

    // Testing & QA
    { id: "550e8400-e29b-41d4-a716-446655440030", name: "Selenium", usageCount: 15 },
    { id: "550e8400-e29b-41d4-a716-446655440031", name: "Cypress", usageCount: 18 },
    { id: "550e8400-e29b-41d4-a716-446655440032", name: "Jest", usageCount: 25 },

    // Security
    { id: "550e8400-e29b-41d4-a716-446655440033", name: "Security", usageCount: 12 },
    { id: "550e8400-e29b-41d4-a716-446655440034", name: "Penetration Testing", usageCount: 8 },
    { id: "550e8400-e29b-41d4-a716-446655440035", name: "OWASP", usageCount: 10 },

    // Other
    { id: "550e8400-e29b-41d4-a716-446655440025", name: "Product Management", usageCount: 12 },
    { id: "550e8400-e29b-41d4-a716-446655440036", name: "Technical Writing", usageCount: 8 },
    { id: "550e8400-e29b-41d4-a716-446655440037", name: "Documentation", usageCount: 15 },

    // Blockchain
    { id: "550e8400-e29b-41d4-a716-446655440043", name: "Solidity", usageCount: 8 },
    { id: "550e8400-e29b-41d4-a716-446655440044", name: "Ethereum", usageCount: 10 },
    { id: "550e8400-e29b-41d4-a716-446655440045", name: "Web3.js", usageCount: 6 },
];
