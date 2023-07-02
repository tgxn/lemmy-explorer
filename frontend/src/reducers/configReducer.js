/* global localStorage */

import storage from "../lib/storage";

export function setHomeInstance(baseUrl, type = "lemmy") {
  return {
    type: "setHomeInstance",
    payload: { baseUrl, type },
  };
}

export function changeInstanceType(type) {
  return {
    type: "changeInstanceType",
    payload: { type },
  };
}

export function setFilteredInstances(filteredInstances) {
  return {
    type: "setFilteredInstances",
    payload: { filteredInstances },
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
  instanceType: storage.get("type", "lemmy"),
  filteredInstances: storage.get("filteredInstances", []),
  filterSuspicious: storage.get("config.filterSuspicious", true),
};

const configReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case "setHomeInstance":
      const baseUrl = action.payload.baseUrl;
      if (baseUrl == null) {
        storage.remove("instance");
        storage.remove("type");
      } else {
        storage.set("instance", action.payload.baseUrl);
        storage.set("type", action.payload.type);
      }
      return {
        ...state,
        homeBaseUrl: action.payload.baseUrl,
        instanceType: action.payload.type,
      };

    case "changeInstanceType":
      storage.set("type", action.payload.type);
      return {
        ...state,
        instanceType: action.payload.type,
      };

    case "setFilteredInstances":
      storage.set("filteredInstances", action.payload.filteredInstances);
      return {
        ...state,
        filteredInstances: action.payload.filteredInstances,
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
