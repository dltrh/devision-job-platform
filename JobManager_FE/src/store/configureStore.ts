import { createStore, applyMiddleware, Store } from "redux";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { enableBatching } from "redux-batched-actions";
import createReducer from "./reducers";
import rootSaga from "./saga";

const configureStore = (initialState = {}): Store => {
    const rootReducer = createReducer();
    const sagaMiddleware = createSagaMiddleware();

    const middlewares = [sagaMiddleware];

    const isDev = import.meta.env.VITE_NODE_ENV === "development";

    if (isDev) {
        const loggerMiddleware = createLogger({
            collapsed: () => true,
        });
        (middlewares as any[]).push(loggerMiddleware);
    }

    const store = createStore(
        enableBatching(rootReducer),
        initialState,
        applyMiddleware(...middlewares),
    );

    sagaMiddleware.run(rootSaga);

    return store;
};

export default configureStore;
