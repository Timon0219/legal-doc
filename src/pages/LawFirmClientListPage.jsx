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

let sdk = new MkdSDK();

const columns = [
  {
    header: "First Name",
    accessor: "first_name",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Last Name",
    accessor: "last_name",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Primary Email",
    accessor: "primary_email",
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

const LawFirmClientListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [status, setStatus] = React.useState("client");
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState("");

  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const user_id = JSON.parse(localStorage.getItem("user"));

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
    console.log(columns[columnIndex]);
    if (columns[columnIndex].isSorted) {
      columns[columnIndex].isSortedDesc = !columns[columnIndex].isSortedDesc;
    } else {
      columns.map((i) => (i.isSorted = false));
      columns.map((i) => (i.isSortedDesc = false));
      columns[columnIndex].isSorted = true;
    }

    (async function () {
      await getData(0, pageSize, { user_id });
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
    try {
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? ` ${
                  data.user_id
                    ? `forkfirm_law_firm_client.law_firm_id=${user_id}`
                    : "1"
                }
             AND ${
               data.primary_email
                 ? `forkfirm_user.email  LIKE '%${data.primary_email}%'`
                 : "1"
             }
             AND
              ${
                data.client_first_name
                  ? `forkfirm_user.first_name LIKE '%${data.client_first_name}%'`
                  : "1"
              }
            AND ${
              data.client_last_name
                ? `forkfirm_user.last_name LIKE '%${data.client_last_name}%'`
                : "1"
            } `
              : "1",
          ],
          page: pageNum,
          limit: limitNum,
        },
        "VIEWCLIENTLAWFIRMS"
      );

      const { list, total, limit, num_pages, page } = result;

      console.log(list, "list");

      let clientOptions = [];
      list.map((item) =>
        clientOptions.push({
          value: item.id,
          label: `${item.first_name ? item.first_name : ""} ${
            item.last_name ? item.last_name : ""
          }`,
        })
      );
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
    let primary_email = getNonNullValue(data.primary_email);
    let filter = {
      client_first_name: first_name,
      client_last_name: last_name,
      primary_email,
      user_id,
    };
    getData(1, pageSize, filter);
    console.log(data);
  };

  const sendInvite = async () => {
    setInviteLoading(true);
    const adminProfile = await sdk.getProfile();
    let body = encodeURI(
      `${location.origin}/client/signup?invited_by=${adminProfile.email}&getting_email=${email}&lawfirm_id=${user_id}`
    );

    // const result = await sdk.sendMail({ email, body });
    const emailTemplate = await sdk.callRawAPI(
      "/v2/api/forkfirm/public/email/PAGINATE",
      { page: 1, limit: 1, where: [`slug = '${status}-invite' `] },
      "POST"
    );
    let subject;
    let link = body;
    if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
      body = emailTemplate.list[0].html.replace(
        new RegExp("{{{link}}}", "g"),
        link
      );
      subject =
        emailTemplate.list[0].subject ||
        `Invitation to Join as a ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }`;
    } else {
      subject = `Invitation to Join as a ${
        status.charAt(0).toUpperCase() + status.slice(1)
      }`;
    }

    const result = await sdk.sendMail({ email, subject, body });

    if (!result.error) {
      setEmail("");
      setShowModal(false);
      showToast(globalDispatch, "Invite Sent Successfully!");
      setInviteLoading(false);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "clients",
      },
    });
  }, []);

  React.useEffect(() => {
    if (data.length === 0) {
      getData(1, pageSize, { user_id });
    }
  }, [user_id]);

  const handleReset = async () => {
    reset();
    await getData(1, pageSize, { user_id });
  };

  React.useEffect(() => {
    (async function () {
      const result = await sdk.getProfile();
      setUserEmail(result.email);
    })();
  }, [user_id]);

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Clients</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
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
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
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

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="contract_id"
            >
              Primary Email
            </label>
            <input
              type="email"
              placeholder="Primary Email"
              {...register("primary_email")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.primary_email?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.primary_email?.message}
            </p>
          </div>
        </div>
        <div className="flex">
          <button
            type="submit"
            className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Search
          </button>
          <button
            type="button"
            className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Clients</h4>
          <button
            className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 ml-5 "
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
                    {/* <div className="relative text-left px-6 mt-3 flex-auto">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Who are you inviting?
                        </label>
                        <Select
                          options={selectStatus}
                          onChange={changeHandleUser}
                        />
                        <p className="text-red-500 text-xs italic"></p>
                      </div>
                    </div> */}

                    {/* {status === "subclient" && (
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
                    )} */}
                    <div className="relative px-6 flex-auto text-left">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Email
                        </label>
                        <input
                          type="email"
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
                        className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none  mb-1 ease-linear transition-all duration-150 mr-4"
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
              {data &&
                data.length > 0 &&
                data.map((row, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${row.first_name ? row.first_name : ""}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {` ${row.last_name ? row.last_name : ""} `}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.email ? row.email : "n/a"}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      {row.status === 0 && "followed_up"}
                      {row.status === 1 && "escalated"}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start justify-start flex-col ">
                        <div className="">
                          {/* <Link
                            to={`/lawfirm/client_rate/${row.id}/${row.current_law_firm_id}`}
                            className="text-xs text-[#2b51dc] underline mr-2 capitalize "
                          >
                            View Rates
                          </Link> */}
                          <button
                            className="text-xs text-[#2b51dc] underline mr-1"
                            onClick={() => {
                              navigate("/lawfirm/client_hours/" + row.id, {
                                state: row,
                              });
                            }}
                          >
                            View Hours
                          </button>
                          <button
                            className="text-xs text-[#2b51dc] mr-2 underline capitalize "
                            onClick={() => {
                              navigate("/lawfirm/client_rate/" + row.id, {
                                state: row,
                              });
                            }}
                          >
                            View Rates
                          </button>
                          {row.invited_by == userEmail
                            ? row.current_law_firm_id === user_id && (
                                <button
                                  className="text-xs text-[#2b51dc] mr-2 underline capitalize "
                                  onClick={() => {
                                    navigate(
                                      "/lawfirm/edit_client_rate/" + row.id,
                                      {
                                        state: row,
                                      }
                                    );
                                  }}
                                >
                                  Edit Rates
                                </button>
                              )
                            : ""}
                        </div>
                        {/* <button
                          className="text-xs text-[#2b51dc] underline capitalize "
                          onClick={() => {
                            navigate(
                              "/lawfirm/client_update_playbook/" + row.id,
                              {
                                state: row,
                              }
                            );
                          }}
                        >
                          Update and Download Playbook
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
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

export default LawFirmClientListPage;
