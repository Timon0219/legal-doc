import React from "react";
import { AuthContext } from "../authContext";
import { NavLink } from "react-router-dom";
import { GlobalContext } from "../globalContext";
export const AdminHeader = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { state } = React.useContext(GlobalContext);
  // sidebar-holder
  return (
    <>
      <div
        className={` relative bg-[#151515]  text-[#fff] z-[2] transition-all duration-200 ease-in-out min-h-screen overflow-hidden w-full ${
          !state.isOpen ? "open-nav" : ""
        }`}
      >
        <div className="sticky top-0 h-fit">
          <div className="w-full p-4 bg-sky-500">
            <div className="text-white font-bold text-center text-2xl">
              Admin
            </div>
          </div>
          <div className="w-full sidebar-list">
            <ul className="flex flex-wrap">
              <li className="list-none block w-full">
                <NavLink
                  to="/admin/dashboard"
                  className={`${
                    state.path == "admin" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Dashboard
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/law_firm"
                  className={`${
                    state.path == "law_firm" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Law Firms
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/attorney"
                  className={`${
                    state.path == "attorney" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Attorneys
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/client"
                  className={`${
                    state.path == "client" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Clients
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/subclient"
                  className={`${
                    state.path == "subclient" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Sub-Clients
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/invoice"
                  className={`${
                    state.path == "invoice" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Invoices
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/documents"
                  className={`${
                    state.path == "documents" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Documents
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/doc_type"
                  className={`${
                    state.path == "doc_type" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Doc Types
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/tag"
                  className={`${
                    state.path == "tag" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Tags
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/email"
                  className={`${
                    state.path == "email" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Emails
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/user"
                  className={`${
                    state.path == "user" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Users
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/custom-reporting"
                  className={`${
                    state.path == "custom_reporting"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Reports
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/admin/profile"
                  className={`${
                    state.path == "profile" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Profile
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/admin/login"
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

export default AdminHeader;
