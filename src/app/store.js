import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "../rootReducer/todoActs";

export const store = configureStore({
  reducer: {
    todo: rootReducer,
  },
});
