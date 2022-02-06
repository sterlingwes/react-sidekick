import { createStore, Store } from "redux";
import { appReducer } from "./ReduxReducer";

let store: Store;

export const getStore = () => {
  if (store) {
    return store;
  }

  store = createStore(appReducer);
  return store;
};
