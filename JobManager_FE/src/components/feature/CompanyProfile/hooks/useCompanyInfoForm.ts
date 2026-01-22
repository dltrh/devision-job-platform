import { useState, useEffect, useCallback } from "react";
import type { Company, CompanyProfile, CompanyProfileFormData, CompanyFormData, ProfileFormData } from "../types";
import {
    getCompany,
    getCompanyProfile,
    updateCompany,
    updateCompanyProfile,
    uploadLogo,
    uploadBanner,
} from "../api/CompanyProfileService";

interface UseCompanyInfoFormReturn {
    formData: CompanyProfileFormData;
    company: Company | null;
    profile: CompanyProfile | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    successMessage: string | null;
    handleChange: (field: keyof CompanyProfileFormData, value: string) => void;
    handleSubmitCompany: () => Promise<void>;
    handleSubmitProfile: () => Promise<void>;
    handleLogoUpload: (file: File) => Promise<void>;
    handleBannerUpload: (file: File) => Promise<void>;
    refreshData: () => Promise<void>;
}

const initialFormData: CompanyProfileFormData = {
    // Company fields
    name: "",
    phone: "",
    streetAddress: "",
    city: "",
    countryCode: "",
    // Profile fields
    aboutUs: "",
    whoWeSeek: "",
    websiteUrl: "",
    linkedinUrl: "",
    industry: "",
    companySize: "",
    foundedYear: "",
};

export function useCompanyInfoForm(): UseCompanyInfoFormReturn {
    const [formData, setFormData] = useState<CompanyProfileFormData>(initialFormData);
    const [company, setCompany] = useState<Company | null>(null);
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [companyData, profileData] = await Promise.all([
                getCompany(),
                getCompanyProfile(),
            ]);
            setCompany(companyData);
            setProfile(profileData);
            setFormData({
                // Company fields
                name: companyData.name || "",
                phone: companyData.phone || "",
                streetAddress: companyData.streetAddress || "",
                city: companyData.city || "",
                countryCode: companyData.countryCode || "",
                // Profile fields
                aboutUs: profileData.aboutUs || "",
                whoWeSeek: profileData.whoWeSeek || "",
                websiteUrl: profileData.websiteUrl || "",
                linkedinUrl: profileData.linkedinUrl || "",
                industry: profileData.industry || "",
                companySize: profileData.companySize || "",
                foundedYear: profileData.foundedYear?.toString() || "",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = useCallback((field: keyof CompanyProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setSuccessMessage(null);
    }, []);

    // Submit company data (name, phone, streetAddress, city, countryCode)
    const handleSubmitCompany = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const companyPayload: Partial<CompanyFormData> = {
                name: formData.name,
                phone: formData.phone,
                streetAddress: formData.streetAddress,
                city: formData.city,
                countryCode: formData.countryCode,
            };
            const updatedCompany = await updateCompany(companyPayload);
            setCompany(updatedCompany);
            setSuccessMessage("Company information updated successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save company information");
        } finally {
            setIsSaving(false);
        }
    }, [formData]);

    // Submit profile data (aboutUs, whoWeSeek, websiteUrl, linkedinUrl, industry, companySize, foundedYear)
    const handleSubmitProfile = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const profilePayload: Partial<ProfileFormData> = {
                aboutUs: formData.aboutUs,
                whoWeSeek: formData.whoWeSeek,
                websiteUrl: formData.websiteUrl,
                linkedinUrl: formData.linkedinUrl,
                industry: formData.industry,
                companySize: formData.companySize,
                foundedYear: formData.foundedYear,
            };
            const updatedProfile = await updateCompanyProfile(profilePayload);
            setProfile(updatedProfile);
            setSuccessMessage("Profile updated successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    }, [formData]);

    const handleLogoUpload = useCallback(async (file: File) => {
        setError(null);
        try {
            const result = await uploadLogo(file);
            // Add cache-busting timestamp to force browser to reload the image
            const cacheBustedUrl = `${result.url}?t=${Date.now()}`;
            setProfile((prev) => prev ? { ...prev, logoUrl: cacheBustedUrl } : prev);
            setSuccessMessage("Logo uploaded successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload logo");
        }
    }, []);

    const handleBannerUpload = useCallback(async (file: File) => {
        setError(null);
        try {
            const result = await uploadBanner(file);
            // Add cache-busting timestamp to force browser to reload the image
            const cacheBustedUrl = `${result.url}?t=${Date.now()}`;
            setProfile((prev) => prev ? { ...prev, bannerUrl: cacheBustedUrl } : prev);
            setSuccessMessage("Banner uploaded successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload banner");
        }
    }, []);

    return {
        formData,
        company,
        profile,
        isLoading,
        isSaving,
        error,
        successMessage,
        handleChange,
        handleSubmitCompany,
        handleSubmitProfile,
        handleLogoUpload,
        handleBannerUpload,
        refreshData: fetchData,
    };
}
