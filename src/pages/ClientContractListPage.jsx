import React from "react";
import { AuthContext } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import AddButton from "../components/AddButton";

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
    header: "ClientId",
    accessor: "client_id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Originator",
    accessor: "originator",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "ProjectName",
    accessor: "project_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "AttorneyId",
    accessor: "attorney_id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "CounterPartyName",
    accessor: "counter_party_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "CounterPartyEmail",
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
    mappingExist: true,
    mappings: { 0: "followed_up", 1: "escalated", 2: "executed" },
  },
  {
    header: "DocTypeId",
    accessor: "doc_type_id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Duration",
    accessor: "duration",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "DurationType",
    accessor: "duration_type",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "month", 1: "year" },
  },
  {
    header: "Delivery",
    accessor: "delivery",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "expedited", 1: "standard" },
  },
  {
    header: "Document",
    accessor: "document",
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

const ClientContractListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();

  const schema = yup.object({
    client_id: yup.number().positive().integer(),
    originator: yup.string(),
    project_name: yup.string(),
    attorney_id: yup.number().positive().integer(),
    counter_party_name: yup.string(),
    counter_party_email: yup.string(),
    status: yup.number().positive().integer(),
    doc_type_id: yup.number().positive().integer(),
    duration: yup.number().positive().integer(),
    duration_type: yup.number().positive().integer(),
    delivery: yup.number().positive().integer(),
    document: yup.string(),
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
    try {
      sdk.setTable("contract"); //;
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
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

      const { list, total, limit, num_pages, page } = result;

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
    let client_id = getNonNullValue(data.client_id);
    let originator = getNonNullValue(data.originator);
    let project_name = getNonNullValue(data.project_name);
    let attorney_id = getNonNullValue(data.attorney_id);
    let counter_party_name = getNonNullValue(data.counter_party_name);
    let counter_party_email = getNonNullValue(data.counter_party_email);
    let status = getNonNullValue(data.status);
    let doc_type_id = getNonNullValue(data.doc_type_id);
    let duration = getNonNullValue(data.duration);
    let duration_type = getNonNullValue(data.duration_type);
    let delivery = getNonNullValue(data.delivery);
    let document = getNonNullValue(data.document);
    let filter = {
      id,

      client_id: client_id,
      originator: originator,
      project_name: project_name,
      attorney_id: attorney_id,
      counter_party_name: counter_party_name,
      counter_party_email: counter_party_email,
      status: status,
      doc_type_id: doc_type_id,
      duration: duration,
      duration_type: duration_type,
      delivery: delivery,
      document: document,
    };
    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "contract",
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
        <h4 className="text-2xl font-medium">Contract Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Id
            </label>
            <input
              placeholder="Id"
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
              htmlFor="client_id"
            >
              Client Id
            </label>
            <input
              placeholder="Client Id"
              {...register("client_id")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.client_id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.client_id?.message}
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
              {...register("originator")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.originator?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.originator?.message}
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
              htmlFor="attorney_id"
            >
              Attorney Id
            </label>
            <input
              placeholder="Attorney Id"
              {...register("attorney_id")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.attorney_id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.attorney_id?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="counter_party_name"
            >
              Counter Party Name
            </label>
            <input
              placeholder="Counter Party Name"
              {...register("counter_party_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.counter_party_name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.counter_party_name?.message}
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
              {...register("counter_party_email")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.counter_party_email?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.counter_party_email?.message}
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
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.status?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              <option value="0">followed_up</option>
              <option value="1">escalated</option>
              <option value="2">executed</option>
            </select>
            <p className="text-red-500 text-xs italic">
              {errors.status?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="doc_type_id"
            >
              Doc Type Id
            </label>
            <input
              placeholder="Doc Type Id"
              {...register("doc_type_id")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.doc_type_id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.doc_type_id?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="duration"
            >
              Duration
            </label>
            <input
              placeholder="Duration"
              {...register("duration")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.duration?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.duration?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="duration_type"
            >
              Duration Type
            </label>
            <select
              {...register("duration_type")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.duration_type?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              <option value="0">month</option>
              <option value="1">year</option>
            </select>
            <p className="text-red-500 text-xs italic">
              {errors.duration_type?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="delivery"
            >
              Delivery
            </label>
            <select
              {...register("delivery")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.delivery?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              <option value="0">expedited</option>
              <option value="1">standard</option>
            </select>
            <p className="text-red-500 text-xs italic">
              {errors.delivery?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="document"
            >
              Document
            </label>
            <input
              placeholder="Document"
              {...register("document")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.document?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.document?.message}
            </p>
          </div>
        </div>
        <button
          type="submit"
          className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Contract</h4>
          <AddButton link={"/client/add-contract"} />
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
                                navigate("/client/edit-contract/" + row.id, {
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
                          {row[cell.accessor]}
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

export default ClientContractListPage;
