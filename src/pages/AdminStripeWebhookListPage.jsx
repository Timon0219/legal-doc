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
        header: 'ID',
        accessor: 'id',
        isSorted: true,
        isSortedDesc: false,
        mappingExist: false,
        mappings:{}
      },
    {
        header: 'StripeId',
        accessor: 'stripe_id',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'IdempotencyKey',
        accessor: 'idempotency_key',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'Description',
        accessor: 'description',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'EventType',
        accessor: 'event_type',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'ResourceType',
        accessor: 'resource_type',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'Object',
        accessor: 'object',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'IsHandled',
        accessor: 'is_handled',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
  {
    header: "Action",
    accessor: "",
  },
];

const AdminStripeWebhookListPage = () => {
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

      stripe_id: yup.string(),
      idempotency_key: yup.string(),
      description: yup.string(),
      event_type: yup.string(),
      resource_type: yup.string(),
      object: yup.string(),
      is_handled: yup.string(),
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
      sdk.setTable("stripe_webhook");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          payload: { ...data },
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[0].accessor : "",
          direction: sortField.length ? (sortField[0].isSortedDesc ? "DESC" : "ASC") : "",
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
    let stripe_id = getNonNullValue(data.stripe_id);
    let idempotency_key = getNonNullValue(data.idempotency_key);
    let description = getNonNullValue(data.description);
    let event_type = getNonNullValue(data.event_type);
    let resource_type = getNonNullValue(data.resource_type);
    let object = getNonNullValue(data.object);
    let is_handled = getNonNullValue(data.is_handled);
    let filter = {
      id,

          stripe_id: stripe_id,
          idempotency_key: idempotency_key,
          description: description,
          event_type: event_type,
          resource_type: resource_type,
          object: object,
          is_handled: is_handled,
    };
    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "stripe_webhook",
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
        <h4 className="text-2xl font-medium">StripeWebhook Search</h4>
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
          <p className="text-red-500 text-xs italic">
            {errors.id?.message}
          </p>
        </div>
            
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="stripe_id"
          >
            Stripe Id
          </label>
          <input
            placeholder="Stripe Id"
            {...register("stripe_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.stripe_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.stripe_id?.message}
          </p>
        </div>
            
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="idempotency_key"
          >
            Idempotency Key
          </label>
          <input
            placeholder="Idempotency Key"
            {...register("idempotency_key")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.idempotency_key?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.idempotency_key?.message}
          </p>
        </div>
            
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <input
            placeholder="Description"
            {...register("description")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.description?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.description?.message}
          </p>
        </div>
            
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="event_type"
          >
            Event Type
          </label>
          <input
            placeholder="Event Type"
            {...register("event_type")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.event_type?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.event_type?.message}
          </p>
        </div>
            
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="resource_type"
          >
            Resource Type
          </label>
          <input
            placeholder="Resource Type"
            {...register("resource_type")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.resource_type?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.resource_type?.message}
          </p>
        </div>
            
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="object"
          >
            Object
          </label>
          <input
            placeholder="Object"
            {...register("object")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.object?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.object?.message}
          </p>
        </div>
            N\A tinyint
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
          <h4 className="text-2xl font-medium">StripeWebhook</h4>
          <AddButton link={"/admin/add-stripe_webhook"} />
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
                                navigate("/admin/edit-stripe_webhook/" + row.id, {
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

export default AdminStripeWebhookListPage;
