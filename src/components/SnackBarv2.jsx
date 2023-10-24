import React from "react";
import { GlobalContext } from "../globalContext";
export default function SnackBarV2() {
  const { state, dispatch } = React.useContext(GlobalContext);

  if (state.globalMessage.length <= 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center"
      onClick={() => {
        dispatch({ type: "SNACKBAR", payload: { message: "", type: "" } });
      }}
    >
      <div
        className="w-full max-w-md transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3
            className={`text-lg font-medium leading-6 ${
              state.globalMessageType == "ERROR"
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {state.globalMessageType == "ERROR" ? "Error" : "Notification"}
          </h3>
          <button
            type="button"
            className="bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white  dark:hover:bg-gray-700"
            aria-label="Close"
            onClick={() => {
              dispatch({
                type: "SNACKBAR",
                payload: { message: "", type: "" },
              });
            }}
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div className="mt-2">
          <p
            className={
              state.globalMessageType == "ERROR"
                ? "text-red-500"
                : "text-gray-500"
            }
          >
            {state.globalMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
