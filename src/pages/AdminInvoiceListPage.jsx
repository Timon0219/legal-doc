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
import DownloadButton from "../components/DownloadButton";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";

import moment from "moment";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Invoice ID",
    accessor: "id",
    isSorted: true,
    isSortedDesc: true,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
  },
  {
    header: "Lawfirm Email",
    accessor: "email",
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
    header: "Amount",
    accessor: "charged_amount",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Fork Fee",
    accessor: "fork_fee",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Payout Amount",
    accessor: "payout_amount",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "Unpaid", 1: "Paid", 2: "Void" },
  },
];

const AdminInvoiceListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const statusRef = React.useRef(null);
  const [date, setDate] = React.useState("");
  const [isSorted, setIsSorted] = React.useState(false);

  const selectStatus = [
    { value: "", label: "All" },
    { value: "0", label: "Unpaid" },
    { value: "1", label: "Paid" },
  ];

  const schema = yup.object({
    client_id: yup.number().positive().integer(),
    charged_amount: yup.number(),
    fork_fee: yup.number(),
    payout_amount: yup.number(),
    pay_date: yup
      .string()
      .matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, "Date Format YYYY-MM-DD"),
    status: yup.number().positive().integer(),
    invoice: yup.string(),
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
    if (columns[columnIndex].accessor !== "status") {
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
    } else {
      let cloneData = [...data];
      cloneData = cloneData.sort((a, b) => {
        if (!isSorted) {
          return b.status - a.status;
        }
        return a.status - b.status;
      });
      setIsSorted(!isSorted);
      console.log(cloneData);
      setCurrentTableData(cloneData);
    }
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
      sdk.setTable("lawfirm-invoice");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          payload: { ...data },
          where: [
            data
              ? `${
                  data.id
                    ? `forkfirm_invoice_lawfirm.id LIKE '%${data.id}%'`
                    : "1"
                } AND ${
                  data.email
                    ? `forkfirm_user.email LIKE '%${data.email}%'`
                    : "1"
                } 
               
                 AND ${
                   data.status
                     ? `forkfirm_invoice_lawfirm.status = ${data.status}`
                     : "1"
                 } `
              : 1,
          ],
          date: data ? (data.duration ? data.duration : null) : null,
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
      console.log("l", list);
      if (!data) {
        statusRef.current.setValue(selectStatus[0]);
      }

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
    let email = getNonNullValue(data.email);
    let duration = getNonNullValue(date);
    let status;
    if (statusRef.current.getValue().length) {
      status = statusRef.current.getValue()[0].value;
    }
    status = getNonNullValue(status);

    if (duration) {
      duration = `${duration.year}-${duration.month.number}-01`;
    }

    console.log(duration);

    let filter = {
      id,
      status,
      email,
      duration,
    };
    getData(1, pageSize, filter);
  };

  const exportCSV = async () => {
    console.log("Hello");
    const result = await sdk.callRestAPI({}, "EXPORT");
    console.log(result);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "invoice",
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
        <h4 className="text-2xl font-medium">Search Invoices</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Invoice ID
            </label>
            <input
              placeholder=""
              {...register("id")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">{errors.id?.message}</p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="client_id"
            >
              Lawfirm Email
            </label>
            <input
              type="email"
              placeholder=""
              {...register("email")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.client_id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.client_id?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="pay_date"
            >
              Date
            </label>
            <DatePicker
              value={date}
              format="MM/YYYY"
              containerClassName="w-full"
              render={
                <InputIcon className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              }
              onChange={(array) => {
                if (array.length > 2) return setDate([...value]);

                setDate(array);
              }}
            />

            <p className="text-red-500 text-xs italic">
              {errors.pay_date?.message}
            </p>
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="status"
            >
              Status
            </label>
            <Select options={selectStatus} ref={statusRef} />

            <p className="text-red-500 text-xs italic">
              {errors.status?.message}
            </p>
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
            statusRef.current.setValue(selectStatus[0]);
            await getData(1, pageSize);
            reset();
          }}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Reset
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Invoices</h4>
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
                            {/* <button
                              className="text-xs"
                              style={{ textDecoration: "underline" }}
                              onClick={() => {
                                navigate("/admin/view-invoice/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              View
                            </button> */}
                            {row["status"] === 1 ? (
                              <button
                                className="ml-2 text-xs"
                                style={{ textDecoration: "underline" }}
                                onClick={async () => {
                                  sdk.setTable("invoice_lawfirm");
                                  let result = await sdk.callRestAPI(
                                    {
                                      id: row["id"],
                                      status: 0,
                                      paid_at: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                    },
                                    "PUT"
                                  );

                                  console.log(result);

                                  await getData(1, pageSize);
                                }}
                              >
                                {" "}
                                Mark as Unpaid
                              </button>
                            ) : (
                              <button
                                className="ml-2 text-xs"
                                style={{ textDecoration: "underline" }}
                                onClick={async () => {
                                  sdk.setTable("invoice_lawfirm");
                                  let result = await sdk.callRestAPI(
                                    {
                                      id: row["id"],
                                      status: 1,
                                      paid_at: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                    },
                                    "PUT"
                                  );

                                  console.log(result);

                                  await getData(1, pageSize);
                                }}
                              >
                                {" "}
                                Mark as Paid
                              </button>
                            )}
                          </td>
                        );
                      }

                      if (cell.accessor === "law_firm") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {cell.mappings[row["id"]]}
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

                      if (cell.accessor === "generated_at") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {moment(row[cell.accessor]).format("MM/YYYY")}
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

export default AdminInvoiceListPage;
