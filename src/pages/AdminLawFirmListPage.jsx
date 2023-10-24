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
import AddButton from "../components/AddButton";
import Select from "react-select";

let sdk = new MkdSDK();

const columns = [
  {
    header: "ID",
    accessor: "id",
    isSorted: true,
    isSortedDesc: true,
  },
  {
    header: "Action",
    accessor: "",
  },
  {
    header: "Firm Name",
    isSorted: false,
    isSortedDesc: false,
    accessor: "name",
  },

  {
    header: "Email",
    accessor: "email",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Website",
    accessor: "website",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Office",
    accessor: "base_office",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Attorneys",
    accessor: "attorneys",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "Inactive", 1: "Active" },
  },
];

const base_offices_json = [
  { value: "Alabama", label: "AL" },
  { value: "Alaska", label: "AK" },
  { value: "Arizona", label: "AZ" },
  { value: "Arkansas", label: "AR" },
  { value: "California", label: "CA" },
  { value: "Colorado", label: "CO" },
  { value: "Connecticut", label: "CT" },
  { value: "Delaware", label: "DE" },
  { value: "Florida", label: "FL" },
  { value: "Georgia", label: "GA" },
  { value: "Hawaii", label: "HI" },
  { value: "Idaho", label: "ID" },
  { value: "Illinois", label: "IL" },
  { value: "Indiana", label: "IN" },
  { value: "Iowa", label: "IA" },
  { value: "Kansas", label: "KS" },
  { value: "Kentucky", label: "KY" },
  { value: "Louisiana", label: "LA" },
  { value: "Maine", label: "ME" },
  { value: "Maryland", label: "MD" },
  { value: "Massachusetts", label: "MA" },
  { value: "Michigan", label: "MI" },
  { value: "Minnesota", label: "MN" },
  { value: "Mississippi", label: "MS" },
  { value: "Missouri", label: "MO" },
  { value: "Montana", label: "MT" },
  { value: "Nebraska", label: "NE" },
  { value: "Nevada", label: "NV" },
  { value: "New Hampshire", label: "NH" },
  { value: "New Jersey", label: "NJ" },
  { value: "New Mexico", label: "NM" },
  { value: "New York", label: "NY" },
  { value: "North Carolina", label: "NC" },
  { value: "North Dakota", label: "ND" },
  { value: "Ohio", label: "OH" },
  { value: "Oklahoma", label: "OK" },
  { value: "Oregon", label: "OR" },
  { value: "Pennsylvania", label: "PA" },
  { value: "Rhode Island", label: "RI" },
  { value: "South Carolina", label: "SC" },
  { value: "South Dakota", label: "SD" },
  { value: "Tennessee", label: "TN" },
  { value: "Texas", label: "TX" },
  { value: "Utah", label: "UT" },
  { value: "Vermont", label: "VT" },
  { value: "Virginia", label: "VA" },
  { value: "Washington", label: "WA" },
  { value: "West Virginia", label: "WV" },
  { value: "Wisconsin", label: "WI" },
  { value: "Wyoming", label: "WY" },
];

const AdminLawFirmListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [inviteLoading, setInviteLoading] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [base_offices, setBaseOffices] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const officeRef = React.useRef(null);
  const [isSorted, setIsSorted] = React.useState(false);
  const statusRef = React.useRef(null);
  const navigate = useNavigate();

  const schema = yup.object({
    law_firm_id: yup.number().positive().integer(),
    attorney_id: yup.number().positive().integer(),
  });

  const selectStatus = [
    { value: "", label: "All" },
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];

  React.useEffect(() => {
    let arr = [{ value: "", label: "All" }];
    arr = arr.concat(
      base_offices_json.map((office) => {
        return { value: office.value, label: office.value };
      })
    );
    setBaseOffices(arr);
    officeRef.current.setValue(arr[0]);
  }, []);

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
      sdk.setTable("lawfirm");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          // payload: { ...data },
          where: [
            data
              ? `${
                  data.first_name
                    ? `forkfirm_user.first_name LIKE '%${data.first_name}%'`
                    : "1"
                } AND ${
                  data.website
                    ? `forkfirm_profile.website LIKE '%${data.website}%'`
                    : "1"
                } AND ${
                  data.email
                    ? `forkfirm_user.email LIKE '%${data.email}%'`
                    : "1"
                } AND ${
                  data.base_office
                    ? `forkfirm_profile.base_office = '${data.base_office}'`
                    : "1"
                } AND ${
                  data.status ? `forkfirm_user.status = ${data.status}` : "1"
                } `
              : 1,
          ],
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

      console.log(list);
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
    let status,
      base_office = "";
    if (officeRef.current.getValue().length) {
      base_office = officeRef.current.getValue()[0].value;
    }
    if (statusRef.current.getValue().length) {
      status = statusRef.current.getValue()[0].value;
    }
    console.log(status);
    let filter = {
      first_name: data.first_name,
      // website: data.website,
      email: data.email,
      base_office,
      status,
    };
    getData(1, pageSize, filter);
  };
  const sendInvite = async () => {
    setInviteLoading(true);
    let subject;
    let body;
  
    try {
      const adminProfile = await sdk.getProfile();
  
      if (!email) throw new Error("Please enter a valid email");
  
      body = encodeURI(`${location.origin}/lawfirm/signup?invited_by=${adminProfile.email}&getting_email=${email}`);
  
      const emailTemplate = await sdk.callRawAPI(
        "/v2/api/forkfirm/public/email/PAGINATE",
        { page: 1, limit: 1, where: [`slug = 'lawfirm-invite' `] },
        "POST"
      );
  
      if (Array.isArray(emailTemplate.list) && emailTemplate.list.length > 0) {
        body = emailTemplate.list[0].html.replace(new RegExp("{{{link}}}", "g"), body);
        subject = emailTemplate.list[0].subject || "Invitation to Join as a Law Firm";
      } else {
        subject = "Invitation to Join as a Law Firm";
      }
  
      const result = await sdk.sendMail({ email, subject, body });
  
      if (!result.error) {
        setShowModal(false);
        showToast(globalDispatch, "Invite Sent Successfully!");
      } else {
        showToast(globalDispatch, "An Error occurred while sending the invite.");
      }
    } catch (err) {
      showToast(globalDispatch, err.message);
    }
  
    setInviteLoading(false);
  };
  
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "law_firm",
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
        <h4 className="text-2xl font-medium">Search Law Firms</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Firm Name
            </label>
            <input
              placeholder=""
              {...register("first_name")}
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
              htmlFor="id"
            >
              Email
            </label>
            <input
              placeholder=""
              type="email"
              {...register("email")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">{errors.id?.message}</p>
          </div>

          {/* <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Website
            </label>
            <input
              placeholder=""
              {...register("website")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.id?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">{errors.id?.message}</p>
          </div> */}

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Office
            </label>
            <Select options={base_offices} ref={officeRef} />
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <Select options={selectStatus} ref={statusRef} />
            <p className="text-red-500 text-xs italic"></p>
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
            officeRef.current.setValue(base_offices[0]);
            statusRef.current.setValue(selectStatus[1]);
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
          <h4 className="text-2xl font-medium">Law Firms</h4>
          {/* <AddButton link={"/admin/add-law_firm"} /> */}
          <button
            className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            onClick={() => setShowModal(true)}
          >
            Invite
          </button>
          {showModal ? (
            <>
              <div
                style={{ zIndex: "3" }}
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
                        className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 ease-linear transition-all duration-150 mr-4"
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
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
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
                                navigate("/admin/edit-law_firm/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              Edit
                            </button>
                            {/* <button
                              className="text-xs ml-2"
                              style={{ textDecoration: "underline" }}
                              onClick={async () => {
                                console.log(row);
                                sdk.setTable("user");
                                const result = await sdk.callRestAPI(
                                  {
                                    id: row["id"],
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
                            </button> */}
                          </td>
                        );
                      }

                      if (cell.accessor === "name") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <pre style={{ fontFamily: "Segoe UI" }}>
                              {(row.first_name || "") +
                                " " +
                                (row.last_name || "")}
                            </pre>
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

export default AdminLawFirmListPage;
