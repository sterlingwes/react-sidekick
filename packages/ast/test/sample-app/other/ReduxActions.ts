export const saveProfile = ({ firstName, lastName }: any) => ({
  type: "SAVE_PROFILE",
  payload: { firstName, lastName },
});

export const clearProfile = () => ({
  type: "CLEAR_PROFILE",
});
