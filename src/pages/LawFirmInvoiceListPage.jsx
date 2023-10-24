import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";
import moment from "moment";
import DownloadButton from "../components/DownloadButton";

let sdk = new MkdSDK();

const columns = [
  {
    header: "ID",
    accessor: "invoice_id",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Client",
    accessor: "name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  // {
  //   header: "Charged Amount",
  //   accessor: "charged_amount",
  //   isSorted: false,
  //   isSortedDesc: false,
  //   mappingExist: false,
  //   mappings: {},
  // },
  // {
  //   header: "Fork Fee",
  //   accessor: "fork_fee",
  //   isSorted: false,
  //   isSortedDesc: false,
  //   mappingExist: false,
  //   mappings: {},
  // },
  {
    header: "Payout Amount",
    accessor: "payout_amount",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Generated At",
    accessor: "invoice_created_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Generated For",
    accessor: "generated_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Status",
    accessor: "invoice_status",
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

const LawFirmInvoiceListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();
  const [date, setDate] = React.useState("");
  const user_id = Number(localStorage.getItem("user"));

  const selectStatus = [
    { value: "", label: "All" },
    { value: "0", label: "Unpaid" },
    { value: "1", label: "Paid" },
    { value: "2", label: "Void" },
  ];
  const statusRef = React.useRef(null);

  const schema = yup.object({
    client: yup.string().optional(),
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
      sdk.setTable("invoice");
      let sortField = columns.filter((col) => col.isSorted);
      let month;
      if (data) {
        month = data.month;
      }

      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/client/invoice-exclusive/PAGINATE`,
        {
          where: [
            data
              ? `${
                  data.first_name
                    ? `forkfirm_user.first_name LIKE '%${data.first_name}%'`
                    : "1"
                } AND ${
                  data.last_name
                    ? `forkfirm_user.last_name LIKE '%${data.last_name}%'`
                    : "1"
                }  AND ${
                  data.status ? `forkfirm_invoice.status = ${data.status}` : "1"
                }`
              : 1,
            `lawfirm.id = ${user_id}`,
          ],
          // date: moment(new Date()).format("yyyy-MM-DD"),
          date: null,
          page: pageNum,
          limit: limitNum,
          // groupBy: "forkfirm_contract.client_id",
          // groupBy:
          //   "forkfirm_contract.client_id, DATE_FORMAT(forkfirm_contract.executed_at, '%Y-%M')",
          groupBy:
            "forkfirm_contract.client_id, DATE_FORMAT(forkfirm_contract.create_at, '%Y-%M')",
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
      const t = list.map((item) => {
        const generatedFor = new Date(item.generated_at);
        generatedFor.setMonth(generatedFor.getMonth() - 1);
      
        const formattedDate = generatedFor.toLocaleDateString("en-US", {
          month: "2-digit",
          year: "numeric",
        });
      
        return {
          generated_for: formattedDate,
          ...item,
        };
      });
      console.log("list", result);

      if (!data) {
        statusRef.current?.setValue(selectStatus[0]);
      }

      setCurrentTableData(t);
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
    let status = getNonNullValue(data.status);
    let month = getNonNullValue(date);

    let filter = { status: status };
    if (month) {
      if (month.year) {
        month = `${month.year}-${month.month.number}-${month.day}`;
      }
    }

    if (month) {
      filter.month = month;
    }

    if (client_name) {
      client_name = client_name.split(" ");
    }
    if (client_name && client_name.length > 0) {
      filter.first_name = client_name[0] ? client_name[0] : undefined;
      filter.last_name = client_name[1] ? client_name[1] : undefined;
    }

    getData(1, pageSize, filter);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "invoice",
      },
    });

    getData(1, pageSize);
  }, []);

  const exportCSV = async () => {
    sdk.setTable("invoice-exclusive");
    await sdk.callRestAPI(
      {
        where: [`lawfirm.id = ${user_id}`],
        date: null,
        groupBy:
          "forkfirm_contract.client_id, DATE_FORMAT(forkfirm_contract.executed_at, '%Y-%M')",
        page: 1,
        limit: 999999,
      },
      "EXPORT"
    );
  };

  // const exportCSV = async () => {
  //   await sdk.callRawAPI(
  //     `/v2/api/forkfirm/client/invoice-exclusive/EXPORT`,
  //     {
  //       where: [`lawfirm.id = ${user_id}`],
  //       date: null,
  //       groupBy:
  //         "forkfirm_contract.client_id, DATE_FORMAT(forkfirm_contract.executed_at, '%Y-%M')",
  //       page: 1,
  //       limit: 999999,
  //     },
  //     "POST"
  //   );
  // };

  return (
    <>
      <form
        className="p-5 bg-white rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Invoice Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
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
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="month"
            >
              Month
            </label>

            <DatePicker
              value={date}
              format="MM/YYYY"
              containerClassName="w-full"
              onChange={setDate}
              render={
                <InputIcon className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              }
            />
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <select
              {...register("status")}
              className={`bg-white cursor-pointer border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.client?.message ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Status</option>
              <option value="0">Unpaid</option>
              <option value="1">Paid</option>
              <option value="2">Void</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Search
        </button>
        <button
          type="reset"
          onClick={async () => {
            setDate("");
            statusRef.current?.setValue(selectStatus[0]);
            await getData(1, pageSize);
          }}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Reset
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Invoice</h4>
          <DownloadButton handleClick={exportCSV} />
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
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate(
                                  `/lawfirm/invoice/${row.invoice_id}?client_id=${row.client_id}&generated_at=${row.generated_at}`,
                                  {
                                    state: row,
                                  }
                                );
                              }}
                            >
                              {" "}
                              Details
                            </button>
                            {/* <button
                              className="text-xs ml-4"
                              style={{ textDecoration: "underline" }}
                              onClick={async () => {
                                const result = await sdk.sendMail({
                                  email: row["email"],
                                  body: "You have been invoiced!",
                                });
                                if (!result.error) {
                                  showToast(
                                    globalDispatch,
                                    "Invoice Sent Successfully!"
                                  );
                                }
                              }}
                            >
                              {" "}
                              Send Invoice
                            </button> */}
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

                      if (cell.accessor === "name") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row["first_name"] + " " + (row["last_name"] ?? "")}
                          </td>
                        );
                      }
                      if (cell.accessor === "generated_at") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row[cell.accessor]
                              ? moment(row[cell.accessor]).format("MM/YYYY")
                              : "N/A"}
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

export default LawFirmInvoiceListPage;
