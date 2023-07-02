/* global localStorage */

import storage from "../lib/storage";

export function setHomeInstance(baseUrl) {
  return {
    type: "setHomeInstance",
    payload: { baseUrl },
  };
}

export function setFilterSuspicious(filterSuspicious) {
  return {
    type: "setFilterSuspicious",
    payload: { filterSuspicious },
  };
}

const initialState = {
  homeBaseUrl: storage.get("instance"),
  filterSuspicious: storage.get("config.filterSuspicious", true),
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

    case "setFilterSuspicious":
      storage.set("config.filterSuspicious", action.payload.filterSuspicious);
      return {
        ...state,
        filterSuspicious: action.payload.filterSuspicious,
      };

    default:
      return state;
  }
};

export default configReducer;
