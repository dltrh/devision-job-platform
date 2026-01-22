import { combineReducers } from "redux";
import { reducers } from "../redux";
import _ from "lodash";

const appReducer = combineReducers(reducers);
export default function createReducer() {
    const rootReducer = (state, action) => {
        if (action.type === "FORCE_UPDATE_GLOBAL_STATE") {
            return appReducer(_.cloneDeep(action.payload), action as never);
        }
        return appReducer(state, action as never);
    };

    return rootReducer;
}
