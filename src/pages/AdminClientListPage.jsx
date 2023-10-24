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
import AddButton from "../components/AddButton";
import Select from "react-select";

let sdk = new MkdSDK();

const columns = [
  {
    header: "ID",
    accessor: "id",
    isSorted: true,
    isSortedDesc: true,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
  },
  // {
  //   header: "Client Name",
  //   accessor: "name",
  // },
  {
    header: "Client First Name",
    accessor: "first_name",
  },
  {
    header: "Client Last Name",
    accessor: "last_name",
  },
  {
    header: "Email",
    accessor: "email",
  },
  {
    header: "Tag",
    accessor: "tag",
  },
  {
    header: "Assigned Law Firms",
    accessor: "assigned_law_firms",
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "Inactive", 1: "Active" },
  },
  {
    header: "Invited By",
    accessor: "invited_by",
  },
  {
    header: "Rates",
    accessor: "rates",
  },
];

const AdminLawFirmClientListPage = () => {
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
  const [showModal, setShowModal] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const navigate = useNavigate();
  const [tags, setTags] = React.useState([]);
  const tagRef = React.useRef(null);

  const schema = yup.object({
    first_name: yup.string().optional(),
    last_name: yup.string().optional(),
    email: yup.string().email().optional(),
    invited_by: yup.string().optional(),
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
      sdk.setTable("client");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? `${
                  data.first_name
                    ? `forkfirm_user.first_name LIKE '%${data.first_name}%'`
                    : "1"
                } AND ${
                  data.last_name
                    ? `forkfirm_user.last_name LIKE '%${data.last_name}%'`
                    : "1"
                } 
                AND ${data.tag ? `forkfirm_tag.name LIKE '%${data.tag}%'` : "1"}
                AND ${
                  data.email
                    ? `forkfirm_user.email LIKE '%${data.email}%'`
                    : "1"
                } AND ${
                  data.invited_by
                    ? `forkfirm_profile.invited_by = '${data.invited_by}'`
                    : "1"
                }`
              : 1,
          ],
          // "groupBy": "forkfirm_user.id",
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

      const { list, total, limit, num_pages, page } = result;
      console.log(list);
      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);

      sdk.setTable("tag");

      (async (pageNum, limitNum) => {
        const tagResult = await sdk.callRestAPI(
          {
            page: pageNum,
            limit: limitNum,
          },
          "PAGINATE"
        );

        const { list } = tagResult;
        if (!list[0]?.configuration) {
          let arr = [];
          list.forEach((val) => {
            arr.push({ label: val.name, value: val.id });
          });

          setTags(arr);
        }
      })(pageNum, pageSize);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    // let client_name = getNonNullValue(data.name);
    let first_name = getNonNullValue(data.first_name);
    let last_name = getNonNullValue(data.last_name);
    let email = getNonNullValue(data.email);
    let invited_by = getNonNullValue(data.invited_by);
    let tag = "";
    if (data.name) {
      client_name = client_name.split(" ");
    }

    if (tagRef.current.getValue().length) {
      tag = tagRef.current.getValue()[0].label;
    }

    let filter = {
      email,
      invited_by,
      tag,
      first_name: first_name,
      last_name: last_name,
    };
   
    getData(1, pageSize, filter);
  };
  const sendInvite = async () => {
    setInviteLoading(true);
    let subject;
    let body;
  
    try {
      const adminProfile = await sdk.getProfile();
  
      if (!email) throw new Error("Please enter a valid email");
  
      body = encodeURI(`${location.origin}/client/signup?invited_by=${adminProfile.email}&getting_email=${email}`);
  
      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = 'client-invite' `] },
        "POST"
      );
  
      if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
        body = emailTemplate.list[0].html.replace(new RegExp("{{{link}}}", "g"), body);
        subject = emailTemplate.list[0].subject || "Invitation to Join as a Client";
      } else {
        subject = "Invitation to Join as a Client";
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

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client",
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
        <h4 className="text-2xl font-medium">Search Clients</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="first_name"
            >
              Client First Name
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
              Client Last Name
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
              Client Email
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
              htmlFor="invited_by"
            >
              Invited By
            </label>
            <input
              placeholder=""
              {...register("invited_by")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.invited_by?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.invited_by?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="office"
            >
              Tags
            </label>
            <Select options={tags} ref={tagRef} />

            <p className="text-red-500 text-xs italic">
              {errors.law_firm?.message}
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
            tagRef.current.setValue("");
            await getData(1, pageSize);
          }}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Reset
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Clients</h4>
          {/* <AddButton link={"/admin/add-client"} /> */}
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
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
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
                              className="text-xs"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/view-client/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              View
                            </button>

                            <button
                              className="text-xs ml-2"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/edit-client/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              Edit
                            </button>

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
                      } else if (cell.accessor === "rates") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <button
                              className="text-xs"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/view-client_rate/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              View Rates
                            </button>

                            <button
                              className="text-xs ml-2"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/edit-client_rate/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              Edit Rates
                            </button>
                          </td>
                        );
                      } else if (cell.accessor === "assigned_law_firms") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <button
                              className="text-xs"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/assign_law_firm/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              View Law Firms
                            </button>
                          </td>
                        );
                      } else if (cell.accessor === "tag") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <button
                              className="text-xs"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/client_tags/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              View Client's Tags
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

export default AdminLawFirmClientListPage;
