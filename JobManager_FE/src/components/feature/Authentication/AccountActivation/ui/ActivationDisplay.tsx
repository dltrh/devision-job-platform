import { useNavigate } from "react-router-dom";
import { ActivationState } from "../types";

interface ActivationDisplayProps {
    state: ActivationState;
}

export const ActivationDisplay = ({ state }: ActivationDisplayProps) => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                padding: "20px",
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    maxWidth: "500px",
                    padding: "40px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
            >
                {state.status === "loading" && (
                    <>
                        <h2>Activating Your Account...</h2>
                        <p>Please wait while we activate your account.</p>
                    </>
                )}

                {state.status === "success" && (
                    <>
                        <h2 style={{ color: "green" }}>✓ Success!</h2>
                        <p>{state.message}</p>
                        <p>Redirecting to login page...</p>
                    </>
                )}

                {state.status === "error" && (
                    <>
                        <h2 style={{ color: "red" }}>✗ Activation Failed</h2>
                        <p>{state.message}</p>
                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                marginTop: "20px",
                                padding: "10px 20px",
                                cursor: "pointer",
                            }}
                        >
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
