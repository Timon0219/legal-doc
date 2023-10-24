import React from "react";
import { AuthContext } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
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
    header: "Client Email",
    accessor: "email",
  },
  {
    header: "Law Firm Email",
    accessor: "law_firm_email",
  },

  {
    header: "Action",
    accessor: "",
  },
];

const AdminLawFirmClientListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [lawfirms, setLawfirms] = React.useState([]);

  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const schema = yup.object({
    law_firm_id: yup.number().positive().integer(),
    client_id: yup.number().positive().integer(),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getLawFirmName = (id) => {
    console.log(lawfirms);
    let name;
    lawfirms.forEach((lawFirm) => {
      if (lawFirm.id === id) {
        name = lawFirm.email;
      }
    });
    return name;
  };

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
      sdk.setTable("user");
      const result = await sdk.callRestAPI(
        {
          where: [params.id ? `forkfirm_user.id = ${params.id}` : 1],
          page: pageNum,
          limit: limitNum,
        },
        "VIEWCLIENTLAWFIRMS"
      );
      console.log(result);
      if (!result.error) {
        sdk.setTable("lawfirm");
        const result2 = await sdk.callRestAPI(
          {
            payload: { ...data },

            page: pageNum,
            limit: limitNum,
          },
          "PAGINATE"
        );

        if (!result2.error) {
          setLawfirms(result2.list);
          let arr = [...result.list];
          arr = arr.filter((val) => val.current_law_firm_id !== null);
          setCurrentTableData(arr);
          console.log(arr);
        }
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    let id = getNonNullValue(data.id);
    let law_firm_id = getNonNullValue(data.law_firm_id);
    let client_id = getNonNullValue(data.client_id);
    let filter = {
      id,

      law_firm_id: law_firm_id,
      client_id: client_id,
    };
    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  return (
    <>
      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Assigned Law Firms</h4>
          <AddButton link={`/admin/add-assign_law_firm/${params.id}`} />
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
                              className="text-xs ml-2"
                              style={{ textDecoration: "underline" }}
                              onClick={async () => {
                                console.log(row);
                                sdk.setTable("law_firm_client");
                                const result = await sdk.callRestAPI(
                                  {
                                    id: row["law_firm_client_id"],
                                  },
                                  "DELETE"
                                );
                                console.log(result);
                                showToast(globalDispatch, "Deleted");
                                await getData(1, pageSize);
                              }}
                            >
                              {" "}
                              Delete
                            </button>
                          </td>
                        );
                      }

                      if (cell.accessor === "law_firm_email") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <pre style={{ fontFamily: "Segoe UI" }}>
                              {getLawFirmName(row["current_law_firm_id"])}
                            </pre>
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

export default AdminLawFirmClientListPage;
