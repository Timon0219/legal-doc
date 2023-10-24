import React from "react";
import { GlobalContext } from "../globalContext";
const TopHeader = () => {
  const { state, dispatch } = React.useContext(GlobalContext);
  let { isOpen } = state;
  let toggleOpen = (open) =>
    dispatch({
      type: "OPEN_SIDEBAR",
      payload: { isOpen: open },
    });
  return (
    <div className="page-header shadow flex items-center">
      <span onClick={() => toggleOpen(!isOpen)}>
        {!isOpen ? (
          <svg
            className="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          <svg
            className="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </span>
      {!window.location.pathname.includes("dashboard") && (
        <button
          className="ml-6 pointer block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => history.back()}
        >
          Back
        </button>
      )}
    </div>
  );
};

export default TopHeader;
