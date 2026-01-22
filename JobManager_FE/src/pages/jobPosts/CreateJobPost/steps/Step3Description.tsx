import React from "react";
import { Textarea } from "@/components/ui";
import { JobPostFormData, JobPostFormErrors } from "../types";
import { SkillSelector } from "@/components/feature/JobPosts/SkillSelector"
import clsx from "clsx";

interface Step3DescriptionProps {
  formData: JobPostFormData;
  errors: JobPostFormErrors;
  onChange: (field: keyof JobPostFormData, value: any) => void;
}

export const Step3Description: React.FC<Step3DescriptionProps> = ({
                                                                    formData,
                                                                    errors,
                                                                    onChange,
                                                                  }) => {
  const characterCount = formData.description.length;
  const maxCharacters = 10000;
  const isNearLimit = characterCount > maxCharacters * 0.9;

  return (
    <div className="space-y-6">
      {/* Job Description */}
      <div>
        <Textarea
          label="Job Description *"
          placeholder="Describe the role, responsibilities, requirements, and what makes this position exciting..."
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          error={errors.description}
          rows={10}
          fullWidth
        />
        <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                        Minimum 50 characters for better clarity
                    </span>
          <span
            className={clsx(
              "text-xs",
              isNearLimit ? "text-red-600" : "text-gray-500"
            )}
          >
                        {characterCount.toLocaleString()} /{" "}
            {maxCharacters.toLocaleString()}
                    </span>
        </div>

        {/* Rich Text Tips */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">
            💡 Tips for a great job description:
          </p>
          <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
            <li>
              Start with an engaging overview of the role and your
              company
            </li>
            <li>List key responsibilities clearly</li>
            <li>
              Specify required and preferred qualifications
              separately
            </li>
            <li>Highlight what makes your company unique</li>
            <li>Mention benefits and growth opportunities</li>
          </ul>
        </div>
      </div>

      {/* Technical Skills - Using SkillSelector Component */}
      <SkillSelector
        selectedSkills={formData.selectedSkills || []}
        onChange={(skills) => onChange("selectedSkills", skills)}
        error={errors.technicalSkills}
        maxSkills={20}
      />
    </div>
  );
};
