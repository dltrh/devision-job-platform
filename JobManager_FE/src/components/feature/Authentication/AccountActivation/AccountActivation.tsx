import { useAccountActivation } from "./hooks/useAccountActivation";
import { ActivationDisplay } from "./ui/ActivationDisplay";

export const AccountActivation = () => {
    const state = useAccountActivation();
    return <ActivationDisplay state={state} />;
};
