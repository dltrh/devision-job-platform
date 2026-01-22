import * as types from "./type";

const setLoading = (payload: boolean) => ({ type: types.SET_LOADING, payload });
const setError = (payload: string | null) => ({
    type: types.SET_ERROR,
    payload,
});
const setInitialized = (payload: boolean) => ({
    type: types.SET_INITIALIZED,
    payload,
});
const reset = () => ({ type: types.RESET });

const toggleLoadingAsync = (payload: boolean) => ({
    type: types.TOGGLE_LOADING_ASYNC,
    payload,
});

export default {
    setLoading,
    setError,
    setInitialized,
    reset,
    toggleLoadingAsync,
};
