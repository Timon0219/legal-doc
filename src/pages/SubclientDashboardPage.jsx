import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();
import PaginationBar from "../components/PaginationBar";
import { getNonNullValue } from "../utils/utils";
import SubclientEdit from "../components/SubclientEdit";

const columns = [
  // {
  //   header: "ID",
  //   accessor: "id",
  //   isSorted: true,
  //   isSortedDesc: true,
  //   mappingExist: false,
  //   mappings: {},
  // },
  // Name, Email, Show Billing (yes/no), Action (Edit)

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
  },
  {
    header: "Show Billing",
    accessor: "show_billing",
    mappingExist: true,
    mappings: { 0: "NO", 1: "YES" },
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
    header: "Action",
    accessor: "",
  },
];
const SubclientDashboardPage = () => {
  const [showModal, setShowModal] = React.useState(false);
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const schema = yup.object({});
  const [email, setEmail] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const user_id = JSON.parse(localStorage.getItem("user"));

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

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(0, limit, { user_id });
    })();
  }

  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize, {
        user_id,
      });
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize,
        { user_id }
      );
    })();
  }

  async function getData(pageNum, limitNum, data) {
    setLoading(true);
    try {
      let sortField = columns.filter((col) => col.isSorted);

      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/admin/client/subclient`,
        {
          where: [
            data
              ? `${data.user_id ? `client.id=${user_id}` : 1} AND ${
                  data.client_first_name
                    ? `subclient.first_name LIKE '%${data.client_first_name}%'`
                    : "1"
                }  AND ${
                  data.client_last_name
                    ? `subclient.last_name LIKE '%${data.client_last_name}%'`
                    : "1"
                }`
              : 1,
          ],
          page: pageNum,
          limit: limitNum,
          groupBy: "subclient.id",
          sortId: sortField.length ? sortField[0].accessor : "",
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
        },
        "POST"
      );

      if (result) {
        setLoading(false);
      }
      const { list } = result;

      console.log(list);

      setCurrentTableData(list);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }
  const onSubmit = (data) => {
    console.log(data);
    let client_name = getNonNullValue(data.name);
    let last_name = getNonNullValue(data.last_name);
    let filter = {
      client_first_name: client_name,
      client_last_name: last_name,
      user_id,
    };
    console.log(filter);
    getData(1, pageSize, filter);
  };

  const statusChangeAction = async (value, id) => {
    console.log(value, id);
    const newObj = {
      id: id,
      status: value,
    };
    try {
      sdk.setTable("user");

      const result = await sdk.callRestAPI(newObj, "PUT");
      console.log(result);
      if (!result.error) {
        showToast(globalDispatch, "Status has been updated");
        getData(1, pageSize, { user_id });
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  const sendInvite = async () => {
    setInviteLoading(true);

    try {
      const userProfile = await sdk.getProfile();
      let subject = "Invitation to Join as a Subclient";
      let body = encodeURI(
        `${location.origin}/subclient/signup?invited_by=${userProfile.email}&client_id=${user_id}&getting_email=${email}`
      );

      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = 'subclient-invite' `] },
        "POST"
      );

      if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
        body = emailTemplate.list[0].html.replace(
          new RegExp("{{{link}}}", "g"),
          body
        );
        subject = emailTemplate.list[0].subject || subject;
      }

      const result = await sdk.sendMail({ email, subject, body });

      if (result.error) {
        throw new Error(
          result.message || "An Error occurred while sending the invite."
        );
      }

      setShowModal(false);
      showToast(globalDispatch, "Invite Sent Successfully!");
      setEmail("");
    } catch (err) {
      showToast(globalDispatch, err.message);
    }

    setInviteLoading(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "subclient",
      },
    });
    getData(1, pageSize, { user_id });
  }, []);

  return (
    <>
      <>
        <h4 className="text-2xl font-medium">Dashboard</h4>
        <div className="flex justify-between">
          <h4 className="text-2xl font-medium mt-4">{/* Status */}</h4>
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

        <form
          className="p-5 bg-white shadow rounded mt-4 mb-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="max-w-3xl">
            <div className="filter-form-holder mt-10 flex flex-wrap">
              <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="id"
                >
                  Name
                </label>
                <input
                  placeholder=""
                  {...register("name")}
                  className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.name?.message ? "border-red-500" : ""
                  }`}
                />
                <p className="text-red-500 text-xs italic">
                  {/* {errors.name?.message} */}
                </p>
              </div>
              <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="last_name"
                >
                  Last Name
                </label>
                <input
                  placeholder=""
                  {...register("last_name")}
                  className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.last_name?.message ? "border-red-500" : ""
                  }`}
                />
                <p className="text-red-500 text-xs italic">
                  {/* {errors.name?.message} */}
                </p>
              </div>

              {/* <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
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
            </div> */}
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
                await getData(1, pageSize, { user_id });
                reset();
              }}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="overflow-x-auto  p-5 bg-white shadow rounded mt-4">
          <h4 className="text-2xl font-medium">Sub-Clients</h4>
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
                {data.length > 0 &&
                  data.map((row, i) => {
                    return (
                      <tr key={i}>
                        {columns.map((cell, index) => {
                          if (cell.accessor == "") {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {row.status === 0 && (
                                  <button
                                    className="text-xs underline capitalize "
                                    onClick={() =>
                                      statusChangeAction(1, row.id)
                                    }
                                  >
                                    activate
                                  </button>
                                )}
                                {row.status === 1 && (
                                  <button
                                    className="text-xs underline capitalize "
                                    onClick={() =>
                                      statusChangeAction(0, row.id)
                                    }
                                  >
                                    Deactivate
                                  </button>
                                )}

                                <SubclientEdit
                                  id={row.forkfirm_client_subclient_id}
                                  show_billing={row.show_billing}
                                  getData={() =>
                                    getData(1, pageSize, { user_id })
                                  }
                                />

                                {/* <button
                              className="text-xs ml-2"
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
                          // if (cell.accessor === "status") {
                          //   return (
                          //     <td
                          //       key={index}
                          //       className="px-6 py-4 whitespace-nowrap"
                          //     >
                          //       <select
                          //         defaultValue={row.status ? row.status : "0"}
                          //         onChange={(e) =>
                          //           statusChangeAction(e.target.value, row.id)
                          //         }
                          //       >
                          //         <option value="0">Deactivate</option>
                          //         <option value="1">Activate</option>
                          //       </select>
                          //     </td>
                          //   );
                          // }

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
                  })}
              </tbody>
            </table>
            {loading && (
              <>
                <p className=" capitalize px-10 py-3 text-xl ">Loading...</p>
              </>
            )}
            {!loading && data.length === 0 && (
              <>
                <p className=" capitalize px-10 py-3 text-xl ">
                  You Don't have any Sub-Clients.
                </p>
              </>
            )}
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
    </>
  );
};

export default SubclientDashboardPage;
