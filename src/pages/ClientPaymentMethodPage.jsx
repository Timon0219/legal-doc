import React, { useState } from "react";
import { useEffect } from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import AddButton from "../components/AddButton";
import AddCardMethodModal from "../components/AddCardMethodModal";
import { GlobalContext, showToast } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Full Name",
    accessor: "full_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Expiry Date",
    accessor: "expiry_date",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Card Type",
    accessor: "card_type",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
  },
];

const ClientPaymentMethodPage = () => {
  const { state, dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentData, setCurrentTableData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const user_id = localStorage.getItem("user");
  const [clientId, setClientId] = useState(0);

  async function getClientId() {
    if (localStorage.getItem("role") == "client") {
      setClientId(user_id);
      return;
    }
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/admin/client/subclient`,
        {
          where: [`subclient.id=${user_id}`],
          page: 1,
          limit: 1,
        },
        "POST"
      );
      if (Array.isArray(result.list) && result.list.length > 0) {
        setClientId(result.list[0].client_id);
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  async function getData() {
    setLoading(true);
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/get-cards/${clientId}`,
        undefined,
        "GET"
      );

      console.log(result);
      const { data } = result;
      if (Array.isArray(data?.data)) {
        setCurrentTableData(data.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("ERROR", error);
      // tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "payment_method",
      },
    });

    getClientId();
  }, []);

  useEffect(() => {
    if (clientId) {
      getData();
    }
  }, [clientId]);

  const removeHandle = async (id) => {
    setLoading(true);
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/card/${clientId}/${id}`,
        {},
        "DELETE"
      );
      console.log(result);
      if (result.isDeleted) {
        showToast(globalDispatch, result.message);
        await getData();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  const make_default = async (token) => {
    setLoading(true);
    try {
      const result = await sdk.callRawAPI(
        "/v2/api/forkfirm/set-default",
        { userId: clientId, cardId: token },
        "PUT"
      );
      console.log(result);
      if (!result.error) {
        showToast(globalDispatch, result.message);
        await getData();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  return (
    <>
      <div className="p-5 bg-white shadow rounded mb-10">
        {/* <h4 className="text-2xl font-semibold mb-5 ">Payment Method</h4>{" "} */}
        <div className="flex justify-between">
          <div className="mb-3 text-center items-center w-full flex  ">
            <h4 className="text-2xl font-medium">Payment Method</h4>
            <p className="ml-7 relative before:contents-[''] before:bg-[#39058d] before:h-3 before:w-3 before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-14%] before:z-[5] after:contents-[''] after:bg-[#39058d68] after:h-3 after:w-3 after:absolute after:top-1/2 after:-translate-y-[15%] after:z-[2] after:left-[-12%] capitalize ">
              <span className="ml-2 font-semibold">Default Card</span>
            </p>
          </div>
          <div className="">
            <AddButton setShowModal={setShowModal} />
            {showModal ? (
              <AddCardMethodModal
                getData={getData}
                setShowModal={setShowModal}
              />
            ) : null}
          </div>
        </div>
        <div className="shadow min-w-full border-b border-gray-200 ">
          <div className="overflow-x-auto min-w-full block w-full max-w-[1029px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      onClick={() => onSort(i)}
                    >
                      {column.header}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " ▼"
                            : " ▲"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!loading &&
                  currentData?.length > 0 &&
                  currentData?.map((item, i) => (
                    <tr
                      key={i}
                      className={
                        item.id === item.customer.default_source
                          ? `bg-[#39058d] text-white `
                          : "bg-white"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.name ? item.name : "Test Card"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.exp_month + "/" + item.exp_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.funding}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-3">
                          {item.id !== item.customer.default_source ? (
                            <>
                              <button
                                className="text-sm text-[#4a5fe6] underline hover:text-purple-500 duration-100"
                                onClick={() => removeHandle(item.id)}
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => make_default(item.id)}
                                className="text-sm text-[#4a5fe6] underline hover:text-purple-500 duration-100"
                              >
                                Make It Default
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="text-sm text-[#ffffff] underline hover:text-purple-500 duration-100"
                                onClick={() => removeHandle(item.id)}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!loading && currentData.length === 0 && (
              <>
                <p className=" capitalize px-10 py-3 text-xl ">
                  You Don't have any card
                </p>
              </>
            )}
            {loading && (
              <p className=" capitalize px-10 py-3 text-xl ">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientPaymentMethodPage;
