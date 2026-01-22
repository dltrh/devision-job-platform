import React, { useState, useEffect } from "react";
import { Button, Input, Alert } from "@/components/ui";
import { HeadlessModal } from "@/components/headless";
import type { ChangeEmailPayload, ChangePasswordPayload } from "../types";
import AuthService from "@/components/feature/Authentication/api/AuthService";
import { getStoredUser, updateStoredUserEmail } from "@/services/authStorage";

// Change Email Modal
interface ChangeEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ChangeEmailPayload) => Promise<void>;
    isSsoUser: boolean;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSsoUser,
}) => {
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSsoUser) {
            setError(
                "Email change is not available for accounts registered via SSO (Google, etc.)"
            );
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await onSubmit({ newEmail, currentPassword: password });
            onClose();
            setNewEmail("");
            setPassword("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to change email");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setNewEmail("");
        setPassword("");
        setError(null);
        onClose();
    };

    return (
        <HeadlessModal
            isOpen={isOpen}
            onClose={handleClose}
            overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        >
            <form onSubmit={handleSubmit}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Change Email Address
                    </h3>

                    {error && (
                        <Alert type="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="New Email Address"
                            type="email"
                            value={newEmail}
                            onChange={(value) => setNewEmail(value)}
                            required
                            fullWidth
                        />
                        <Input
                            label="Current Password"
                            type="password"
                            value={password}
                            onChange={(value) => setPassword(value)}
                            helperText="Enter your current password to confirm this change"
                            required
                            fullWidth
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Change Email
                    </Button>
                </div>
            </form>
        </HeadlessModal>
    );
};

// Change Password Modal directly via Frontend, not via email
interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ChangePasswordPayload) => Promise<void>;
    isSsoUser: boolean;
}

// const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit, isSsoUser }) => {

//     const [currentPassword, setCurrentPassword] = useState("");
//     const [newPassword, setNewPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [success, setSuccess] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (isSsoUser) {
//             setError("Password change is not available for accounts registered via SSO (Google, etc.)");
//             return;
//         }

//         if (newPassword !== confirmPassword) {
//             setError("New passwords do not match");
//             return;
//         }

//         if (newPassword.length < 8) {
//             setError("New password must be at least 8 characters long");
//             return;
//         }

//         setIsLoading(true);
//         setError(null);
//         try {
//             await AuthService.forgotPasswordCompany({ email: userEmail });
//             setSuccess(true);
//         } catch (err) {
//             setError(err instanceof Error ? err.message : "Failed to send reset email");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleClose = () => {
//         setError(null);
//         setSuccess(false);
//         onClose();
//     };

//     return (
//         <HeadlessModal
//             isOpen={isOpen}
//             onClose={handleClose}
//             overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//             className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
//         >
//             <div className="p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

//                 {error && (
//                     <Alert type="error" className="mb-4">
//                         {error}
//                     </Alert>
//                 )}

//                 {success ? (
//                     <div className="space-y-4">
//                         <Alert type="success">
//                             Password reset email sent! Please check your inbox at <strong>{userEmail}</strong> and follow the instructions to reset your password.
//                         </Alert>
//                         <p className="text-sm text-gray-500">
//                             If you don't see the email, please check your spam folder.
//                         </p>
//                     </div>
//                 ) : (
//                     <div className="space-y-4">
//                         <p className="text-sm text-gray-600">
//                             To change your password, we'll send a password reset link to your email address:
//                         </p>
//                         <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
//                             {userEmail}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                             Click the link in the email to set a new password for your account.
//                         </p>
//                     </div>
//                 )}
//             </div>

//             <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
//                 {success ? (
//                     <Button onClick={handleClose}>
//                         Done
//                     </Button>
//                 ) : (
//                     <>
//                         <Button type="button" variant="ghost" onClick={handleClose}>
//                             Cancel
//                         </Button>
//                         <Button onClick={handleSendResetEmail} isLoading={isLoading}>
//                             Send Reset Email
//                         </Button>
//                     </>
//                 )}
//             </div>
//         </HeadlessModal>
//     );
// };

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSsoUser,
}) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSsoUser) {
            setError(
                "Password change is not available for accounts registered via SSO (Google, etc.)"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }

        // Validate that passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password strength (optional but recommended)
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecialChar = /[@$!%*?&#]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            setError(
                "Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)"
            );
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await onSubmit({ currentPassword, newPassword });
            // Reset form and close modal on success
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to change password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
        onClose();
    };

    return (
        <HeadlessModal
            isOpen={isOpen}
            onClose={handleClose}
            overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        >
            <form onSubmit={handleSubmit}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

                    {error && (
                        <Alert type="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            value={currentPassword}
                            onChange={(value) => setCurrentPassword(value)}
                            required
                            fullWidth
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(value) => setNewPassword(value)}
                            helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
                            required
                            fullWidth
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(value) => setConfirmPassword(value)}
                            required
                            fullWidth
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Change Password
                    </Button>
                </div>
            </form>
        </HeadlessModal>
    );
};

// Main Account Security Panel
export const AccountSecurityPanel: React.FC = () => {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSsoUser, setIsSsoUser] = useState(false);
    const [currentEmail, setCurrentEmail] = useState("");

    // Check if user is SSO-based on stored auth data
    useEffect(() => {
        const user = getStoredUser();
        if (user) {
            setCurrentEmail(user.email);
            // Check if user authenticated via SSO (anything other than LOCAL)
            setIsSsoUser(user.authProvider !== "LOCAL");
        }
    }, []);

    const handleChangeEmail = async (data: ChangeEmailPayload): Promise<void> => {
        try {
            const user = getStoredUser();
            if (!user || !user.companyId) {
                throw new Error("User session not found. Please login again.");
            }

            const response = await AuthService.changeEmailCompany(user.companyId, data);
            if (response.success) {
                // Update the email in localStorage and UI
                updateStoredUserEmail(data.newEmail);
                setCurrentEmail(data.newEmail);

                setSuccessMessage(response.message || "Your email has been successfully changed.");
            } else {
                throw new Error(response.message || "Failed to change email");
            }
        } catch (error) {
            throw error;
        }
    };

    const handleChangePassword = async (data: ChangePasswordPayload): Promise<void> => {
        try {
            const user = getStoredUser();
            if (!user || !user.companyId) {
                throw new Error("User session not found. Please login again.");
            }

            const response = await AuthService.changePasswordCompany(user.companyId, data);
            if (response.success) {
                setSuccessMessage(response.message || "Password changed successfully!");
            } else {
                throw new Error(response.message || "Failed to change password");
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Account & Security</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your account credentials and security settings.
                </p>
            </div>

            {successMessage && (
                <Alert type="success" onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            {/* SSO Account Notice */}
            {isSsoUser && (
                <Alert type="info">
                    This account is registered via SSO (Single Sign-On). Email and password changes
                    are managed by your SSO provider.
                </Alert>
            )}

            {/* Email Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Email Address</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Your email address is used for logging in and receiving notifications.
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-2">{currentEmail}</p>
                        {isSsoUser && (
                            <p className="text-xs text-amber-600 mt-1">Managed by SSO provider</p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowEmailModal(true)}
                        disabled={isSsoUser}
                        title={
                            isSsoUser
                                ? "Email change not available for SSO accounts"
                                : "Change email"
                        }
                    >
                        Change Email
                    </Button>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Password</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Keep your account secure by using a strong password.
                        </p>
                        {!isSsoUser && <p className="text-sm text-gray-500 mt-2">••••••••••••</p>}
                        {isSsoUser && (
                            <p className="text-xs text-amber-600 mt-2">Managed by SSO provider</p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowPasswordModal(true)}
                        disabled={isSsoUser}
                        title={
                            isSsoUser
                                ? "Password change not available for SSO accounts"
                                : "Change password"
                        }
                    >
                        Change Password
                    </Button>
                </div>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Security Tips</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                        <svg
                            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Use a unique password that you don't use for other accounts
                    </li>
                    <li className="flex items-start gap-2">
                        <svg
                            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Include a mix of letters, numbers, and special characters
                    </li>
                    <li className="flex items-start gap-2">
                        <svg
                            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Never share your password with anyone
                    </li>
                </ul>
            </div>

            {/* Modals */}
            <ChangeEmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onSubmit={handleChangeEmail}
                isSsoUser={isSsoUser}
            />
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handleChangePassword}
                isSsoUser={isSsoUser}
            />
        </div>
    );
};

export default AccountSecurityPanel;
