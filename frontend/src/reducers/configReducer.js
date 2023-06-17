/* global localStorage */

export function setHomeInstance(baseUrl) {
  return {
    type: "setHomeInstance",
    payload: { baseUrl },
  };
}

const initialState = {
  homeBaseUrl: localStorage.getItem("instance") || false,
};

const configReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case "setHomeInstance":
      const baseUrl = action.payload.baseUrl;
      if (baseUrl == null) {
        localStorage.removeItem("instance");
      } else {
        localStorage.setItem("instance", action.payload.baseUrl);
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
