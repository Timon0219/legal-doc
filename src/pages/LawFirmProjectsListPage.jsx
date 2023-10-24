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
import AddButton from "../components/AddButton";
import moment from "moment";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Project Name",
    accessor: "name",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Client Name",
    accessor: "client_name",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Launch Date",
    accessor: "launch_date",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "# of Parties Outreach",
    accessor: "no_of_parties_outreach",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
  },
  {
    header: "Playbook",
    accessor: "",
  },
];

const LawFirmProjectsListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
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

  const schema = yup.object({
    client_name: yup.string(),
    primary_email: yup.string(),
    launch_date: yup
      .date()
      .nullable()
      .transform((curr, orig) => (orig === "" ? null : curr)),
  });
  const {
    register,
    handleSubmit,
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
      sdk.setTable("attorney/project");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          where: {
            "forkfirm_project.law_firm_id": user_id,
            "forkfirm_attorney_client.attorney_id": undefined,
            "forkfirm_user.name": data.client_name?.trim() || undefined,
            name: data.project_name || undefined,
            launch_date: data.launch_date || undefined,
          },
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[0].accessor : "",
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
          groupBy: "forkfirm_project.id",
        },
        "PAGINATE"
      );
      if (result) {
        setLoading(false);
      }
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
      setLoading(false);
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    let project_name = getNonNullValue(data.project_name);
    let client_name = getNonNullValue(data.client_name);
    let launch_date = data.launch_date
      ? moment(data.launch_date).format("yyyy-MM-DD")
      : undefined;
    let filter = {
      project_name,
      client_name,
      launch_date,
    };
    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "projects",
      },
    });

    getData(1, pageSize, { user_id });
  }, []);

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Projects Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
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
              htmlFor="id"
            >
              Client Name
            </label>
            <input
              placeholder="Client Name"
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
              htmlFor="launch_date"
            >
              Launch Date
            </label>
            <input
              type="date"
              {...register("launch_date")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.launch_date?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.launch_date?.message}
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
            type="reset"
            onClick={() => {
              reset();
              getData(1, pageSize, { user_id });
            }}
            className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Projects</h4>
          <AddButton link={"/lawfirm/add-projects"} />
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
                            <div className="flex justify-start flex-col gap-3 items-start">
                              {(row.nda || row.nda2 || row.nda3) && (
                                <button
                                  className="text-xs text-[#2b51dc] underline hover:text-purple-500 duration-100 capitalize "
                                  onClick={() => {
                                    navigate("/lawfirm/view_nda/" + row.id, {
                                      state: row,
                                    });
                                  }}
                                >
                                  Update And Download NDA
                                </button>
                              )}
                              <button
                                className="text-xs text-[#2b51dc] underline hover:text-purple-500 duration-100 capitalize"
                                onClick={() => {
                                  navigate("/lawfirm/view_playbook/" + row.id, {
                                    state: row,
                                  });
                                }}
                              >
                                Update And Download Playbook
                              </button>
                              <button
                                className="text-xs text-[#2b51dc] underline hover:text-purple-500 duration-100 capitalize"
                                onClick={() => {
                                  navigate("/lawfirm/edit-project/" + row.id, {
                                    state: row,
                                  });
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        );
                      }
                      if (cell.accessor == "client_name") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {`${row.first_name} ${row.last_name}`}
                          </td>
                        );
                      }
                      if (cell.accessor == "launch_date") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {moment(row[cell.accessor]).format("MM/DD/yyyy")}
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
          {loading && (
            <>
              <p className=" capitalize px-10 py-3 text-xl ">Loading...</p>
            </>
          )}
          {!loading && data.length === 0 && (
            <>
              <p className=" capitalize px-10 py-3 text-xl ">
                You Don't have any project
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

export default LawFirmProjectsListPage;
