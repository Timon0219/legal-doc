import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
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
    header: "Email",
    accessor: "email",
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "inactive", 1: "active" },
  },
];

const AdminSubClientListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [isSorted, setIsSorted] = React.useState(false);
  const [clients, setClients] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const navigate = useNavigate();
  const clientRef = useRef(null);

  const schema = yup.object({
    // name: yup.string().optional(),
    first_name: yup.string().optional(),
    last_name: yup.string().optional(),
    email: yup.string().email().optional(),
    associated_client: yup.string().optional(),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function onSort(columnIndex) {
    console.log(columns[columnIndex]);
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
      console.log(cloneData);
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
    console.log(data);
    try {
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.getSubClients({
        where: [
          data
            ? `${
                data.first_name
                  ? `subclient.first_name LIKE '%${data.first_name}%'`
                  : "1"
              } AND ${
                data.last_name
                  ? `subclient.last_name LIKE '%${data.last_name}%'`
                  : "1"
              }
                AND ${
                  data.email ? `subclient.email LIKE '%${data.email}%'` : "1"
                } AND ${
                data.client_first_name
                  ? `client.first_name LIKE '%${data.client_first_name}%'`
                  : "1"
              } AND ${
                data.client_last_name
                  ? `client.last_name LIKE '%${data.client_last_name}%'`
                  : "1"
              }`
            : 1,
        ],
        sortId: sortField.length ? sortField[0].accessor : "",
        direction: sortField.length
          ? sortField[0].isSortedDesc
            ? "DESC"
            : "ASC"
          : "",
        limit: limitNum,
        page: pageNum,
      });

      const { list, total, limit, num_pages, page } = result;
      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);

      sdk.setTable("user");
      const clientResult = await sdk.callRestAPI(
        { customWhere: "role like 'client'" },
        "GETALL"
      );
      console.log(clientResult);
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
      if (Array.isArray(result.list)) {
        setClients(
          clientResult.list.map((client) => ({
            value: client.id,
            label: (client.first_name || "") + " " + (client.last_name || ""),
          }))
        );
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    // let subclient_name = getNonNullValue(data.name);
    let first_name = getNonNullValue(data.first_name);
    let last_name = getNonNullValue(data.last_name);
    let email = getNonNullValue(data.email);
    let associated_client;
    if (clientRef.current.getValue().length) {
      associated_client = clientRef.current.getValue()[0].label;
    }

    // if (subclient_name) {
    //   subclient_name = subclient_name.split(" ");
    // }

    if (associated_client) {
      associated_client = associated_client.split(" ");
    }

    let filter = {
      email,
      first_name: first_name,
      last_name: last_name,
    };
    // if (subclient_name && subclient_name.length) {
    //   filter.first_name = subclient_name[0];
    //   filter.last_name = subclient_name[1];
    // }

    if (associated_client && associated_client.length) {
      filter.client_first_name = associated_client[0];
      filter.client_last_name = associated_client[1];
    }
    getData(1, pageSize, filter);
  };
  const sendInvite = async () => {
    setInviteLoading(true);
    let subject;
    let body;
  
    try {
      const adminProfile = await sdk.getProfile();
  
      if (!email) throw new Error("Please enter a valid email");
  
      if (!selectedClient) {
        showToast(globalDispatch, "Select a client for subclient");
        return;
      }
  
      body = encodeURI(`${location.origin}/subclient/signup?invited_by=${adminProfile.email}&client_id=${selectedClient}&getting_email=${email}`);
  
      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = 'subclient-invite' `] },
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
    } catch (err) {
      showToast(globalDispatch, err.message);
    }
  
    setInviteLoading(false);
  };
  const changeHandleClient = (e) => {
    console.log(e);
    setSelectedClient(e.value);
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "subclient",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
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
              Sub-Client First Name
            </label>
            <input
              placeholder=""
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
              Sub-Client Last Name
            </label>
            <input
              placeholder=""
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
              placeholder=""
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
                    {/* <div className="relative p-6 flex-auto text-left">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2 text-left ">
                          Who are you inviting?
                        </label>
                        <Select
                          onChange={changeHandleUser}
                          options={inviteUserRole}
                          ref={statusRef}
                        />
                        <p className="text-red-500 text-xs italic"></p>
                      </div>
                    </div> */}
                    <div className="relative text-left px-6 flex-auto">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2 text-left">
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
                          className="block text-gray-700 text-sm font-bold mb-2 text-left "
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
                                navigate("/admin/edit-subclient/" + row.id, {
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
                            {(row["first_name"] || "") +
                              " " +
                              (row["last_name"] || "")}
                          </td>
                        );
                      }
                      if (cell.accessor === "associated_client") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {(row["client_first_name"] || "") +
                              " " +
                              (row["client_last_name"] || "")}
                          </td>
                        );
                      }
                      if (cell.mappingExist) {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
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

export default AdminSubClientListPage;
