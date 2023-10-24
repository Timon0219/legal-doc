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
        header: 'Name',
        accessor: 'name',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'ClientId',
        accessor: 'client_id',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'LaunchDate',
        accessor: 'launch_date',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'NoOfPartiesOutreach',
        accessor: 'no_of_parties_outreach',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'Playbook',
        accessor: 'playbook',
        isSorted: false,
        isSortedDesc: false,
        mappingExist : false,
        mappings: {  }
    },
    {
        header: 'Nda',
        accessor: 'nda',
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

const AdminProjectListPage = () => {
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

      name: yup.string(),
      client_id: yup.number().positive().integer(),
      launch_date: yup.string().matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, "Date Format YYYY-MM-DD"),
      no_of_parties_outreach: yup.number().positive().integer(),
      playbook: yup.string(),
      nda: yup.string(),
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
      sdk.setTable("project");
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
    let name = getNonNullValue(data.name);
    let client_id = getNonNullValue(data.client_id);
    let launch_date = getNonNullValue(data.launch_date);
    let no_of_parties_outreach = getNonNullValue(data.no_of_parties_outreach);
    let playbook = getNonNullValue(data.playbook);
    let nda = getNonNullValue(data.nda);
    let filter = {
      id,

          name: name,
          client_id: client_id,
          launch_date: launch_date,
          no_of_parties_outreach: no_of_parties_outreach,
          playbook: playbook,
          nda: nda,
    };
    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "project",
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
        <h4 className="text-2xl font-medium">Project Search</h4>
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
            htmlFor="name"
          >
            Name
          </label>
          <input
            placeholder="Name"
            {...register("name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.name?.message}
          </p>
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
            htmlFor="launch_date"
          >
            Launch Date
          </label>
          <input
            type="date"
            placeholder="Launch Date"
            {...register("launch_date")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.launch_date?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.launch_date?.message}
          </p>
        </div>
            
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="no_of_parties_outreach"
          >
            No Of Parties Outreach
          </label>
          <input
            placeholder="No Of Parties Outreach"
            {...register("no_of_parties_outreach")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.no_of_parties_outreach?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.no_of_parties_outreach?.message}
          </p>
        </div>
            N\A mediumtext
        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="nda"
          >
            Nda
          </label>
          <input
            placeholder="Nda"
            {...register("nda")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.nda?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.nda?.message}
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
          <h4 className="text-2xl font-medium">Project</h4>
          <AddButton link={"/admin/add-project"} />
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
                                navigate("/admin/edit-project/" + row.id, {
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

export default AdminProjectListPage;
