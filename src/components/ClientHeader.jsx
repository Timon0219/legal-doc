import React from "react";
import { AuthContext } from "../authContext";
import { NavLink } from "react-router-dom";
import { GlobalContext } from "../globalContext";
export const ClientHeader = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { state } = React.useContext(GlobalContext);

  return (
    <>
      <div className={`relative bg-[#151515]  text-[#fff] z-[2] transition-all duration-200 ease-in-out min-h-screen overflow-hidden w-full${!state.isOpen ? "open-nav" : ""}`}>
        <div className="sticky top-0 h-fit">
          <div className="w-full p-4 bg-sky-500">
            <div className="text-white font-bold text-center text-2xl">
              Client
            </div>
          </div>
          <div className="w-full sidebar-list">
            <ul className="flex flex-wrap">
              <li className="list-none block w-full">
                <NavLink
                  to="/client/dashboard"
                  className={`${
                    state.path == "client" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Dashboard
                </NavLink>
              </li>

              {/* <li className="list-none block w-full">
                <NavLink
                  to="/client/client_hours"
                  className={`${
                    state.path == "client_hours" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Client Hours
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/law_firm_attorney"
                  className={`${
                    state.path == "law_firm_attorney"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Law Firm Attorney
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/contract_document_hours"
                  className={`${
                    state.path == "contract_document_hours"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Contract Document Hours
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/contract"
                  className={`${
                    state.path == "contract" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Contract
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/activity_log"
                  className={`${
                    state.path == "activity_log" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Activity Log
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/law_firm_client"
                  className={`${
                    state.path == "law_firm_client"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Law Firm Client
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/invoice_cronjob"
                  className={`${
                    state.path == "invoice_cronjob"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Invoice Cronjob
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/invoice"
                  className={`${
                    state.path == "invoice" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Invoice
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/project"
                  className={`${
                    state.path == "project" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Project
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/client_rate"
                  className={`${
                    state.path == "client_rate" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Client Rate
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/doc_type"
                  className={`${
                    state.path == "doc_type" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Doc Type
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/contract_tag"
                  className={`${
                    state.path == "contract_tag" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Contract Tag
                </NavLink>
              </li> */}

              <li className="list-none block w-full">
                <NavLink
                  to="/client/executed_contracts"
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
                  to="/client/pending_contracts"
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
                  to="/client/document_upload"
                  className={`${
                    state.path == "document_upload"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Upload Document
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/billing"
                  className={`${
                    state.path == "billing" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Billing
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/client/payment_method"
                  className={`${
                    state.path == "payment_method"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Payment Method
                </NavLink>
              </li>

              {/* <li className="list-none block w-full">
                <NavLink
                  to="/client/email_template"
                  className={`${
                    state.path == "email_template"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Email Template
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/client/tag"
                  className={`${
                    state.path == "tag" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Tag
                </NavLink>
              </li> */}

              <li className="list-none block w-full">
                <NavLink
                  to="/client/profile"
                  className={`${
                    state.path == "profile" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Profile
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/client/login"
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

export default ClientHeader;
