export function showInstanceModal(instanceData) {
  return {
    type: "showInstanceModal",
    payload: { instanceData },
  };
}
export function hideInstanceModal() {
  return {
    type: "hideInstanceModal",
    payload: {},
  };
}

const initialState = {
  instanceModalOpen: false,
  instanceData: {},
};

const modalReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case "showInstanceModal":
      return {
        ...state,
        instanceModalOpen: true,
        instanceData: action.payload.instanceData,
      };

    case "hideInstanceModal":
      return {
        ...state,
        instanceModalOpen: false,
        instanceData: {},
      };

    default:
      return state;
  }
};

export default modalReducer;
