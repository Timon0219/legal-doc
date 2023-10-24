import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import AddButton from "../components/AddButton";
import moment from "moment/moment";
import { activityStatuses } from "../utils/constants";

let sdk = new MkdSDK();

const columns = [
  {
    header: "ID",
    accessor: "id",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Contract Id",
    accessor: "contract_id",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Date Updated",
    accessor: "update_at",
    isSorted: false,
    isSortedDesc: false,
    format: (raw) => {
      return moment(raw).format("MM/DD/yyyy HH:mm:ss A");
    },
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mapping: activityStatuses,
  },
];

const LawfirmContractsActivityLogListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = React.useState(false);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
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
    setLoading(true);
    try {
      sdk.setTable("activity_log");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          payload: data
            ? {
                id: data.id || undefined,
                contract_id: id || undefined,
                status: data.status || undefined,
              }
            : null,
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
      if (result) {
        setLoading(false);
      }
      const { list, total, limit, num_pages, page } = result;
      console.log(list);
      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
    } catch (error) {
      console.log("ERROR", error);
      setLoading(false);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    let id = getNonNullValue(data.id);
    let status = getNonNullValue(data.status);
    let filter = {
      id: id ? JSON.parse(id) : "",
      contract_id: contract_id ? JSON.parse(contract_id) : "",
      status: status,
      user_id,
    };
    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "pending_contracts",
      },
    });

    (async function () {
      await getData(1, pageSize, { user_id });
    })();
  }, []);
  const handleReset = async () => {
    reset();
    await getData(1, pageSize, { user_id });
  };
  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Activity Log Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              ID
            </label>
            <input
              placeholder="ID"
              {...register("id")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">{errors.id?.message}</p>
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
              className={`cursor-pointer bg-white border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.status?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              {activityStatuses.slice(0, 5).map((label, idx) => (
                <option value={idx} key={idx}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-red-500 text-xs italic">
              {errors.status?.message}
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
        <div className="mb-3 text-center justify-between w-full flex">
          <h4 className="text-2xl font-medium">Activity Log</h4>
          <AddButton link={"/attorney/add-activity_log"} />
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
              {data.length > 0 &&
                data.map((row, i) => {
                  return (
                    <tr key={i}>
                      {columns.map((cell, index) => {
                        if (cell.mapping) {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {i == 0
                                ? "Created"
                                : cell.mapping[row[cell.accessor]] ?? "N/A"}
                            </td>
                          );
                        }
                        if (cell.format) {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {cell.format(row[cell.accessor]) ?? "N/A"}
                            </td>
                          );
                        }
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row[cell.accessor]}
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

export default LawfirmContractsActivityLogListPage;
