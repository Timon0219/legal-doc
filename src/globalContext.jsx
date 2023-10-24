import React, { useReducer } from "react";
export const GlobalContext = React.createContext();

const initialState = {
  globalMessage: "",
  globalMessageType: "",
  isOpen: true,
  path: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SNACKBAR":
      return {
        ...state,
        globalMessage: action.payload.message,
        globalMessageType: action.payload.type,
      };
    case "SETPATH":
      return {
        ...state,
        path: action.payload.path,
      };
    case "OPEN_SIDEBAR":
      return {
        ...state,
        isOpen: action.payload.isOpen,
      };

    default:
      return state;
  }
};

export const showToast = (dispatch, message, timeout = 3000, type) => {
  dispatch({
    type: "SNACKBAR",
    payload: {
      message,
      type,
    },
  });

  setTimeout(() => {
    dispatch({
      type: "SNACKBAR",
      payload: {
        message: "",
        type: "",
      },
    });
  }, timeout);
};
export const showToastModal = (dispatch, message, type) => {
  dispatch({
    type: "SNACKBAR",
    payload: {
      message,
      type,
    },
  });

  setTimeout(() => {
    dispatch({
      type: "SNACKBAR",
      payload: {
        message: "",
        type: "",
      },
    });
  }, 5000);
};

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // React.useEffect(() => {

  // }, []);

  return (
    <GlobalContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
