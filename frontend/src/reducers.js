import { combineReducers } from "redux";

import configReducer from "./reducers/configReducer";

const reducers = combineReducers({
  configReducer,
});

export default reducers;
