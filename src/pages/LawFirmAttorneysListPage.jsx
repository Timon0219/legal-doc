import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { checkingDate, getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import AddButton from "../components/AddButton";
import moment from "moment";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";

let sdk = new MkdSDK();

const columns = [
  { header: "ID", accessor: "attorney_id" },
  {
    header: "Action",
    accessor: "first_action",
    device: "small",
  },

  {
    header: " Name",
    accessor: "name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Email",
    accessor: "attorney_email",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Joined At",
    accessor: "create_at",
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
    mappings: { 0: "Deactivated", 1: "Active" },
  },
  {
    header: "Attorney License",
    accessor: "attorney_license",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: " Expiry Date",
    accessor: "attorney_expiry_date",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Action",
    accessor: "last_action",
    device: "large",
  },
];

const LawFirmAttorneysListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [showModal, setShowModal] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [date, setDate] = React.useState("");

  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();
  const lawFirmID = Number(localStorage.getItem("user"));

  const selectStatus = [
    { value: "", label: "All" },
    { value: "1", label: "Active" },
    { value: "0", label: "Deactivated" },
  ];

  const statusRef = React.useRef(null);

  const schema = yup.object({
    attorney_name: yup.string().optional(),
    email: yup.string().email().optional(),
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

  async function getData(pageNum, limitNum, data = { law_firm_id: lawFirmID }) {
    console.log("data", data);
    try {
      sdk.setTable("law_firm_attorney");

      if (data) {
        data.law_firm_id = lawFirmID;
      }
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          where: data,
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[0].accessor : "",
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
        },
        "LAWFIRMATTORNEYS"
      );

      if (Object.keys(data).length == 1) {
        statusRef.current.setValue(selectStatus[0]);
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
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    let attorney_name = getNonNullValue(data.attorney_name);
    let primary_email = getNonNullValue(data.primary_email);
    let formattedDate = `${date.year}-${date.month.number}-${date.day}`;
    let joined_at = isNaN(new Date(formattedDate))
      ? undefined
      : moment(formattedDate).format("yyyy-MM-DD");
    let status;

    if (statusRef.current.getValue().length) {
      status = parseInt(statusRef.current.getValue()[0].value);
    }

    let filter = {
      "attorney.email": primary_email,
      "attorney.create_at": joined_at,
      "attorney.status": status || undefined,
    };

    if (attorney_name && attorney_name.length) {
      filter["attorney.first_name"] =
        attorney_name.split(" ")[0]?.trim() || undefined;
      filter["attorney.last_name"] =
        attorney_name.split(" ")[1]?.trim() || undefined;
    }

    getData(1, pageSize, filter);
  };
  const sendInvite = async () => {
    setInviteLoading(true);
    let subject;
    let body;
  
    try {
      const adminProfile = await sdk.getProfile();
  
      if (!email) throw new Error("Please enter a valid email");
  
      body = encodeURI(
        `${location.origin}/attorney/signup?invited_by=${adminProfile.email}&getting_email=${email}&lawfirm_id=${lawFirmID}`
      );
  
      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = 'attorney-invite' `] },
        "POST"
      );
  
      if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
        body = emailTemplate.list[0].html.replace(new RegExp("{{{link}}}", "g"), body);
        subject = emailTemplate.list[0].subject || "Invitation to Join as an Attorney";
      } else {
        subject = "Invitation to Join as an Attorney";
      }
  
      const result = await sdk.sendMail({ email, subject, body });
  
      console.log(result);
  
      if (!result.error) {
        setShowModal(false);
        showToast(globalDispatch, "Invite Sent Successfully!");
        setInviteLoading(false);
      }
    } catch (err) {
      tokenExpireError(globalDispatch, err.message);
    }
  
    setInviteLoading(false);
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "attorneys",
      },
    });

    getData(1, pageSize);
  }, []);

  return (
    <>
      <form
        className="p-5 bg-white rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Attorneys</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Attorney Name
            </label>
            <input
              placeholder="Attorney Name"
              {...register("attorney_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.attorney_name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.attorney_name?.message}
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

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <Select options={selectStatus} ref={statusRef} />
            <p className="text-red-500 text-xs italic"></p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Joined At
            </label>
            <DatePicker
              format="MM/DD/YYYY"
              value={date}
              containerClassName="w-full"
              render={
                <InputIcon className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              }
              onChange={setDate}
            />
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
            onClick={async () => {
              setDate("");
              statusRef.current.setValue(selectStatus[0]);
              await getData(1, pageSize);
            }}
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center items-center w-full flex  justify-between ">
          <div className="items-center flex">
            <h4 className="text-2xl font-medium">Attorneys at my Firm</h4>
            <p className="ml-7 relative before:contents-[''] before:bg-red-500 before:h-3 before:w-3 before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-14%] before:z-[5] after:contents-[''] after:bg-red-300 after:h-3 after:w-3 after:absolute after:top-1/2 after:-translate-y-[15%] after:z-[2] after:left-[-12%] capitalize ">
              {" "}
              30 days left to expiry{" "}
            </p>
            <p className="ml-7 relative before:contents-[''] before:bg-[#d5ce00] before:h-3 before:w-3 before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-14%] before:z-[5] after:contents-[''] after:bg-[#d5ce0042] after:h-3 after:w-3 after:absolute after:top-1/2 after:-translate-y-[15%] after:z-[2] after:left-[-12%] capitalize ">
              {" "}
              60 days left to expiry{" "}
            </p>
          </div>
          <div className="">
            <button
              className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              onClick={() => setShowModal(true)}
            >
              Invite
            </button>
            {showModal ? (
              <>
                <div
                  style={{ zIndex: "9999" }}
                  className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                >
                  <div
                    style={{ width: "50%" }}
                    className="relative w-auto my-6 mx-auto max-w-3xl"
                  >
                    {/*content*/}
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                      {/*header*/}
                      <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                        <h3 className="text-3xl font-semibold">Invite Users</h3>
                        <button
                          className="p-1 ml-auto bg-transparent border-0 text-black opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                          onClick={() => setShowModal(false)}
                        >
                          <span className="bg-transparent text-black opacity-100 h-6 w-6 text-2xl block outline-none focus:outline-none">
                            ×
                          </span>
                        </button>
                      </div>
                      <div className="relative p-6 flex-auto">
                        <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                          <label
                            className="block text-gray-700 text-sm font-bold mb-2 text-left "
                            htmlFor="id"
                          >
                            Email
                          </label>
                          <input
                            placeholder=""
                            type={email}
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                              errors.id?.message ? "border-red-500" : ""
                            }`}
                          />
                          <p className="text-red-500 text-xs italic">
                            {errors.id?.message}
                          </p>
                        </div>
                      </div>
                      {/*footer*/}
                      <div className="flex items-center p-6 border-t border-solid border-slate-200 rounded-b">
                        <button
                          className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mr-4"
                          type="button"
                          onClick={() => setShowModal(false)}
                        >
                          Close
                        </button>
                        <button
                          className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-60"
                          type="button"
                          onClick={sendInvite}
                          disabled={inviteLoading}
                        >
                          Send Invitation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="opacity-25 fixed inset-0 z-2 bg-black"
                  style={{ zIndex: "1" }}
                ></div>
              </>
            ) : null}
          </div>
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, i) => {
                  if (column.device == "small") {
                    return (
                      <th
                        key={i}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 2xl:hidden  whitespace-nowrap"
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
                    );
                  }
                  if (column.device == "large") {
                    return (
                      <th
                        key={i}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden 2xl:block  whitespace-nowrap"
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
                    );
                  } else {
                    return (
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
                    );
                  }
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 &&
                data.map((row, i) => {
                  return (
                    <tr
                      key={i}
                      className={checkingDate(row.attorney_expiry_date)}
                      
                    >
                      {columns.map((cell, index) => {
                        if (cell.accessor == "first_action") {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap 2xl:hidden"
                            >
                              {row.attorney_status == null && (
                                <button
                                  className="text-xs"
                                  style={{ textDecoration: "underline" }}
                                  onClick={async () => {
                                    sdk.setTable("user");
                                    const result = await sdk.callRestAPI(
                                      {
                                        id: row["attorney_id"],
                                        role: "attorney",
                                        status: 1,
                                      },
                                      "PUT"
                                    );
                                    console.log(result);
                                    showToast(globalDispatch, "activated");
                                    await getData(1, pageSize);
                                  }}
                                >
                                  Activate
                                </button>
                              )}
                              {row.attorney_status == 0 && (
                                <button
                                  className="text-xs"
                                  style={{ textDecoration: "underline" }}
                                  onClick={async () => {
                                    sdk.setTable("user");
                                    const result = await sdk.callRestAPI(
                                      {
                                        id: row["attorney_id"],
                                        role: "attorney",
                                        status: 1,
                                      },
                                      "PUT"
                                    );
                                    console.log(result);
                                    showToast(globalDispatch, "activated");
                                    await getData(1, pageSize);
                                  }}
                                >
                                  Activate
                                </button>
                              )}
                              {row.attorney_status == 1 && (
                                <button
                                  className="text-xs"
                                  style={{ textDecoration: "underline" }}
                                  onClick={async () => {
                                    sdk.setTable("user");
                                    const result = await sdk.callRestAPI(
                                      {
                                        id: row["attorney_id"],
                                        role: "attorney",
                                        status: 0,
                                      },
                                      "PUT"
                                    );
                                    console.log(result);
                                    showToast(globalDispatch, "Deactivated");
                                    await getData(1, pageSize);
                                  }}
                                >
                                  Deactivate
                                </button>
                              )}
                              <button
                                className="text-xs ml-4"
                                style={{ textDecoration: "underline" }}
                                onClick={async () => {
                                  sdk.setTable("law_firm_attorney");
                                  const result = await sdk.callRestAPI(
                                    {
                                      id: row["id"],
                                    },
                                    "DELETE"
                                  );
                                  console.log(result);
                                  showToast(globalDispatch, "Removed");
                                  await getData(1, pageSize);
                                }}
                              >
                                Remove
                              </button>
                              <br></br>

                              <button
                                className="text-xs"
                                style={{ textDecoration: "underline" }}
                                onClick={() => {
                                  navigate(
                                    "/lawfirm/assign_client/" +
                                      row["attorney_id"],
                                    {
                                      state: row,
                                    }
                                  );
                                }}
                              >
                                {" "}
                                Assign Client
                              </button>
                              <button
                                className="text-xs ml-4"
                                style={{ textDecoration: "underline" }}
                                onClick={() => {
                                  navigate(
                                    "/lawfirm/view_attorney_clients/" +
                                      row["attorney_id"],
                                    {
                                      state: row,
                                    }
                                  );
                                }}
                              >
                                {" "}
                                View Clients
                              </button>
                            </td>
                          );
                        }
                        if (cell.accessor == "last_action") {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap  hidden 2xl:block "
                            >
                              <button
                                className="text-xs"
                                style={{ textDecoration: "underline" }}
                                onClick={async () => {
                                  sdk.setTable("user");
                                  const result = await sdk.callRestAPI(
                                    {
                                      id: row["attorney_id"],
                                      role: "attorney",
                                      status: 0,
                                    },
                                    "PUT"
                                  );
                                  console.log(result);
                                  showToast(globalDispatch, "Deactivated");
                                  await getData(1, pageSize);
                                }}
                              >
                                {" "}
                                Deactivate
                              </button>
                              <button
                                className="text-xs ml-4"
                                style={{ textDecoration: "underline" }}
                                onClick={async () => {
                                  sdk.setTable("law_firm_attorney");
                                  const result = await sdk.callRestAPI(
                                    {
                                      id: row["id"],
                                    },
                                    "DELETE"
                                  );
                                  console.log(result);
                                  showToast(globalDispatch, "Removed");
                                  await getData(1, pageSize);
                                }}
                              >
                                {" "}
                                Remove
                              </button>
                              <br></br>
                              <button
                                className="text-xs"
                                style={{ textDecoration: "underline" }}
                                onClick={() => {
                                  navigate(
                                    "/lawfirm/assign_client/" +
                                      row["attorney_id"],
                                    {
                                      state: row,
                                    }
                                  );
                                }}
                              >
                                {" "}
                                Assign Client
                              </button>

                              <button
                                className="text-xs ml-4"
                                style={{ textDecoration: "underline" }}
                                onClick={() => {
                                  navigate(
                                    "/lawfirm/view_attorney_clients/" +
                                      row["attorney_id"],
                                    {
                                      state: row,
                                    }
                                  );
                                }}
                              >
                                {" "}
                                View Clients
                              </button>
                            </td>
                          );
                        }

                        if (cell.accessor === "name") {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {row["attorney_first_name"] +
                                " " +
                                (row["attorney_last_name"] ?? "")}
                            </td>
                          );
                        }
                        if (cell.accessor === "attorney_license") {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              <a
                                className="text-xs"
                                target={"_blank"}
                                style={{ textDecoration: "underline" }}
                                href={row["url"]}
                              >
                                {" "}
                                Document Preview
                              </a>
                            </td>
                          );
                        }
                        if (cell.mappingExist) {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {cell.mappings[row["attorney_status"]]}
                            </td>
                          );
                        }

                        if (
                          cell.accessor === "create_at" ||
                          cell.accessor === "attorney_expiry_date"
                        ) {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {row[cell.accessor]
                                ? moment(row[cell.accessor]).format(
                                    "MM/DD/YYYY"
                                  )
                                : "N/A"}
                            </td>
                          );
                        }
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row[cell.accessor] ?? "N/A"}
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

export default LawFirmAttorneysListPage;
