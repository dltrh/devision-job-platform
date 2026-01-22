import React, { useState, useEffect } from "react";
import { Select, Button, Badge } from "@/components/ui";
import { HeadlessModal } from "@/components/headless";
import { Plus, Save, Pencil, Trash2 } from "lucide-react";
import type { SearchProfileResponse, SearchState } from "../types";

interface SavedSearchProfilesProps {
  profiles: SearchProfileResponse[];
  selectedProfile: SearchProfileResponse | null;
  isPremium: boolean;
  isSaving: boolean;
  searchState: SearchState;
  onSelectProfile: (profileId: string | null) => void;
  onSaveAsNew: (name: string) => Promise<void>;
  onSaveChanges: (data: { profileName: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const SavedSearchProfiles: React.FC<SavedSearchProfilesProps> = ({
  profiles,
  selectedProfile,
  isPremium,
  isSaving,
  // searchState is passed but not used directly in this component
  // It's used by parent to create/update profiles
  onSelectProfile,
  onSaveAsNew,
  onSaveChanges,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [editProfileName, setEditProfileName] = useState(
    selectedProfile?.profileName || "",
  );
  const [nameError, setNameError] = useState("");
  const [editNameError, setEditNameError] = useState("");

  useEffect(() => {
    setEditProfileName(selectedProfile?.profileName || "");
  }, [selectedProfile?.profileName]);

  const profileOptions = [
    { value: "", label: "Select profile" },
    ...profiles.map((p) => ({ value: p.id, label: p.profileName })),
  ];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelectProfile(value || null);
  };

  const handleSaveAsNew = async () => {
    if (!newProfileName.trim()) {
      setNameError("Profile name is required");
      return;
    }
    if (newProfileName.length > 255) {
      setNameError("Profile name must be less than 255 characters");
      return;
    }

    await onSaveAsNew(newProfileName.trim());
    setIsModalOpen(false);
    setNewProfileName("");
    setNameError("");
  };

  const handleEditName = async () => {
    if (!editProfileName.trim()) {
      setEditNameError("Profile name is required");
      return;
    }
    if (editProfileName.length > 255) {
      setEditNameError("Profile name must be less than 255 characters");
      return;
    }
    if (!selectedProfile) return;
    await onSaveChanges({ profileName: editProfileName.trim() });
    setIsEditNameModalOpen(false);
    setEditNameError("");
  };

  const handleDelete = async () => {
    await onDelete();
    setIsDeleteModalOpen(false);
  };

  const openSaveModal = () => {
    setNewProfileName("");
    setNameError("");
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">
        Saved Search Profiles
      </h3>

      {/* Profile Selector */}
      <Select
        options={profileOptions}
        value={selectedProfile?.id || ""}
        onChange={handleSelectChange}
        disabled={!isPremium || profiles.length === 0}
        fullWidth
      />

      {/* Action Buttons */}
      {selectedProfile && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onSaveChanges}
            disabled={!isPremium || isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            fullWidth
            className="col-span-2"
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditNameModalOpen(true)}
            disabled={!isPremium || isSaving}
            leftIcon={<Pencil className="w-4 h-4" />}
            fullWidth
          >
            Edit Name
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!isPremium || isSaving}
            leftIcon={<Trash2 className="w-4 h-4" />}
            fullWidth
          >
            Delete
          </Button>
        </div>
      )}

      {/* Save As New Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={openSaveModal}
        disabled={!isPremium || isSaving}
        fullWidth
        leftIcon={<Plus className="w-4 h-4" />}
        badge={
          !isPremium ? (
            <Badge variant="gradient">
              <i>Premium</i>
            </Badge>
          ) : undefined
        }
      >
        Save As New
      </Button>

      {/* Editing indicator */}
      {selectedProfile && (
        <p className="text-sm text-gray-600 italic">
          Editing profile: {selectedProfile.profileName}
        </p>
      )}

      {/* Save As New Modal */}
      <HeadlessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h2 className="text-lg font-semibold mb-4">Save Search Profile</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => {
              setNewProfileName(e.target.value);
              setNameError("");
            }}
            placeholder="Enter profile name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={255}
          />
          {nameError && (
            <p className="text-sm text-red-600 mt-1">{nameError}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAsNew}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </HeadlessModal>

      {/* Edit Name Modal */}
      <HeadlessModal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h2 className="text-lg font-semibold mb-4">Edit Profile Name</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={editProfileName}
            onChange={(e) => {
              setEditProfileName(e.target.value);
              setEditNameError("");
            }}
            placeholder="Enter new profile name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={255}
          />
          {editNameError && (
            <p className="text-sm text-red-600 mt-1">{editNameError}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditNameModalOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditName}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </HeadlessModal>

      {/* Delete Confirmation Modal */}
      <HeadlessModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h2 className="text-lg font-semibold mb-4">Delete Profile</h2>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete "{selectedProfile?.profileName}"? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isSaving}>
            {isSaving ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </HeadlessModal>
    </div>
  );
};
