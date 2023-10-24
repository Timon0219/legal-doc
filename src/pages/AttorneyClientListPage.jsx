import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
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
    header: "Client Name",
    accessor: "client_name",
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
  // {
  //   header: "Status",
  //   accessor: "status",
  //   isSorted: false,
  //   isSortedDesc: false,
  //   mappingExist: true,
  //   mappings: { 0: "followed_up", 1: "escalated", 2: "executed" },
  // },
  {
    header: "Action",
    accessor: "",
  },
];

const AttorneyClientListPage = () => {
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
      sdk.setTable("attorney/client");
      const result = await sdk.callRestAPI(
        {
          where: {
            "client.name": null,
            "client.first_name": data.client_name ? data.client_name : null,
            "client.last_name": data.last_name ? data.last_name : null,
            "client.email": data.primary_email ? data.primary_email : null,
            "attorney.id": data.user_id ? data.user_id : null,
            "client.id": null,
          },
          page: pageNum,
          limit: limitNum,
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
    let client_name = getNonNullValue(data.client_name);
    let primary_email = getNonNullValue(data.primary_email);
    let last_name = getNonNullValue(data.last_name);
    let filter = {
      client_name,
      last_name,
      user_id,
      primary_email,
    };
    getData(1, pageSize, filter);
    console.log(data);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client",
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

  console.log(data);

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Clients</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              First Name
            </label>
            <input
              placeholder="First Name"
              {...register("client_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.client_name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.client_name?.message}
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
          {/* <AddButton link={"/attorney/add-activity_log"} /> */}
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
                      {`${row.first_name ? row.first_name : ""} ${
                        row.last_name ? row.last_name : ""
                      } `}
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
                        {/* <button
                          className="text-xs text-[#2b51dc] underline "
                          onClick={() => {
                            navigate(
                              "/attorney/client_update_playbook/" + row.id,
                              {
                                state: row,
                              }
                            );
                          }}
                        >
                          Update and Download Playbook
                        </button> */}
                        {/* <button
                          className="text-xs text-[#2b51dc] underline "
                          onClick={() => {
                            navigate("/attorney/client_update_nda/" + row.id, {
                              state: row,
                            });
                          }}
                        >
                          Update and Download NDA
                        </button> */}
                        <button
                          className="text-xs text-[#2b51dc] underline "
                          onClick={() => {
                            navigate("/attorney/client_hours/" + row.id, {
                              state: row,
                            });
                          }}
                        >
                          View hours
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <>
              <p className=" capitalize px-10 py-3 text-xl ">
                You Don't have any client
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

export default AttorneyClientListPage;
