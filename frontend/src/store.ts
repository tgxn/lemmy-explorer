import { configureStore } from "@reduxjs/toolkit";

import combinedReducers from "./reducers";

export default configureStore({
  reducer: combinedReducers,
});
