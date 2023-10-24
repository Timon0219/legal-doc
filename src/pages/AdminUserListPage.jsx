import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import AddButton from "../components/AddButton";
import Select from "react-select";

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
    header: "First Name",
    accessor: "first_name",
  },
  {
    header: "Last Name",
    accessor: "last_name",
  },
  {
    header: "Email",
    accessor: "email",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Role",
    accessor: "role",
  },
  {
    header: "Status",
    isSorted: true,
    accessor: "status",
    mappings: { 0: "Inactive", 1: "Active" },
  },
];
const AdminUserListPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [tableColumns, setTableColumns] = React.useState(columns);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedClient, setCelectedClient] = React.useState(false);
  const [clients, setClients] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState(false);
  const navigate = useNavigate();
  const statusRef = React.useRef(null);
  const roleRef = React.useRef(null);
  const [isSorted, setIsSorted] = React.useState(false);

  const schema = yup.object({
    id: yup.string(),
    email: yup.string(),
    role: yup.string(),
    status: yup.string(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectRole = [
    { value: "", label: "All" },
    { value: "Admin", label: "Admin" },
    { value: "Attorney", label: "Attorney" },
    { value: "Client", label: "Client" },
    { value: "lawfirm", label: "Law Firm" },
    { value: "subclient", label: "Subclient" },
  ];
  const selectStatus = [
    { value: "", label: "All" },
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];
  const inviteUserRole = [
    { value: "client", label: "Client" },
    { value: "attorney", label: "Attorney" },
    { value: "lawfirm", label: "Law Firm" },
    { value: "subclient", label: "Sub-Client" },
  ];
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
  function onSort(columnIndex) {
    console.log(columnIndex);
    // if (columns[columnIndex].accessor !== "status") {

    // const columns = tableColumns;
    // const index = columns.findIndex((column) => column.accessor === accessor);
    // const column = columns[index];
    // column.isSortedDesc = !column.isSortedDesc;
    // columns.splice(index, 1, column);
    // setTableColumns(() => [...columns]);
    // const sortedList = selector(data, column.isSortedDesc);
    // setCurrentTableData(sortedList);
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

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize
      );
    })();
  }
  function selector(users, isSortedDesc) {
    return users.sort((a, b) => {
      if (isSortedDesc) {
        return a.id < b.id ? 1 : -1;
      }
      if (!isSortedDesc) {
        return a.id < b.id ? -1 : 1;
      }
    });
  }

  async function getData(pageNum, limitNum, data, id) {
    try {
      sdk.setTable("user");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          // customWhere: data
          //   ? `${
          //       data.first_name
          //         ? `forkfirm_user.first_name LIKE '%${data.first_name}%'`
          //         : "1"
          //     } AND ${
          //       data.last_name
          //         ? `forkfirm_user.last_name LIKE '%${data.last_name}%'`
          //         : "1"
          //     } AND ${
          //       data.status ? `forkfirm_user.status = ${data.status}` : "1"
          //     } AND ${
          //       data.email ? `forkfirm_user.email LIKE '%${data.email}%'` : "1"
          //     } AND ${data.id ? `forkfirm_user.id = ${data.id}` : "1"} AND ${
          //       data.role ? `forkfirm_user.role = '${data.role}'` : "1"
          //     }`
          //   : 1,
          payload: { ...data },
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[0].accessor : "",
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
        },
        "PAGINATE"
      );

      if (!data) {
        statusRef.current.setValue(selectStatus[0]);
        roleRef.current.setValue(selectRole[0]);
      }
      console.log(result);
      const { list, total, limit, num_pages, page } = result;
      const sortedList = selector(list, false);
      setCurrentTableData(sortedList);
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
    console.log(data);
    const email = getNonNullValue(data.email);
    const id = parseInt(getNonNullValue(data.id));
    const first_name = getNonNullValue(data.first_name);
    const last_name = getNonNullValue(data.last_name);
    let status = null,
      role = null;

    if (statusRef.current.getValue().length) {
      status = statusRef.current.getValue()[0].value;
    }

    if (roleRef.current.getValue().length) {
      role = roleRef.current.getValue()[0].value;
    }
    const filter = {
      email,
      role: role ? role : undefined,
      status: status ? status : undefined,
      first_name,
      last_name,
      id: id ? id : undefined,
    };

    getData(0, pageSize, filter);
  };
  const sendInvite = async () => {
    setInviteLoading(true);
    // let status;
    let body;
    // if (statusRef.current.getValue().length) {
    //   status = statusRef.current.getValue()[0].value;
    // }

    // console.log(status);
    const adminProfile = await sdk.getProfile();
    console.log(adminProfile);

    if (status === "attorney") {
      body = encodeURI(
        `${location.origin}/attorney/signup?invited_by=${adminProfile.email}&getting_email=${email}`
      );
    } else if (status === "client") {
      body = encodeURI(
        `${location.origin}/client/signup?invited_by=${adminProfile.email}&getting_email=${email}`
      );
    } else if (status == "subclient") {
      // body = encodeURI(
      //   `${location.origin}/subclient/signup?invited_by=${adminProfile.email}&getting_email=${email}`
      // );
      if (selectedClient) {
        body = encodeURI(
          `${location.origin}/subclient/signup?invited_by=${adminProfile.email}&client_id=${selectedClient}&getting_email=${email}`
        );
      } else {
        showToast(globalDispatch, "Select a client for subclient");
      }
    } else {
      body = encodeURI(
        `${location.origin}/lawfirm/signup?invited_by=${adminProfile.email}&getting_email=${email}`
      );
    }

    const result = await sdk.sendMail({ email, body });

    console.log(result);

    if (!result.error) {
      setShowModal(false);
      showToast(globalDispatch, "Invite Sent Successfully!");
      setInviteLoading(false);
    }
  };
  async function getClient(pageNum, limitNum, data) {
    try {
      sdk.setTable("user");
      const clientResult = await sdk.callRestAPI(
        { customWhere: "role like 'client'" },
        "GETALL"
      );
      console.log(clientResult);

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
        path: "user",
      },
    });

    (async function () {
      await getData(0, pageSize);
      await getClient();
    })();
  }, []);
  const changeHandleUser = (e) => {
    setStatus(e.value);
  };
  const changeHandleClient = (e) => {
    console.log(e);
    setCelectedClient(e.value);
  };
  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Users</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              ID
            </label>
            <input
              type="text"
              placeholder=""
              {...register("id")}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">{errors.id?.message}</p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              First Name
            </label>
            <input
              type="text"
              placeholder=""
              {...register("first_name")}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">
              {errors.email?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name
            </label>
            <input
              type="text"
              placeholder=""
              {...register("last_name")}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">
              {errors.email?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder=""
              {...register("email")}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">
              {errors.email?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <Select options={selectStatus} ref={statusRef} />
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <Select options={selectRole} ref={roleRef} />

            <p className="text-red-500 text-xs italic"></p>
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
            roleRef.current.setValue("");
            statusRef.current.setValue(selectStatus[1]);
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
          <h4 className="text-2xl font-medium">Users </h4>
          <div className="flex">
            <AddButton link={"/admin/add-user"} />
            <button
              className="bg-blue-500 ml-2 text-white active:bg-blue-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
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
                      <div className="relative p-6 flex-auto text-left">
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
                      </div>
                      {status === "subclient" && (
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
                      )}
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
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 cursor-pointer">
              <tr className="cursor-pointer">
                {tableColumns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => onSort(index)}
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
                    {tableColumns.map((cell, index) => {
                      if (cell.accessor === "") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <button
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/view-user/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              View
                            </button>

                            <button
                              className="ml-2"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/edit-user/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              Edit
                            </button>

                            {/* <button
                              className="ml-2"
                              style={{ textDecoration: "underline" }}
                              onClick={async () => {
                                console.log(row);
                                sdk.setTable("user");
                                const result = await sdk.callRestAPI(
                                  {
                                    id: row["id"],
                                  },
                                  "DELETE"
                                );
                                console.log(result);
                                showToast(globalDispatch, "Deleted");
                                await getData(1, pageSize);
                              }}
                            >
                              {" "}
                              Delete
                            </button> */}
                          </td>
                        );
                      }
                      if (cell.accessor === "status") {
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

export default AdminUserListPage;
