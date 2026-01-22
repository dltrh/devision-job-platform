import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ActivationState } from "../types.ts";
import { API_BASE_URL } from "@/utils/constants";

export const useAccountActivation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasActivated = useRef(false);

    const [state, setState] = useState<ActivationState>({
        status: "loading",
        message: "",
    });

    useEffect(() => {
        const activateAccount = async () => {
            const token = searchParams.get("token");

            // Prevent duplicate activation calls (React 18 StrictMode runs effects twice)
            if (hasActivated.current) {
                return;
            }
            hasActivated.current = true;

            if (!token) {
                setState({
                    status: "error",
                    message: "Invalid activation link",
                });

                return;
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/activate`, {
                    token: token,
                });

                if (response.data.success) {
                    setState({
                        status: "success",
                        message: response.data.message,
                    });

                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                } else {
                    setState({
                        status: "error",
                        message: response.data.message,
                    });
                }
            } catch (error: any) {
                setState({
                    status: "error",
                    message:
                        error.response?.data?.message ||
                        "Error occurred while activating account. Please try again.",
                });
            }
        };

        activateAccount();
    }, [searchParams, navigate]);

    return state;
};
