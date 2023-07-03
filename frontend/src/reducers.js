import { combineReducers } from "redux";

import configReducer from "./reducers/configReducer";
import modalReducer from "./reducers/modalReducer";

const reducers = combineReducers({
  configReducer,
  modalReducer,
});

export default reducers;
