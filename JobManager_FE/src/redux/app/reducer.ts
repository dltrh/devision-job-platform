import * as types from "./type";
export interface AppState {
    loading: boolean;
    error: string | null;
    initialized?: boolean;
    test: string;
}

const INITIAL_STATE: AppState = {
    loading: true,
    error: null,
    initialized: false,
    test: "test",
};

type Action = { type: string; payload?: any };

export default function appReducer(
    state: AppState = INITIAL_STATE,
    action: Action,
): AppState {
    switch (action.type) {
        case types.SET_LOADING:
            return { ...state, loading: !!action.payload };
        case types.SET_ERROR:
            return { ...state, error: action.payload ?? null, loading: false };
        case types.SET_INITIALIZED:
            return { ...state, initialized: !!action.payload };
        case types.RESET:
            return { ...INITIAL_STATE };
        default:
            return state;
    }
}
