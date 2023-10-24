import React, { useState } from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { dateHandle2, getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import UpArrow from "../components/svcIcon/UpArrow";
import DownArrow from "../components/svcIcon/DownArrow";
import { activityStatuses } from "../utils/constants";
import moment from "moment";
import { showToast } from "../globalContext";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Action",
    accessor: "",
    device: "small",
  },
  {
    header: "Originator",
    accessor: "originator_name",
    isSorted: true,
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
    header: "Law firm",
    accessor: "law_firm",
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
    accessor: "counter_party",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Counter party email",
    accessor: "counter_party_email",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
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
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
    device: "large",
  },
];

const ClientPendingContractsListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [docType, setDocType] = React.useState([]);
  const [selectArrow, setSelectArrow] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
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
      sdk.setTable("contract");

      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? `${
                  data.user_id
                    ? `forkfirm_contract.client_id=${data.user_id}`
                    : 1
                } AND ${`forkfirm_contract.status=${data.status}`}  AND  ${
                  data.lawfirm_first_name
                    ? `lawfirm.first_name LIKE '%${data.lawfirm_first_name}%'`
                    : "1"
                } AND ${
                  data.lawfirm_last_name
                    ? `lawfirm.last_name LIKE '%${data.lawfirm_last_name}%'`
                    : "1"
                } AND ${
                  data.originator
                    ? `forkfirm_contract.originator_name LIKE '%${data.originator}%'`
                    : "1"
                }  AND ${
                  data.project_name
                    ? `forkfirm_contract.project_name LIKE '%${data.project_name}%'`
                    : "1"
                }  AND ${
                  data.counter_party_name
                    ? `forkfirm_contract.counter_party_name LIKE '%${data.counter_party_name}%'`
                    : "1"
                } AND ${
                  data.counter_party_email
                    ? `forkfirm_contract.counter_party_email LIKE '%${data.counter_party_email}%'`
                    : "1"
                } AND ${
                  data.doc_type_id
                    ? `forkfirm_doc_type.id  = '${data.doc_type_id}'`
                    : "1"
                }  `
              : 1,
          ],
          page: pageNum,
          limit: limitNum,
        },
        "PAGINATE"
      );
      if (result) {
        setLoading(false);
      }
      const { list, total, limit, num_pages, page } = result;
      console.log("l", list);
      setCurrentTableData(list);
      // setCurrentTableData(list.filter((item) => item.contract_type === 0));
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
    let counter_party = getNonNullValue(data.counter_party);
    let counter_party_email = getNonNullValue(data.counter_party_email);
    let doc_type = getNonNullValue(data.doc_type);
    let law_firm = getNonNullValue(data.law_firm);
    let project_name = getNonNullValue(data.project_name);
    let originator = getNonNullValue(data.originator);
    let filter = {
      counter_party_email: counter_party_email,
      counter_party_name: counter_party,
      doc_type_id: doc_type && JSON.parse(doc_type),
      lawfirm_first_name: law_firm,
      originator: originator,
      project_name: project_name,
      // date_updated,
      user_id,
      status: 0,
    };
    getData(1, pageSize, filter);
  };

  const filterDocTypeHandle = (docId) => {
    const newItem = docType.filter((item) => docId === item.id);
    return newItem.length > 0 ? newItem[0].name : "N/A";
  };
  const getDocType = async () => {
    try {
      sdk.setTable("doc_type");
      const result = await sdk.callRestAPI("", "GETALL");
      // console.log(
      //   "DOC TYPE LIST",
      //   result?.list?.filter((res) => res.client_id)
      // );
      setDocType(result?.list?.filter((res) => !res.client_id));
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
      await getDocType(1, pageSize);
    })();
  }, []);
  const handleReset = async () => {
    reset();
    await getData(1, pageSize, { user_id, status: 0 });
  };
  const onhandleDelete = async (id) => {
    sdk.setTable("contract");
    try {
      await sdk.callRestAPI(
        {
          id,
        },
        "DELETE"
      );
      showToast(globalDispatch, "Deleted");
    } catch (err) {
      showToast(
        globalDispatch,
        err.message.includes("CONSTRAINT")
          ? "You can't delete this entry"
          : err.message
      );
    }
  };
  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Pending Contracts</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="law_firm"
            >
              Law firm
            </label>
            <input
              placeholder="Law firm"
              id="law_firm"
              {...register("law_firm")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.law_firm?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.law_firm?.message}
            </p>
          </div>
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="originator"
            >
              Originator
            </label>
            <input
              placeholder="Originator"
              id="originator"
              {...register("originator")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.originator?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.originator?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2 relative">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="doc_type"
            >
              Filter By Doc Type
            </label>
            <select
              id="doc_type"
              placeholder="Doc Type"
              onFocus={() => setSelectArrow(!selectArrow)}
              onClick={() => setSelectArrow(!selectArrow)}
              {...register("doc_type")}
              className={`bg-white appearance-none cursor-pointer border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline capitalize ${
                errors.doc_type?.message ? "border-red-500" : ""
              }`}
              defaultValue=""
            >
              <option value="">Select doc type</option>
              {docType.length > 0 &&
                docType.map((item, i) => (
                  <option key={i} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>

            {selectArrow ? (
              <span className=" absolute top-[58%] right-5">
                <UpArrow />
              </span>
            ) : (
              <span className=" absolute top-[58%] right-5">
                <DownArrow />
              </span>
            )}

            <p className="text-red-500 text-xs italic">
              {errors.doc_type?.message}
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
              id="project_name"
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
              id="counter_party"
              {...register("counter_party")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.counter_party?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.counter_party?.message}
            </p>
          </div>
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="counter_party_email"
            >
              Counter Party Email
            </label>
            <input
              placeholder="Counter Party Email"
              id="counter_party_email"
              {...register("counter_party_email")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.counter_party_email?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.counter_party_email?.message}
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
          <h4 className="text-2xl font-medium">Pending Contracts</h4>
        </div>
        <div className="shadow  border-b border-gray-200 ">
          <div className="overflow-x-auto block w-full">
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
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 2xl:hidden whitespace-nowrap"
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
                      <td className="2xl:hidden px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-3">
                          <Link
                            to={`/client/view_document/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline duration-100 hover:text-purple-500 capitalize "
                          >
                            view Document
                          </Link>
                          <Link
                            to={`/client/edit-contract/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline duration-100 hover:text-purple-500 capitalize "
                          >
                            Edit
                          </Link>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.originator_name === null
                          ? row.client_first_name + " " + row.client_last_name
                          : row.originator_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {moment(row.create_at).format("MM/DD/yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.project_name === null ? "N/A" : row.project_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.lawfirm_first_name === null
                          ? "N/A"
                          : `${row.lawfirm_first_name} ${
                              row.lawfirm_last_name ?? ""
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
                        {row.counter_party_name === null
                          ? "N/A"
                          : row.counter_party_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start">
                          <button
                            className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100"
                            onClick={() => {
                              navigate("/client/edit_contracts/" + row.id, {
                                state: row,
                              });
                            }}
                          >
                            View all / Edit
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {row.attorney_id == null
                          ? "N/A"
                          : activityStatuses[row.current_activity_status] ??
                            "N/A"}
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
                      {/* <td className="px-6 py-4 whitespace-nowrap capitalize"> */}
                      {/* {row.attorney_id == null
                          ? "N/A"
                          : activityStatuses[row.current_activity_status] ??
                            "N/A"} */}
                      {/* {row.update_at
                          ? moment(row.update_at).format("MM/DD/yyyy")
                          : "N/A"} */}
                      {/* </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.doc_type_id === null
                          ? "N/A"
                          : filterDocTypeHandle(row.doc_type_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.delivery === 1 ? "Expedited" : "Standard"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden 2xl:block  ">
                        <div className="flex flex-col items-start gap-3">
                          <Link
                            to={`/client/view_document/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline duration-100 hover:text-purple-500 capitalize "
                          >
                            view Document
                          </Link>
                          <Link
                            to={`/client/edit-contract/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline duration-100 hover:text-purple-500 capitalize "
                          >
                            Edit
                          </Link>
                          <button
                            className="text-xs"
                            style={{ textDecoration: "underline" }}
                            onClick={() => onhandleDelete(row.id)}
                          >
                            {" "}
                            Delete
                          </button>
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

export default ClientPendingContractsListPage;
