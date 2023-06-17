/* global localStorage */

import storage from "../lib/storage";

export function setHomeInstance(baseUrl) {
  return {
    type: "setHomeInstance",
    payload: { baseUrl },
  };
}

const initialState = {
  homeBaseUrl: storage.get("instance"),
};

const configReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case "setHomeInstance":
      const baseUrl = action.payload.baseUrl;
      if (baseUrl == null) {
        storage.remove("instance");
      } else {
        storage.set("instance", action.payload.baseUrl);
      }
      return {
        ...state,
        homeBaseUrl: action.payload.baseUrl,
      };

    default:
      return state;
  }
};

export default configReducer;
