import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useEffect } from "react";

const sdk = new MkdSDK();

const attorney_columns = [
  {
    header: "Attorney Name",
    accessor: "attorney_name",
    isSorted: false,
    isSortedDesc: false,
    mappings: {},
  },
  {
    header: "Documents",
    isSorted: false,
    isSortedDesc: false,
    accessor: "document",
  },
];

const client_columns = [
  {
    header: "Client Name",
    accessor: "client_name",
    isSorted: false,
    isSortedDesc: false,
    mappings: {},
  },
  {
    header: "Documents",
    isSorted: false,
    isSortedDesc: false,
    accessor: "document",
  },
];

const LawFirmDashboardPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const statusRef = React.useRef(null);
  const [email, setEmail] = React.useState("");
  const [dashboardStats, setDashboardStats] = React.useState({});
  const lawFirmID = Number(localStorage.getItem("user"));
  const [attorneyData, setAttorneyData] = React.useState([]);
  const [clientData, setClientData] = React.useState([]);
  const [selectedClient, setSelectedClient] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [clients, setClients] = React.useState(false);
  const [docMonths, setDocMonths] = React.useState(1);
  const [clientMonths, setClientMonths] = React.useState(1);
  const user_id = JSON.parse(localStorage.getItem("user"));

  const schema = yup.object({});

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectStatus = [
    { value: "client", label: "Client" },
    { value: "attorney", label: "Attorney" },
    { value: "subclient", label: "Sub-Client" },
  ];

  const sendInvite = async () => {
    setInviteLoading(true);
    let subject;
    let body;
  
    try {
      const profile = await sdk.getProfile();
  
      if (!email) throw new Error("Please enter a valid email");
  
      let link;
  
      switch (status) {
        case "attorney":
          link = encodeURI(`${location.origin}/attorney/signup?invited_by=${profile.email}&getting_email=${email}&lawfirm_id=${user_id}`);
          break;
        case "client":
          link = encodeURI(`${location.origin}/client/signup?invited_by=${profile.email}&getting_email=${email}&lawfirm_id=${user_id}`);
          break;
        case "subclient":
          if (!selectedClient) {
            showToast(globalDispatch, "Select a client for subclient");
            return;
          }
          link = encodeURI(`${location.origin}/subclient/signup?invited_by=${profile.email}&client_id=${selectedClient}&getting_email=${email}`);
          break;
        default:
          console.log("status", status);
          showToast(globalDispatch, "Please select a user type");
          return;
      }
  
      body = link;
  
      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = '${status}-invite' `] },
        "POST"
      );
  
      if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
        body = emailTemplate.list[0].html.replace(new RegExp("{{{link}}}", "g"), link);
        subject = emailTemplate.list[0].subject || `Invitation to Join as a ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      } else {
        subject = `Invitation to Join as a ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      }
  
      const result = await sdk.sendMail({ email, subject, body });
  
      if (!result.error) {
        setShowModal(false);
        showToast(globalDispatch, "Invite Sent Successfully!");
      } else {
        showToast(globalDispatch, "An Error occurred while sending the invite.");
      }
    } catch (err) {
      showToast(globalDispatch, err.message);
    }
  
    setInviteLoading(false);
  };

  async function getClient(data) {
    try {
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? ` ${
                  data.user_id
                    ? `forkfirm_law_firm_client.law_firm_id=${data.user_id}`
                    : "1"
                } `
              : "1",
          ],
          page: 1,
          limit: 999999,
        },
        "VIEWCLIENTLAWFIRMS"
      );

      const { list, total, limit, num_pages, page } = result;
      console.log("clients here 2", list);
      let clientOptions = [];
      list.map((item) =>
        clientOptions.push({
          value: item.id,
          label: `${item.first_name ? item.first_name : ""} ${
            item.last_name ? item.last_name : ""
          }`,
        })
      );
      setClients(clientOptions);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const fetchAttorneys = async (months = 1) => {
    const lawFirmAttorneys = await sdk.callRestAPI(
      {
        law_firm_id: lawFirmID,
        page: 1,
        limit: 10,
        months,
        groupBy: "forkfirm_contract.attorney_id",
      },
      "LAWFIRMDATAPAGINATE"
    );

    console.log(lawFirmAttorneys, "lawFirmAttorneys");
    setDocMonths(months);
    let arr = [];
    lawFirmAttorneys.list.forEach((val) =>
      arr.push({
        attorney_name:
          val.attorney_first_name + " " + (val.attorney_last_name ?? ""),
        document: val.num_documents,
      })
    );
    setAttorneyData(arr);
  };

  const fetchClients = async (months = 1) => {
    console.log("fetching here");
    const lawFirmClients = await sdk.callRestAPI(
      {
        law_firm_id: lawFirmID,
        page: 1,
        limit: 10,
        months,
        groupBy: "forkfirm_contract.client_id",
      },
      "LAWFIRMDATAPAGINATE"
    );

    console.log("clients here one", lawFirmClients);
    setClientMonths(months);
    setClientData(
      lawFirmClients.list.map((val) => ({
        client_name: `${val.client_first_name} ${
          val.client_last_name ?? ""
        }`.trimEnd(),
        document: val.num_documents,
      }))
    );
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "lawfirm",
      },
    });
    (async function () {
      const result = await sdk.callRestAPI(
        {
          where: [],
          page: "1",
          limit: 10,
          law_firm_id: lawFirmID,
        },
        "LAWFIRMSTATS"
      );

      const { list } = result;
      console.log(result, "result");
      fetchAttorneys();
      fetchClients();
      setDashboardStats(list.result[0]);
      console.log(list.result[0]);
    })();
  }, []);

  useEffect(() => {
    getClient({ user_id });
  }, [user_id]);

  const changeHandleUser = (e) => {
    setStatus(e.value);
  };
  const changeHandleClient = (e) => {
    setSelectedClient(e.value);
  };
  return (
    <>
      <div className="w-full flex flex-col text-gray-700 ">
        {/* ROW 1 */}
        <div className="w-full flex justify-between">
          <div>My Firm</div>
          <button
            className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            onClick={() => setShowModal(true)}
          >
            Invite
          </button>
        </div>

        {showModal ? (
          <>
            <div
              style={{ zIndex: "3" }}
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            >
              <div
                style={{ width: "50%" }}
                className="relative w-auto my-6 mx-auto max-w-3xl"
              >
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                    <h3 className="text-3xl font-semibold">
                      Invite an Attorney or a Client or a Sub-Client
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      <span className="bg-transparent text-black opacity-100 h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>

                  {/*body*/}
                  <div className="relative p-6 flex-auto">
                    <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Who are you inviting?
                      </label>
                      <Select
                        onChange={changeHandleUser}
                        options={selectStatus}
                        ref={statusRef}
                      />
                      <p className="text-red-500 text-xs italic"></p>
                    </div>
                  </div>
                  {status === "subclient" && (
                    <div className="relative text-left px-6 flex-auto">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Select Client for the subclient?
                        </label>
                        <Select
                          options={clients}
                          onChange={changeHandleClient}
                        />
                        <p className="text-red-500 text-xs italic"></p>
                      </div>
                    </div>
                  )}
                  <div className="relative p-6 flex-auto">
                    <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="id"
                      >
                        Email
                      </label>
                      <input
                        placeholder=""
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                          errors.id?.message ? "border-red-500" : ""
                        }`}
                      />
                      <p className="text-red-500 text-xs italic">
                        {errors.id?.message}
                      </p>
                    </div>
                  </div>
                  {/*footer*/}
                  <div className="flex items-center p-6 border-t border-solid border-slate-200 rounded-b">
                    <button
                      className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 ease-linear transition-all duration-150 mr-4"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                    <button
                      className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-60"
                      type="button"
                      onClick={sendInvite}
                      disabled={inviteLoading}
                    >
                      Send Invitation
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="opacity-25 fixed inset-0 z-2 bg-black"
              style={{ zIndex: "1" }}
            ></div>
          </>
        ) : null}
        {/* END OF ROW 1 */}

        {/* ROW 2 */}
        <div className="flex justify-between gap-16 mt-8">
          {Object.keys(dashboardStats).length ? (
            <>
              <div className="flex flex-col basis-1/3 border p-6 pr-10 shadow text-center">
                <div className="">Current Invoice</div>
                <div className="text-3xl justify-center mt-4 mx-auto font-semibold text-center w-1/2">
                  ${dashboardStats.payout_amount ?? 0}
                </div>
              </div>
              <div className="flex flex-col basis-1/3 border p-6 pr-10 shadow  text-center">
                <div className="">Current Documents</div>
                <div className="text-3xl justify-center mt-4 mx-auto font-semibold text-center w-1/2">
                  {dashboardStats.num_documents ?? 0}
                </div>
              </div>
              <div className="flex flex-col basis-1/3 border p-6 pr-10 shadow  text-center">
                <div className="">Contract Hours</div>
                <div className="text-3xl justify-center mt-4 mx-auto font-semibold text-center w-1/2">
                  {dashboardStats.num_contract_hours ?? 0}
                </div>
              </div>
              <div className="flex flex-col basis-1/3 border p-6 pr-10 shadow  text-center">
                <div className="">Other Hours</div>
                <div className="text-3xl justify-center mt-4 mx-auto font-semibold text-center w-1/2">
                  {dashboardStats.num_hours ?? 0}
                </div>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
        {/* END OF ROW 2 */}

        {/* ROW 3 */}
        <div className="mt-16">
          <div className="flex flex-row justify-between">
            <h3>Attorneys</h3>
            <div className="flex">
              <div>
                <button
                  className={`border shadow px-2 hover:bg-gray-200 active:bg-gray-300 ${
                    docMonths == 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => fetchAttorneys(1)}
                >
                  1m
                </button>
                <button
                  className={`border shadow px-2 hover:bg-gray-200 active:bg-gray-300 ${
                    docMonths == 3
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => fetchAttorneys(3)}
                >
                  3m
                </button>
                <button
                  className={`border shadow px-2 hover:bg-gray-200 active:bg-gray-300 ${
                    docMonths == 12
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => fetchAttorneys(12)}
                >
                  1y
                </button>
              </div>
            </div>
          </div>

          <div className="shadow overflow-x-auto border-b border-gray-200 mt-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {attorney_columns.map((column, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
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
                {attorneyData.map((row, i) => {
                  return (
                    <tr key={i}>
                      {attorney_columns.map((cell, index) => {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row[cell.accessor]}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* END OF ROW 3 */}

        {/* ROW 4 */}
        <div className="mt-16">
          <div className="flex flex-row justify-between">
            <h3>Clients</h3>
            <div className="flex">
              <div>
                <button
                  className={`border shadow px-2 hover:bg-gray-200 active:bg-gray-300 ${
                    clientMonths == 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => fetchClients(1)}
                >
                  1m
                </button>
                <button
                  className={`border shadow px-2 hover:bg-gray-200 active:bg-gray-300 ${
                    clientMonths == 3
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => fetchClients(3)}
                >
                  3m
                </button>
                <button
                  className={`border shadow px-2 hover:bg-gray-200 active:bg-gray-300 ${
                    clientMonths == 12
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => fetchClients(12)}
                >
                  1y
                </button>
              </div>
            </div>
          </div>

          <div className="shadow overflow-x-auto border-b border-gray-200 mt-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {client_columns.map((column, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
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
                {clientData.map((row, i) => {
                  return (
                    <tr key={i}>
                      {client_columns.map((cell, index) => {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row[cell.accessor]}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* END OF ROW 4 */}
      </div>
    </>
  );
};

export default LawFirmDashboardPage;
