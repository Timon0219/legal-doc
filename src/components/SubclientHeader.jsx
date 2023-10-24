import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import { NavLink } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { useEffect } from "react";
import MkdSDK from "../utils/MkdSDK";

let sdk = new MkdSDK();

export const SubclientHeader = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { state } = React.useContext(GlobalContext);
  const [data, setCurrentTableData] = React.useState([]);
  const user_id = JSON.parse(localStorage.getItem("user"));

  async function getData() {
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/admin/client/subclient`,
        {
          where: [`subclient.id  = ${user_id}`],
          groupBy: `subclient.id`,
          page: 1,
          limit: 10,
        },
        "POST"
      );

      const { list } = result;
      console.log("CLIENT HEADER DATA", list, list[0].show_billing);
      setCurrentTableData(list.filter((item) => item.id === user_id));
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  useEffect(() => {
    getData();
  }, [user_id]);

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
              Sub-client
            </div>
          </div>
          <div className="w-full sidebar-list">
            <ul className="flex flex-wrap">
              <li className="list-none block w-full">
                <NavLink
                  to="/subclient"
                  className={`${
                    state.path == "subclient" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Dashboard
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/subclient/executed_contracts"
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
                  to="/subclient/pending_contracts"
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
                  to="/subclient/document_upload"
                  className={`${
                    state.path == "document_upload"
                      ? "text-black bg-gray-200"
                      : ""
                  }`}
                >
                  Upload Document
                </NavLink>
              </li>
              {data.length > 0 && data[0].show_billing === 1 && (
                <>
                  <li className="list-none block w-full">
                    <NavLink
                      to="/subclient/billing"
                      className={`${
                        state.path == "billing" ? "text-black bg-gray-200" : ""
                      }`}
                    >
                      Billing
                    </NavLink>
                  </li>

                  <li className="list-none block w-full">
                    <NavLink
                      to="/subclient/payment_method"
                      className={`${
                        state.path == "payment_method"
                          ? "text-black bg-gray-200"
                          : ""
                      }`}
                    >
                      Payment Method
                    </NavLink>
                  </li>
                </>
              )}

              <li className="list-none block w-full">
                <NavLink
                  to="/subclient/profile"
                  className={`${
                    state.path == "profile" ? "text-black bg-gray-200" : ""
                  }`}
                >
                  Profile
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/subclient/login"
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

export default SubclientHeader;
