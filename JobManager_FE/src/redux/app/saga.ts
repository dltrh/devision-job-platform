import { takeEvery, put, delay } from "redux-saga/effects";
import * as types from "./type";
import actions from "./actions";

function* handleToggleLoading(action: any) {
    yield delay(300);
    yield put(actions.setLoading(action.payload));
}

export function* watchToggleLoading() {
    yield takeEvery(types.TOGGLE_LOADING_ASYNC, handleToggleLoading);
}
