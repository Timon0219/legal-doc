import React from "react";
import { AuthContext } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import Select from "react-select";
import { useRef } from "react";

let sdk = new MkdSDK();

const columns = [
  {
    header: "ID",
    accessor: "id",
    isSorted: true,
    isSortedDesc: true,
  },
  {
    header: "Action",
    accessor: "",
  },
  {
    header: "Name",
    accessor: "name",
  },
  {
    header: "Associated Client",
    accessor: "associated_client",
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "inactive", 1: "active" },
  },
  {
    header: "Email",
    accessor: "email",
  },
];

const LawFirmSubClientListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const [showModal, setShowModal] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [isSorted, setIsSorted] = React.useState(false);
  const [clients, setClients] = React.useState([]);
  const [selectedClient, setSelectedClient] = React.useState(false);
  const navigate = useNavigate();
  const clientRef = useRef(null);

  const schema = yup.object({});
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
    if (columns[columnIndex].accessor !== "status") {
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
    } else {
      let cloneData = [...data];
      cloneData = cloneData.sort((a, b) => {
        if (!isSorted) {
          return b.status - a.status;
        }
        return a.status - b.status;
      });
      setIsSorted(!isSorted);
      setCurrentTableData(cloneData);
    }
  }

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(0, limit);
    })();
  }

  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize);
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize
      );
    })();
  }

  async function getData(pageNum, limitNum, data) {
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/admin/client/subclient`,
        {
          where: [
            ` forkfirm_law_firm_client.law_firm_id = ${user_id} AND ${
              data
                ? `${
                    data.associated_client
                      ? `client.id=${data.associated_client}`
                      : "1"
                  } AND ${
                    data.first_name
                      ? `subclient.first_name LIKE '%${data.first_name}%' `
                      : "1"
                  } AND  ${
                    data.last_name
                      ? `subclient.last_name LIKE '%${data.last_name}%' `
                      : "1"
                  } AND ${data.email ? `subclient.email='${data.email}'` : "1"}`
                : "1"
            }`,
          ],
          groupBy: "subclient.id",
          page: 1,
          limit: 10,
        },
        "POST"
      );
      const { list, total, limit, num_pages, page } = result;

      console.log("list", list);

      setCurrentTableData(list);
      // setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    let first_name = getNonNullValue(data.first_name);
    let last_name = getNonNullValue(data.last_name);
    let email = getNonNullValue(data.email);
    let associated_client;
    if (clientRef.current.getValue().length) {
      associated_client = clientRef.current.getValue()[0].value;
    }

    let filter = {
      email,
      associated_client,
      first_name,
      last_name,
    };
    getData(1, pageSize, filter);
  };

  const sendInvite = async () => {
    setInviteLoading(true);
    const userProfile = await sdk.getProfile();
    let subject;
    let body;
  
    if (selectedClient) {
      body = encodeURI(
        `${location.origin}/subclient/signup?invited_by=${userProfile.email}&client_id=${selectedClient}&lawfirm_id=${user_id}&getting_email=${email}`
      );
  
      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = 'subclient-invite'`] },
        "POST"
      );
  
      if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
        body = emailTemplate.list[0].html.replace(new RegExp("{{{link}}}", "g"), body);
        subject = emailTemplate.list[0].subject || "Invitation to Join as a Subclient";
      } else {
        subject = "Invitation to Join as a Subclient";
      }
  
      const result = await sdk.sendMail({ email, subject, body });
  
      if (!result.error) {
        setShowModal(false);
        showToast(globalDispatch, "Invite Sent Successfully!");
      } else {
        showToast(globalDispatch, "An Error occurred while sending the invite.");
      }
    } else {
      showToast(globalDispatch, "Select a client for subclient");
    }
  
    setInviteLoading(false);
  };

  async function getClient() {
    try {
      sdk.setTable("user");
      const result = await sdk.callRestAPI(
        {
          where: [`forkfirm_law_firm_client.law_firm_id=${user_id}`],
          page: 1,
          limit: 100000,
        },
        "VIEWCLIENTLAWFIRMS"
      );

      if (result.error) throw new Error(result.message);

      if (Array.isArray(result.list)) {
        setClients(
          result.list.map((client) => ({
            label: `${client.first_name ?? ""} ${client.last_name ?? ""}`,
            value: client.id,
          }))
        );
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
        path: "subclient",
      },
    });

    (async function () {
      await getData(1, pageSize);
      getClient(1, pageSize);
    })();
  }, []);

  const changeHandleClient = (e) => {
    setSelectedClient(e.value);
  };

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Sub-Clients</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="first_name"
            >
              First Name
            </label>
            <input
              placeholder="First Name"
              {...register("first_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.first_name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.first_name?.message}
            </p>
          </div>
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="last_name"
            >
              Last Name
            </label>
            <input
              placeholder="Last Name"
              {...register("last_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.last_name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.last_name?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              placeholder="Email"
              type="email"
              {...register("email")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.email?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.email?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="associated_client"
            >
              Associated Client
            </label>
            <Select options={clients} ref={clientRef} />

            <p className="text-red-500 text-xs italic">
              {errors.associated_client?.message}
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Search
        </button>
        <button
          type="reset"
          onClick={async () => {
            clientRef.current.setValue();
            await getData(1, pageSize);
            reset();
          }}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Reset
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Sub-Clients</h4>
          {/* <AddButton link={"/admin/add-client"} /> */}
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
                      <h3 className="text-3xl font-semibold">
                        Invite A SubClient
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
                    {/* <div className="relative p-6 flex-auto">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Who are you inviting?
                        </label>
                        <Select options={selectStatus} ref={statusRef} />
                        <p className="text-red-500 text-xs italic"></p>
                      </div>
                    </div> */}
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
                    <div className="relative p-6 flex-auto">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label
                          className="block text-gray-700 text-sm font-bold mb-2 text-left"
                          htmlFor="id"
                        >
                          Email
                        </label>
                        <input
                          placeholder=""
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
                        className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mr-4"
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
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
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
              {data.map((row, i) => {
                return (
                  <tr key={i}>
                    {columns.map((cell, index) => {
                      if (cell.accessor == "") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <button
                              className="text-xs ml-2"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/lawfirm/edit-subclient/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              Edit
                            </button>
                          </td>
                        );
                      }

                      if (cell.accessor === "name") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {(row["first_name"] ? row["first_name"] : "") +
                              " " +
                              (row["last_name"] ? row["last_name"] : "")}
                          </td>
                        );
                      }
                      if (cell.accessor === "associated_client") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {(row["client_first_name"]
                              ? row["client_first_name"]
                              : "") +
                              " " +
                              (row["client_last_name"]
                                ? row["client_last_name"]
                                : "")}
                          </td>
                        );
                      }
                      if (cell.mappingExist) {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap capitalize"
                          >
                            {cell.mappings[row[cell.accessor]]}
                          </td>
                        );
                      }
                      return (
                        <td key={index} className="px-6 py-4 whitespace-nowrap">
                          {row[cell.accessor] ? row[cell.accessor] : "N/A"}
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
      <PaginationBar
        currentPage={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        updatePageSize={updatePageSize}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </>
  );
};

export default LawFirmSubClientListPage;
