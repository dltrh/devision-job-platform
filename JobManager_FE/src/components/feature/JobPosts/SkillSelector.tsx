import React, { useState, useEffect, useRef } from "react";
import { skillService } from "@/services/skillService";
import { Skill } from "@/types/skill";
import clsx from "clsx";

interface SkillSelectorProps {
	selectedSkills: Skill[];
	onChange: (skills: Skill[]) => void;
	error?: string;
	label?: string;
	placeholder?: string;
	maxSkills?: number;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
	selectedSkills,
	onChange,
	error,
	label = "Technical Skills *",
	placeholder = "Type to search skills...",
	maxSkills = 20,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [allSkills, setAllSkills] = useState<Skill[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Fetch all skills on mount
	useEffect(() => {
		const fetchSkills = async () => {
			setIsLoading(true);
			try {
				const skills = await skillService.getAllSkills();
				setAllSkills(skills);
			} catch (error) {
				console.error("Failed to load skills:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSkills();
	}, []);

	// Filter skills based on search query (client-side)
	const filteredSkills = searchQuery.trim().length >= 2
		? allSkills.filter((skill) => {
			const matchesSearch = skill.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const notSelected = !selectedSkills.some((s) => s.id === skill.id);
			return matchesSearch && notSelected;
		})
		: [];

	// Get popular skills (top 10 by usage count, excluding selected)
	const popularSkills = allSkills
		.filter((skill) => !selectedSkills.some((s) => s.id === skill.id))
		.sort((a, b) => b.usageCount - a.usageCount)
		.slice(0, 10);

	const addSkill = (skill: Skill) => {
		if (selectedSkills.length >= maxSkills) {
			alert(`Maximum ${maxSkills} skills allowed`);
			return;
		}

		if (!selectedSkills.some((s) => s.id === skill.id)) {
			onChange([...selectedSkills, skill]);
			setSearchQuery("");
			setShowSuggestions(false);
			searchInputRef.current?.focus();
		}
	};

	const removeSkill = (skillId: string) => {
		onChange(selectedSkills.filter((skill) => skill.id !== skillId));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && searchQuery === "" && selectedSkills.length > 0) {
			const newSkills = [...selectedSkills];
			newSkills.pop();
			onChange(newSkills);
		} else if (e.key === "Enter" && filteredSkills.length > 0) {
			e.preventDefault();
			addSkill(filteredSkills[0]);
		}
	};

	return (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
			</label>

			{/* Skills Input with Chips */}
			<div className="relative">
				<div
					className={clsx(
						"flex flex-wrap gap-2 p-3 border-2 rounded-lg transition-colors min-h-[48px]",
						error
							? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500"
							: "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
					)}
				>
					{/* Selected Skill Chips */}
					{selectedSkills.map((skill) => (
						<span
							key={skill.id}
							className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
						>
							{skill.name}
							<button
								type="button"
								onClick={() => removeSkill(skill.id)}
								className="hover:text-blue-900 focus:outline-none ml-1"
								aria-label={`Remove ${skill.name}`}
							>
								×
							</button>
						</span>
					))}

					{/* Search Input */}
					<input
						ref={searchInputRef}
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => {
							if (searchQuery.trim().length >= 2) {
								setShowSuggestions(true);
							}
						}}
						onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
						placeholder={
							selectedSkills.length === 0
								? placeholder
								: "Add more..."
						}
						className="flex-1 min-w-[200px] outline-none bg-transparent"
						disabled={selectedSkills.length >= maxSkills || isLoading}
					/>

					{/* Loading Indicator */}
					{isLoading && (
						<div className="flex items-center px-2">
							<div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
						</div>
					)}
				</div>

				{/* Autocomplete Suggestions Dropdown */}
				{showSuggestions && filteredSkills.length > 0 && (
					<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
						{filteredSkills.slice(0, 20).map((skill) => (
							<button
								key={skill.id}
								type="button"
								onClick={() => addSkill(skill)}
								className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex justify-between items-center"
							>
								<span className="text-sm font-medium">{skill.name}</span>
								<span className="text-xs text-gray-500">
									{skill.usageCount} uses
								</span>
							</button>
						))}
					</div>
				)}

				{/* No results message */}
				{searchQuery.trim().length >= 2 && filteredSkills.length === 0 && !isLoading && (
					<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3">
						<p className="text-sm text-gray-500">
							No skills found matching "{searchQuery}"
						</p>
					</div>
				)}
			</div>

			{/* Error Message */}
			{error && (
				<p className="mt-2 text-sm text-red-600">{error}</p>
			)}

			{/* Helper Text */}
			<p className="mt-2 text-xs text-gray-500">
				Type at least 2 characters to search. Press Enter to add the first result, or Backspace to remove the last skill.
				{selectedSkills.length > 0 && ` (${selectedSkills.length}/${maxSkills} skills)`}
			</p>

			{/* Quick Add Popular Skills */}
			{selectedSkills.length === 0 && popularSkills.length > 0 && !isLoading && (
				<div className="mt-3">
					<p className="text-xs text-gray-600 mb-2">Popular skills:</p>
					<div className="flex flex-wrap gap-2">
						{popularSkills.slice(0, 8).map((skill) => (
							<button
								key={skill.id}
								type="button"
								onClick={() => addSkill(skill)}
								className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
							>
								+ {skill.name}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};