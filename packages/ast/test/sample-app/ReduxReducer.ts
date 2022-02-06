const INITIAL_STATE = {
  firstName: "",
  lastName: "",
};

export const appReducer = (state = INITIAL_STATE, action: any) => {
  if (action.type === "SAVE_PROFILE") {
    return action.payload;
  }

  if (action.type === "CLEAR_PROFILE") {
    return INITIAL_STATE;
  }

  return state;
};
