import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";
import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { getNonNullValue } from "../utils/utils";
import Select from "react-select";

const columns = [
  {
    header: "Lawfirm ID",
    accessor: "lawfirm_id",
    isSorted: true,
    isSortedDesc: true,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Firm Name",
    isSorted: false,
    isSortedDesc: false,
    accessor: "lawfirm_name",
  },

  {
    header: "Revenue Generated (Per Month)",
    accessor: "monthly_revenue",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Date",
    accessor: "date",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Total Revenue Generated",
    accessor: "total_revenue",
    isSorted: false,
    isSortedDesc: false,
  },
];

let sdk = new MkdSDK();

const AdminDashboardPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [dashboardStats, setDashboardStats] = React.useState({});
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [tableData, setTableData] = React.useState([]);
  const [date, setDate] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const statusRef = React.useRef(null);
  const [email, setEmail] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedClient, setSelectedClient] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const [clients, setClients] = React.useState(false);
  const schema = yup.object({
    law_firm_id: yup.number().positive().integer(),
    attorney_id: yup.number().positive().integer(),
  });
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function onSort(columnIndex) {
    if (columns[columnIndex].isSorted) {
      columns[columnIndex].isSortedDesc = !columns[columnIndex].isSortedDesc;
    } else {
      columns.map((i) => (i.isSorted = false));
      columns.map((i) => (i.isSortedDesc = false));
      columns[columnIndex].isSorted = true;
    }

    (async function () {
      await getData(0, pageSize);
    })();
  }

  async function getData(data) {
    try {
      let sortField = columns.filter((col) => col.isSorted);
      if (!data) {
        sdk.setTable("dashboard");
        const result = await sdk.callRestAPI({}, "PAGINATE");

        const { list } = result;

        console.log("DASHBOARD STATS", list);
        setDashboardStats(list);
      }

      const revenueResult = await sdk.callRestAPI(
        {
          where: [],
          page: "1",
          limit: 10,
          sortId: "lawfirm_id, date",
          groupBy:
            "lawfirm.id, DATE_FORMAT(forkfirm_contract.create_at, '%Y-%M')",
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
        },
        "REVENUE"
      );
      //  data
      //       ? `${
      //           data.firm_name
      //             ? `lawfirm_name LIKE '%${data.firm_name}%'`
      //             : "1"
      //         } AND ${data.duration ? `date LIKE '%${data.duration}%'` : "1"}`
      //       : "(date IS NOT NULL AND total_revenue IS NOT NULL)",

      const { list: revenueList } = revenueResult;
      setTableData(revenueList);
      console.log(revenueList, "revenueList");
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const selectStatus = [
    { value: "client", label: "Client" },
    { value: "attorney", label: "Attorney" },
    { value: "lawfirm", label: "Law Firm" },
    { value: "subclient", label: "Sub-Client" },
  ];

  const onSubmit = (data) => {
    let duration = getNonNullValue(date);
    let firm_name = getNonNullValue(data.firm_name);
    if (duration) {
      if (duration.year) {
        duration = `${duration.month.number}/${duration.year}`;
      }
    }
    let filter = {
      firm_name,
      duration,
    };
    getData(filter);
  };

  const sendInvite = async () => {
    setInviteLoading(true);

    try {
      if (!email) throw new Error("Please enter a valid email");
      let link;
      let subject;

      const adminProfile = await sdk.getProfile();

      switch (status) {
        case "attorney":
          link = encodeURI(
            `${location.origin}/attorney/signup?invited_by=${adminProfile.email}&getting_email=${email}`
          );
          subject = "Invitation to Join as an Attorney";
          break;
        case "client":
          link = encodeURI(
            `${location.origin}/client/signup?invited_by=${adminProfile.email}&getting_email=${email}`
          );
          subject = "Invitation to Join as a Client";
          break;
        case "subclient":
          if (!selectedClient) {
            showToast(globalDispatch, "Select a client for subclient");
            return;
          }
          link = encodeURI(
            `${location.origin}/subclient/signup?invited_by=${adminProfile.email}&client_id=${selectedClient}&getting_email=${email}`
          );
          subject = "Invitation to Join as a Subclient";
          break;
        case "lawfirm":
          link = encodeURI(
            `${location.origin}/lawfirm/signup?invited_by=${adminProfile.email}&getting_email=${email}`
          );
          subject = "Invitation to Join as a Law Firm";
          break;
        default:
          showToast(globalDispatch, "Please select a user type");
          return;
      }

      let body = link;

      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = '${status}-invite' `] },
        "POST"
      );

      if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
        body = emailTemplate.list[0].html.replace(
          new RegExp("{{{link}}}", "g"),
          link
        );
        subject = emailTemplate.list[0].subject || subject; // Use custom subject if available
      }

      const result = await sdk.sendMail({ email, subject, body });

      if (result.error) throw new Error(result.message || "An Error occurred");
      setShowModal(false);
      showToast(globalDispatch, "Invite Sent Successfully!");
      setInviteLoading(false);
      setEmail("");
    } catch (err) {
      showToast(globalDispatch, err.message);
    }

    setInviteLoading(false);
  };

  async function getClient(pageNum, limitNum, data) {
    try {
      sdk.setTable("user");
      const clientResult = await sdk.callRestAPI(
        { customWhere: "role like 'client'" },
        "GETALL"
      );

      if (!clientResult.error) {
        let arr = [];
        clientResult.list.forEach((val) =>
          arr.push({
            value: val.id,
            label:
              (val["first_name"] ? val["first_name"] : "") +
              " " +
              (val["last_name"] ? val["last_name"] : ""),
          })
        );
        setClients(arr);
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "admin",
      },
    });

    (async function () {
      await getData();
      await getClient();
    })();
  }, []);
  const changeHandleUser = (e) => {
    setStatus(e.value);
  };
  const changeHandleClient = (e) => {
    setSelectedClient(e.value);
  };

  return (
    <>
      <h4 className="text-2xl font-medium">Dashboard</h4>
      <div className="flex justify-between">
        <h4 className="text-2xl font-medium mt-4">Stats</h4>
        <button
          className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          onClick={() => setShowModal(true)}
        >
          Invite
        </button>
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
                    <h3 className="text-3xl font-semibold">Invite Users</h3>
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
                        type={email}
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
      </div>

      <div className="flex justify-between font-bold mt-4 mb-10">
        {Object.keys(dashboardStats).length ? (
          <>
            <div className="p-5 bg-white shadow rounded flex-col items-center text-center">
              <h4>Registered Law Firms</h4>
              {dashboardStats["userStats"] && (
                <span className="text-2xl mt-4">
                  {/* {dashboardStats["userStats"].length > 0
                    ? dashboardStats["userStats"][3] &&
                      dashboardStats["userStats"][3].count
                    : ""} */}
                  {dashboardStats["userStats"]?.find(
                    (stat) => stat.role === "lawfirm"
                  )?.count || ""}
                </span>
              )}
            </div>
            <div className="p-5 bg-white shadow rounded flex-col items-center text-center">
              <h4>Registered Attorneys</h4>
              {dashboardStats["userStats"] && (
                <span className="text-2xl mt-4">
                  {/* {dashboardStats["userStats"].length > 0
                    ? dashboardStats["userStats"][1] &&
                      dashboardStats["userStats"][1].count
                    : " "} */}
                  {dashboardStats["userStats"]?.find(
                    (stat) => stat.role === "attorney"
                  )?.count || ""}
                </span>
              )}
            </div>
            <div className="p-5 bg-white shadow rounded flex-col items-center text-center">
              <h4>Current Month Revenue</h4>
              <span className="mt-4 text-2xl">
                $
                {Number(dashboardStats["current_month_revenue"]).toFixed(2) ||
                  0}
              </span>
            </div>
            <div className="p-5 bg-white shadow rounded flex-col items-center text-center">
              <h4>Total Revenue Generated</h4>
              <span className="text-2xl mt-4">
                ${Number(dashboardStats["total_revenue"]).toFixed(2)}
              </span>
            </div>
            <div className="p-5 bg-white shadow rounded flex-col items-center text-center">
              <h4>Total Fork Fee</h4>
              <span className="mt-4 text-2xl">
                ${Number(dashboardStats["total_fork_fee"]).toFixed(2)}
              </span>
            </div>
            <div className="p-5 bg-white shadow rounded flex-col items-center text-center">
              <h4>Current Month Fork Fee</h4>
              <span className="text-2xl mt-4">
                $
                {Number(dashboardStats["current_month_fork_fee"]).toFixed(2) ||
                  0}
              </span>
            </div>
          </>
        ) : (
          ""
        )}
      </div>

      <form
        className="p-5 bg-white shadow rounded mt-4 mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="max-w-5xl w-full flex flex-wrap">
            <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="id"
              >
                Firm Name
              </label>
              <input
                placeholder=""
                {...register("firm_name")}
                className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.firm_name?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-red-500 text-xs italic">
                {errors.firm_name?.message}
              </p>
            </div>

            <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="id"
              >
                Date
              </label>

              <DatePicker
                value={date}
                format="MM/YYYY"
                containerClassName="w-full"
                onChange={setDate}
                render={
                  <InputIcon className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                }
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Filter
        </button>
        <button
          type="reset"
          onClick={async () => {
            setDate("");
            reset();
            await getData();
          }}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Reset
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded mt-4">
        <h4 className="text-2xl font-medium">Revenue</h4>
        <div className="mb-3 text-center justify-between w-full flex  "></div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
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
              {tableData.map((row, i) => {
                if (row["lawfirm_id"] != null) {
                  return (
                    <tr key={i}>
                      {columns.map((cell, index) => {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row[cell.accessor] ? row[cell.accessor] : "N/A"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
