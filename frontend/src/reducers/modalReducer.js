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
};

const modalReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default modalReducer;
