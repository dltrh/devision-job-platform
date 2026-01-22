import { all, fork } from "redux-saga/effects";
import { sagas } from "../redux";

export default function* rootSaga() {
    yield all([...Object.values(sagas)].map(fork));
}
