import moment from "moment";
import React from "react";
import { useNavigate } from "react-router";
import { AuthContext, tokenExpireError } from "../authContext";
import PaginationBar from "../components/PaginationBar";
import { GlobalContext } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Invoice Id",
    accessor: "id",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    status: true,
  },
  {
    header: "Amount",
    accessor: "charged_amount",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Generated At",
    accessor: "create_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    month: true,
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
  },
];

const columns2 = [
  {
    header: "Invoice Id",
    accessor: "id",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    status: true,
    mappings: {},
  },
  {
    header: "Amount",
    accessor: "charged_amount",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Generated At",
    accessor: "create_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    month: true,
    mappings: {},
  },
  {
    header: "Paid At",
    accessor: "paid_at",
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

const ClientBillingPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [data, setCurrentTableData] = React.useState([]);
  const [billInfo, setBillInfo] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();
  const user_id = JSON.parse(localStorage.getItem("user"));

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

  async function getData(pageNum, limitNum) {
    try {
      sdk.setTable("invoice");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          where: [`client_id=${user_id}`],
          page: pageNum,
          limit: limitNum,
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
        },
        "PAGINATE"
      );

      const { list, total, limit, num_pages, page } = result;

      console.log("invoices", list);

      setCurrentTableData(list.filter((item) => item.status === 0));
      setBillInfo(list.filter((item) => item.status === 1));
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

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "billing",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  return (
    <>
      <div className="p-5 bg-white shadow rounded mb-10">
        <h4 className="text-2xl font-semibold mb-5 ">Upcoming Invoices</h4>
        <div className="shadow  border-b border-gray-200">
          <div className="overflow-x-auto block min-w-full max-w-[1029px]">
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
                           if (cell.accessor === "generated_at") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {moment(row[cell.accessor]).format("MM/DD/YYYY")}
                          </td>
                        );
                      }
                          if (cell.accessor == "") {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                <div className="flex flex-col items-start ">
                                  <button
                                    className="text-sm text-[#4a5fe6] underline "
                                    onClick={() => {
                                      navigate(
                                        `/client/pay/${row.id}?client_id=${user_id}&generated_at=${row.generated_at}`,
                                        {
                                          state: row,
                                        }
                                      );
                                    }}
                                  >
                                    Pay
                                  </button>
                                </div>
                              </td>
                            );
                          }
                          if (cell.accessor == "generated_at") {
                           return <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {moment(row[cell.accessor]).format('MM/DD/YYYY')} 
                          </td>
                          }
                          if (cell.mappingExist) {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                <div className="flex flex-col items-start">
                                  <button
                                    className="text-xs text-[#4a5fe6] underline"
                                    onClick={() => {
                                      navigate(
                                        "/client/edit-contract_tag/" + row.id,
                                        {
                                          state: row,
                                        }
                                      );
                                    }}
                                  >
                                    View all
                                  </button>
                                  <button
                                    className="text-xs text-[#4a5fe6] underline"
                                    onClick={() => {
                                      navigate(
                                        "/client/edit-contract_tag/" + row.id,
                                        {
                                          state: row,
                                        }
                                      );
                                    }}
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                            );
                          }
                          if (cell.status) {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {row[cell.accessor] === 1 ? "Paid" : "Unpaid"}
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
      <div className="p-5 bg-white shadow rounded mb-10">
        <h4 className="text-2xl font-semibold mb-5 ">Billing History</h4>
        <div className="shadow  border-b border-gray-200">
          <div className="overflow-x-auto block max-w-[1029px] min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns2.map((column, i) => (
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
                {billInfo.map((row, i) => {
                  return (
                    <tr key={i}>
                      {columns2.map((cell, index) => {
                        if (cell.accessor == "") {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              <div className="flex flex-col items-start ">
                                <button
                                  className="text-sm text-[#4a5fe6] underline "
                                  onClick={() => {
                                    navigate(
                                      `/client/billing/${row.id}?client_id=${user_id}&generated_at=${row.generated_at}`,
                                      {
                                        state: row,
                                      }
                                    );
                                  }}
                                >
                                  {" "}
                                  View Details
                                </button>
                              </div>
                            </td>
                          );
                        }
                        // if (cell.accessor == "generated_at") {
                        //   return (
                        //     <td
                        //       key={index}
                        //       className="px-6 py-4 whitespace-nowrap"
                        //     >
                        //       {moment(row[cell.accessor]).format("MMMM")}
                        //     </td>
                        //   );
                        // }
                        if (cell.mappingExist) {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              <div className="flex flex-col items-start">
                                <button
                                  className="text-xs text-[#4a5fe6] underline"
                                  onClick={() => {
                                    navigate(
                                      "/client/edit-contract_tag/" + row.id,
                                      {
                                        state: row,
                                      }
                                    );
                                  }}
                                >
                                  View all
                                </button>
                                <button
                                  className="text-xs text-[#4a5fe6] underline"
                                  onClick={() => {
                                    navigate(
                                      "/client/edit-contract_tag/" + row.id,
                                      {
                                        state: row,
                                      }
                                    );
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          );
                        }
                        if (cell.status) {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {row[cell.accessor] === 0 ? "Un Paid" : "Paid"}
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

export default ClientBillingPage;
