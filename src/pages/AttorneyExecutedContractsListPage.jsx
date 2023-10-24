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
import AddButton from "../components/AddButton";
import moment from "moment";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Client",
    accessor: "client",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Date Executed",
    accessor: "date_executed",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Project name",
    accessor: "project_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Counter Party",
    accessor: "counter_party",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Counter Party Email",
    accessor: "counter_party_email",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
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
    header: "Action",
    accessor: "",
  },
];

const AttorneyExecutedContractsListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  const [docType, setDocType] = useState([]);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();
  const user_id = JSON.parse(localStorage.getItem("user"));

  const schema = yup.object({
    client: yup.string(),
    doc_type: yup.string(),
    assigned_attorney: yup.string(),
    project_name: yup.string(),
    counter_party: yup.string(),
  });
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
      await getData(0, pageSize, { user_id, status: 1 });
    })();
  }

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(0, limit, { user_id, status: 1 });
    })();
  }

  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize, {
        user_id,
        status: 1,
      });
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize,
        { user_id, status: 1 }
      );
    })();
  }

  async function getData(pageNum, limitNum, data) {
    setLoading(true);
    try {
      sdk.setTable("contract"); //;

      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? `${
                  data.user_id
                    ? `forkfirm_contract.attorney_id=${data.user_id}`
                    : 1
                } 
                AND ${`forkfirm_contract.status=${data.status}`} 
              AND ${
                data.project_name
                  ? `forkfirm_contract.project_name LIKE '%${data.project_name}%'`
                  : "1"
              }
                AND ${
                  data.client_first_name
                    ? `client.first_name LIKE '%${data.client_first_name}%'`
                    : "1"
                }
                AND ${
                  data.client_last_name
                    ? ` client.last_name LIKE '%${data.client_last_name}%'`
                    : "1"
                }
                AND ${
                  data.counter_party_name
                    ? `forkfirm_contract.counter_party_name LIKE '%${data.counter_party_name}%'`
                    : "1"
                }
                AND ${
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
    let client_name = getNonNullValue(data.client);
    let doc_type_id = getNonNullValue(
      data.doc_type ? data.doc_type : undefined
    );
    let project_name = getNonNullValue(data.project_name);
    let counter_party_name = getNonNullValue(data.counter_party);
    let filter = {
      client_first_name: client_name?.split(" ")[0] || undefined,
      client_last_name: client_name?.split(" ")[1] || undefined,
      doc_type_id: doc_type_id ? JSON.parse(doc_type_id) : doc_type_id,
      project_name,
      counter_party_name,
      user_id,
      status: 1,
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

  async function openExecutedDocument(id) {
    const result2 = await sdk.callRawAPI(
      "/v2/api/forkfirm/admin/contract/doc",
      {
        where: [`forkfirm_contract.id=${id}`],
        page: 1,
        limit: 10,
      },
      "POST"
    );
    const contracts = result2.list[0];
    if (contracts?.executed_doc2_url || contracts?.executed_doc3_url) {
      navigate(`/attorney/view_executed_document/${id}`);
    } else {
      const executedDocUrl = contracts?.executed_doc_url;
      const fileType = executedDocUrl.substring(executedDocUrl.lastIndexOf(".") + 1).toLowerCase();
    
      if (fileType === "doc" || fileType === "docx") {
        navigate(`/attorney/view_executed_document/${id}`);
      } else {
        window.open(executedDocUrl, "_blank");
      }
    }
  }

  async function openDocument(id) {
    const result = await sdk.callRawAPI(
      "/v2/api/forkfirm/admin/contract/doc",
      {
        where: [`forkfirm_contract.id=${id}`],
        page: 1,
        limit: 10,
      },
      "POST"
    );
    const contracts = result.list[0];
    if (contracts?.doc2_url || contracts?.doc3_url) {
      navigate(`/attorney/view_document/${id}`);
    } else {
      const docUrl = contracts?.doc_url;
      const fileType = docUrl.substring(docUrl.lastIndexOf(".") + 1).toLowerCase();
    
      if (fileType === "doc" || fileType === "docx") {
        navigate(`/attorney/view_document/${id}`);
      } else {
        window.open(docUrl, "_blank");
      }
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "executed_contracts",
      },
    });

    (async function () {
      await getData(1, pageSize, { user_id, status: 1 });
      getDocType();
    })();
  }, []);

  const filterDocTypeHandle = (docId) => {
    return docType.find((item) => docId === item.id)?.name ?? "N/A";
  };
  const handleReset = () => {
    reset();
    getData(1, pageSize, { user_id, status: 1 });
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
              className="block text-gray-700 text-sm font-bold mb-2 capitalize"
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
              className="block text-gray-700 text-sm font-bold mb-2 capitalize"
              htmlFor="duration_type"
            >
              Filter by Doc type
            </label>
            <select
              {...register("doc_type")}
              className={`bg-white border cursor-pointer rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline capitalize ${
                errors.doc_type?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              {docType?.map((item, i) => (
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
              className="block text-gray-700 text-sm font-bold mb-2 capitalize"
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
              className="block text-gray-700 text-sm font-bold mb-2 capitalize"
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
        <div className="mb-3 text-center justify-between w-full flex">
          <h4 className="text-2xl font-medium">Contract</h4>
          {/* <AddButton link={"/attorney/add-contract"} /> */}
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
              {data.length > 0 &&
                data.map((row, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.client_first_name
                        ? row.client_first_name + " " + row.client_last_name
                        : "n/a"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(row.executed_at).format("MM/DD/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.project_name ? row.project_name : "n/a"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.counter_party_name ? row.counter_party_name : "n/a"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-xs text-[#2735d9] duration-100 hover:text-purple-500 underline capitalize"
                        onClick={() => {
                          navigate(
                            "/attorney/details_counter_party_email/" + row.id,
                            {
                              state: row,
                            }
                          );
                        }}
                      >
                        View Emails
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.executed_doc_type_id === null && docType.length > 0
                        ? "N/A"
                        : filterDocTypeHandle(row.executed_doc_type_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" flex flex-col items-start gap-4">
                        {/* <Link
                          to={`/attorney/view_document/${row.id}`}
                          className="text-xs text-[#4a5fe6] duration-100 hover:text-purple-500 underline capitalize "
                        >
                          view Document
                        </Link> */}
                        <button
                          onClick={() => openDocument(row.id)}
                          className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                        >
                          View Document
                        </button>
                        {/* <Link
                          to={`/attorney/view_executed_document/${row.id}`}
                          className="text-xs text-[#4a5fe6] duration-100 hover:text-purple-500 underline capitalize "
                        >
                          view executed Document
                        </Link> */}
                        <button
                          onClick={() => openExecutedDocument(row.id)}
                          className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                        >
                          view executed Document
                        </button>
                        <button
                          className="text-xs text-[#2735d9] duration-100 hover:text-purple-500 underline capitalize"
                          onClick={() => {
                            navigate("/attorney/edit_document/" + row.id, {
                              state: row,
                            });
                          }}
                        >
                          Edit
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

export default AttorneyExecutedContractsListPage;
