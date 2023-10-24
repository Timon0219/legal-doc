import React from "react";
import { AuthContext } from "../authContext";
import { NavLink } from "react-router-dom";
import { GlobalContext } from "../globalContext";
export const AttorneyHeader = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { state } = React.useContext(GlobalContext);

  return (
    <>
      <div
        className={`relative bg-[#151515]  text-[#fff] z-[2] transition-all duration-200 ease-in-out min-h-screen overflow-hidden w-full ${
          !state.isOpen ? "open-nav" : ""
        }`}
      >
        <div className="sticky top-0 h-fit">
          <div className="w-full p-4 bg-sky-500">
            <div className="text-white font-bold text-center text-2xl">
              Attorney
            </div>
          </div>
          <div className="w-full sidebar-list">
            <ul className="flex flex-wrap">
              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/pending_contracts"
                  className={`${
                    state.path == "pending_contracts"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Pending Contracts
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/executed_contracts"
                  className={`${
                    state.path == "executed_contracts"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Executed Contracts
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/add_hours"
                  className={`${
                    state.path == "add_hours" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Add Hours
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/client"
                  className={`${
                    state.path == "client" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Client
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/projects"
                  className={`${
                    state.path == "projects" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Projects
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/upload_document"
                  className={`${
                    state.path == "upload_document"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Upload Document
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/documents"
                  className={`${
                    state.path == "documents" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Documents
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/profile"
                  className={`${
                    state.path == "profile" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Profile
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/attorney/login"
                  onClick={() =>
                    dispatch({
                      type: "LOGOUT",
                    })
                  }
                >
                  Logout
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttorneyHeader;
