import React, { useState } from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { dateHandle, dateHandle2, getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import { activityStatuses, CURRENT_ACTIVITY_STATUS } from "../utils/constants";
import moment from "moment";

let sdk = new MkdSDK();

const deliveryMapping = ["Standard", "Expedited"];

const columns = [
  {
    header: "ID",
    accessor: "id",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
    device: "small",
  },

  {
    header: "Client",
    accessor: "client",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Date Added",
    accessor: "date_added",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Project Name",
    accessor: "project_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Claimed By",
    accessor: "claimed_by",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  // {
  //   header: "Date Updated",
  //   accessor: "date_updated",
  //   isSorted: false,
  //   isSortedDesc: false,
  //   mappingExist: false,
  //   mappings: {},
  // },
  {
    header: "Counter Party",
    accessor: "counterparty",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Counter Party Email",
    accessor: "couter_party_email",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Status Updated At",
    accessor: "status_updated_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Doc Type",
    accessor: "doc_type",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Delivery",
    accessor: "delivery",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
  },
  {
    header: "Action",
    accessor: "",
    device: "large",
  },
];

const AttorneyPendingContractsListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  const [docType, setDocType] = useState([]);
  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();
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
      await getData(0, pageSize, { user_id, status: 0 });
    })();
  }

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(0, limit, { user_id, status: 0 });
    })();
  }

  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize, {
        user_id,
        status: 0,
      });
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize,
        { user_id, status: 0 }
      );
    })();
  }

  async function getData(pageNum, limitNum, data) {
    setLoading(true);
    try {
      const result = await sdk.callRawAPI(
        "/v2/api/forkfirm/admin/pending-contract/PAGINATE",
        {
          where: [
            data
              ? `  ${
                  data.user_id
                    ? `forkfirm_attorney_client.attorney_id=${data.user_id}`
                    : "1"
                }  AND ${`forkfirm_contract.status=0`} AND ${
                  data.project_name
                    ? `forkfirm_contract.project_name LIKE '%${data.project_name}%'`
                    : "1"
                }  AND ${
                  data.client_first_name
                    ? `client.first_name LIKE '%${data.client_first_name}%'`
                    : "1"
                }  AND ${
                  data.client_last_name
                    ? ` client.last_name LIKE '%${data.client_last_name}%'`
                    : "1"
                }    AND ${
                  data.date_added
                    ? `forkfirm_contract.create_at LIKE '%${data.date_added}%'`
                    : "1"
                }   AND ${
                  data.assigned_attorney_first_name
                    ? `attorney.first_name LIKE '%${data.assigned_attorney_first_name}%'`
                    : "1"
                }  AND ${
                  data.assigned_attorney_last_name
                    ? `attorney.last_name LIKE '%${data.assigned_attorney_last_name}%'`
                    : "1"
                }  AND ${
                  data.counter_party_name
                    ? `forkfirm_contract.counter_party_name LIKE '%${data.counter_party_name}%'`
                    : "1"
                }  AND ${
                  data.doc_type_id
                    ? `forkfirm_doc_type.id  = '${data.doc_type_id}'`
                    : "1"
                }  `
              : "1",
          ],
          page: pageNum,
          limit: limitNum,
        },
        "POST"
      );
      if (result) {
        setLoading(false);
      }
      const { list, total, limit, num_pages, page } = result;
      console.log("LIST", list);
      setCurrentTableData(list);
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
    let client_name = getNonNullValue(data.client);
    let doc_type_id = getNonNullValue(
      data.doc_type ? data.doc_type : undefined
    );
    let date_added = getNonNullValue(data.date_added);
    let project_name = getNonNullValue(data.project_name);
    let assigned_attorney_first_name = getNonNullValue(
      data.assigned_attorney_first_name
    );
    let assigned_attorney_last_name = getNonNullValue(
      data.assigned_attorney_last_name
    );
    let counter_party_name = getNonNullValue(data.counter_party);

    let name = client_name ? client_name.split(" ") : client_name;

    let filter = {
      client_first_name: name ? (name[0] ? name[0] : undefined) : name,
      client_last_name: name ? (name[1] ? name[1] : undefined) : name,
      doc_type_id: doc_type_id ? JSON.parse(doc_type_id) : doc_type_id,
      date_added,
      project_name,
      assigned_attorney_last_name,
      assigned_attorney_first_name,
      counter_party_name,
      date_updated,
      user_id,
      status: 0,
    };
    getData(1, pageSize, filter);
  };

  const getDocType = async () => {
    try {
      sdk.setTable("doc_type");
      const result = await sdk.callRestAPI("", "GETALL");
      console.log(result);
      setDocType(result.list);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "pending_contracts",
      },
    });

    (async function () {
      await getData(1, pageSize, { user_id, status: 0 });
    })();
    (async function () {
      await getDocType();
    })();
  }, []);
  const filterDocTypeHandle = (docId) => {
    const newItem = docType.filter((item) => docId === item.id);
    return newItem.length > 0 ? newItem[0].name : "N/A";
  };
  const handleReset = async () => {
    reset();
    await getData(1, pageSize, { user_id, status: 0 });
  };

  const statusChangeAction = async (value, id) => {
    console.log(value, id);
    const newObj = {
      id: id,
      current_activity_status: JSON.parse(value),
    };
    try {
      sdk.setTable("contract");

      const result = await sdk.callRestAPI(newObj, "PUT");
      console.log(result);
      if (!result.error) {
        showToast(globalDispatch, "Status has been updated");
        getData(1, pageSize, { user_id, status: 0 });

        sdk.setTable("activity_log");
        await sdk.callRestAPI(
          {
            contract_id: id,
            status: value,
            date: dateHandle(),
          },
          "POST"
        );
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  const claimHandle = async (con_id) => {
    console.log("claiming document");
    try {
      sdk.setTable("contract");
      await sdk.callRestAPI(
        {
          id: con_id,
          attorney_id: user_id,
        },
        "PUT"
      );
      sdk.setTable("activity_log");
      await sdk.callRestAPI(
        {
          contract_id: con_id,
          status: CURRENT_ACTIVITY_STATUS.DOCUMENT_UNDER_INITIAL_REVIEW,
          date: dateHandle(),
        },
        "POST"
      );
      showToast(globalDispatch, "Contracts Claimed");
      getData(1, pageSize, { user_id, status: 0 });
    } catch (err) {
      showToast(globalDispatch, err.message);
    }
  };

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Contract Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="client"
            >
              Client
            </label>
            <input
              placeholder="Client"
              {...register("client")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.client?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.client?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="duration_type"
            >
              Filter by Doc type
            </label>
            <select
              {...register("doc_type")}
              className={`bg-white border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.doc_type?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              {docType.length > 0 &&
                docType?.map((item, i) => (
                  <option value={item.id} key={i}>
                    {item.name}
                  </option>
                ))}
            </select>
            <p className="text-red-500 text-xs italic">
              {errors.duration_type?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="date_added"
            >
              Date Added
            </label>
            <input
              type="date"
              placeholder="Date Added"
              {...register("date_added")}
              className={`"shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.date_added?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.date_added?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="assigned_attorney_first_name"
            >
              Assigned Attorney First Name
            </label>
            <input
              placeholder="Assigned Attorney First Name"
              {...register("assigned_attorney_first_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.assigned_attorney_first_name?.message
                  ? "border-red-500"
                  : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.assigned_attorney_first_name?.message}
            </p>
          </div>
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="assigned_attorney_last_name"
            >
              Assigned Attorney Last Name
            </label>
            <input
              placeholder="Assigned Attorney Last Name"
              {...register("assigned_attorney_last_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.assigned_attorney_last_name?.message
                  ? "border-red-500"
                  : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.assigned_attorney_last_name?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="project_name"
            >
              Project Name
            </label>
            <input
              placeholder="Project Name"
              {...register("project_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.project_name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.project_name?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="counter_party"
            >
              Counter Party
            </label>
            <input
              placeholder="Counter Party"
              {...register("counter_party")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.counter_party?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.counter_party?.message}
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
          <h4 className="text-2xl font-medium">Contract</h4>
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, i) => {
                  if (column.accessor == "") {
                    if (column.device == "small") {
                      return (
                        <th
                          key={i}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 2xl:hidden  whitespace-nowrap"
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
                      );
                    }
                    if (column.device == "large") {
                      return (
                        <th
                          key={i}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden 2xl:block whitespace-nowrap"
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
                      );
                    }
                  } else {
                    return (
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
                    );
                  }
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 &&
                data.map((row, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.id ? row.id : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap 2xl:hidden">
                      <div className=" flex flex-col items-start gap-3">
                        <Link
                          to={`/attorney/view_document/${row.id}`}
                          className="text-xs text-[#4a5fe6] underline capitalize hover:text-purple-500 duration-100"
                        >
                          view Document
                        </Link>
                        {!row.attorney_id && (
                          <button
                            onClick={() => claimHandle(row.id)}
                            className="text-xs text-[#4a5fe6] underline capitalize hover:text-purple-500 duration-100"
                          >
                            Claim Document
                          </button>
                        )}
                        {row.attorney_id === user_id && (
                          <button
                            className="text-xs text-[#2735d9] underline"
                            onClick={() => {
                              navigate("/attorney/upload_document/" + row.id, {
                                state: row,
                              });
                            }}
                          >
                            Upload Executed
                          </button>
                        )}
                        {row.attorney_id === user_id && (
                          <Link
                            to={`/attorney/edit-contract/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline duration-100 hover:text-purple-500 capitalize "
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${
                        row.client_first_name ? row.client_first_name : "N/A"
                      } ${row.client_last_name ? row.client_last_name : " "}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(row.create_at).format("MM/DD/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.project_name ? row.project_name : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${
                        row.attorney_first_name
                          ? row.attorney_first_name
                          : "N/A"
                      } ${
                        row.attorney_last_name ? row.attorney_last_name : " "
                      }`}
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.date_updated
                          ? moment(row.date_updated).format("MM/DD/yyyy")
                          : "N/A"}
                      </td>
                    </td> */}

                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.counter_party_name ? row.counter_party_name : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-xs text-[#2735d9] underline "
                        onClick={() => {
                          navigate(
                            "/attorney/details_counter_party_email/" + row.id,
                            {
                              state: row,
                            }
                          );
                        }}
                      >
                        View counter parties
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!row.attorney_id ? (
                        "N/A"
                      ) : row.attorney_id == user_id ? (
                        <select
                          defaultValue={row.current_activity_status ?? 0}
                          onChange={(e) =>
                            statusChangeAction(+e.target.value, row.id)
                          }
                          className="bg-white py-2 pl-1 cursor-pointer border focus:outline-none"
                        >
                          <option
                            key={activityStatuses[+row.current_activity_status]}
                            value={+row.current_activity_status}
                          >
                            {activityStatuses[+row.current_activity_status]}
                          </option>
                          {activityStatuses.slice(0, 5).map((name, idx) => (
                            <option key={name} value={idx}>
                              {name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>
                          {activityStatuses[row.current_activity_status]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.attorney_id == null
                          ? "N/A"
                          : row.update_at
                          ? moment(row.update_at).format("MM/DD/yyyy")
                          : "N/A"}
                      </td>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.doc_type_id === null
                        ? "N/A"
                        : filterDocTypeHandle(row.doc_type_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {deliveryMapping[row.delivery]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden 2xl:block">
                      <div className=" flex flex-col items-start gap-4">
                        <Link
                          to={`/attorney/view_document/${row.id}`}
                          className="text-xs text-[#4a5fe6] duration-100 hover:text-purple-500 underline capitalize"
                        >
                          view Document
                        </Link>
                        {!row.attorney_id && (
                          <button
                            onClick={() => claimHandle(row.id)}
                            className="text-xs text-[#4a5fe6] duration-100 hover:text-purple-500 underline capitalize "
                          >
                            Claim Document
                          </button>
                        )}
                        {row.attorney_id === user_id && (
                          <button
                            className="text-xs text-[#2735d9] underline"
                            onClick={() => {
                              navigate("/attorney/upload_document/" + row.id, {
                                state: row,
                              });
                            }}
                          >
                            Upload Executed
                          </button>
                        )}
                        {row.attorney_id === user_id && (
                          <Link
                            to={`/attorney/edit-contract/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline duration-100 hover:text-purple-500 capitalize "
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
                You Don't have any Contracts
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
  );
};

export default AttorneyPendingContractsListPage;
