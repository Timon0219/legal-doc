import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { dateHandle2, getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import { activityStatuses } from "../utils/constants";

let sdk = new MkdSDK();

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
    header: "Contract Id",
    accessor: "contract_id",
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
    mapping: activityStatuses,
  },
  {
    header: "Date",
    accessor: "date",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
];

const LawFirmActivityLogListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

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
      await getData(0, pageSize);
    })();
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
    const where = {
      ...data,
      status: +data?.status || undefined,
      law_firm_id: user_id,
      // TODO: ask yeakub about table for this
      "activity.contract_id": data?.contract_id,
    };

    console.log("where", where);

    try {
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/lawfirm/activity/PAGINATE`,
        {
          where,
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[0].accessor : "",
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
        },
        "POST"
      );

      const { list, total, limit, num_pages, page } = result;

      console.log("list", list);

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
    let id = getNonNullValue(data.id);
    let create_at = getNonNullValue(data.create_at);
    let contract_id = getNonNullValue(data.contract_id);
    let status = getNonNullValue(data.status);
    let filter = {
      id,
      date: create_at,
      contract_id: contract_id ? parseInt(contract_id) : undefined,
      status: status,
    };
    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "activity_log",
      },
    });

    getData(1, pageSize);
  }, []);

  return (
    <>
      <form
        className="p-5 bg-white rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Activity Log </h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="contract_id"
            >
              Contract ID
            </label>
            <input
              placeholder="Contract ID"
              {...register("contract_id")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.contract_id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.contract_id?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="status"
            >
              Status
            </label>
            <select
              {...register("status")}
              className={`bg-white cursor-pointer border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.status?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              {activityStatuses.map((label, idx) => (
                <option key={idx} value={idx}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-red-500 text-xs italic">
              {errors.status?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="create_at"
            >
              Date
            </label>
            <input
              type="date"
              placeholder="Contract ID"
              {...register("create_at")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.create_at?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.create_at?.message}
            </p>
          </div>
        </div>
        <div className="flex justify-start items-center ">
          <button
            type="submit"
            className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Search
          </button>
          <button
            onClick={() => {
              getData(1, pageSize);
              reset();
            }}
            type="button"
            className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Activity Log</h4>
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
                              className="text-xs"
                              onClick={() => {
                                navigate(
                                  "/law_firm/edit-activity_log/" + row.id,
                                  {
                                    state: row,
                                  }
                                );
                              }}
                            >
                              {" "}
                              Edit
                            </button>
                          </td>
                        );
                      }
                      if (cell.accessor == "date") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {dateHandle2(row[cell.accessor])}
                          </td>
                        );
                      }
                      if (cell.mapping) {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {cell.mapping[row[cell.accessor]] ?? "N/A"}
                          </td>
                        );
                      }
                      return (
                        <td key={index} className="px-6 py-4 whitespace-nowrap">
                          {row[cell.accessor] ?? "N/A"}
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

export default LawFirmActivityLogListPage;
