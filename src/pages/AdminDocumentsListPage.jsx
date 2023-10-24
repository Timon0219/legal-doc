import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import AddButton from "../components/AddButton";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";
import moment from "moment";

let sdk = new MkdSDK();

const columns = [
  {
    header: "ID",
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
    header: "Client First Name",
    accessor: "client_first_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Client Last Name",
    accessor: "client_last_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Lawfirm ",
    accessor: "lawfirm_name",
    isSorted: false,
    isSortedDesc: false,
  },

  {
    header: "Date Added",
    accessor: "create_at",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Project Name",
    accessor: "project_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Counter Party",
    accessor: "counter_party_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Counter Party Email",
    accessor: "counter_party_email",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Doc Type",
    accessor: "doc_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "Pending", 1: "Executed" },
  },
  {
    header: "Tag",
    accessor: "tag",
    isSorted: false,
    isSortedDesc: false,
  },
];

const AdminDocumentsListPage = () => {
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
  const [docTypes, setDocTypes] = React.useState([]);
  const [clients, setClients] = React.useState({});
  const [lawFirmData, setLawFirmData] = React.useState([]);
  const docTypesRef = React.useRef(null);
  const navigate = useNavigate();
  const [isSorted, setIsSorted] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  const tagRef = React.useRef(null);
  const lawFirmRef = React.useRef(null);

  const schema = yup.object({});

  const [date, setDate] = React.useState("");

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
      sdk.setTable("contract"); //;
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          // payload: { ...data },
          where: [
            data
              ? `${
                  data.lawfirm_id ? `lawfirm.id=${data.lawfirm_id}` : "1"
                } AND  ${
                  data.date
                    ? `forkfirm_contract.create_at LIKE '%${data.date}%'`
                    : "1"
                }   AND ${
                  data.tag ? `forkfirm_tag.name LIKE '%${data.tag}%'` : "1"
                }   AND ${
                  data.doc_type_id
                    ? `forkfirm_contract.doc_type_id LIKE '%${data.doc_type_id}%'`
                    : "1"
                } AND ${
                  data.firstName
                    ? `client.first_name LIKE '%${data.firstName}%'`
                    : "1"
                }   AND ${
                  data.lastName
                    ? `client.last_name LIKE '%${data.lastName}%'`
                    : "1"
                }   AND ${
                  data.project_name
                    ? `forkfirm_contract.project_name LIKE '%${data.project_name}%'`
                    : "1"
                }`
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

      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages ?? 1);
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
    const firstName = getNonNullValue(data.firstName);
    const lastName = getNonNullValue(data.lastName);
    let doc_type = "";
    let tag = "";

    if (docTypesRef.current.getValue().length) {
      doc_type = parseInt(docTypesRef.current.getValue()[0].value);
    }
    let law_firm_id;
    if (lawFirmRef.current.getValue().length) {
      law_firm_id = lawFirmRef.current.getValue()[0].value;
    }
    if (tagRef.current.getValue().length) {
      tag = tagRef.current.getValue()[0].label;
    }

    console.log("Tag: ", tag);

    // let first_name,
    //   last_name = "";

    // let client = data.client.split(" ");
    // if (client.length > 1) {
    //   first_name = client[0];
    //   last_name = client[1];
    // }

    let filter = {
      firstName,
      lastName,
      project_name: data.project_name ? data.project_name : undefined,
      // lawfirm: data.law_firm ? data.law_firm : undefined,
      lawfirm_id: law_firm_id,
      date: data.date ? data.date : undefined,
      doc_type_id: doc_type ? doc_type : undefined,
      tag: tag ? tag : undefined,
    };
    getData(1, pageSize, filter);
  };

  const getAllLawfirm = async () => {
    try {
      sdk.setTable("lawfirm");
      const result2 = await sdk.callRestAPI(
        {
          payload: { ...data },
        },
        "PAGINATE"
      );

      let dataArr = [
        { value: "", label: "All" },
        ...result2.list.map((lawfirm) => ({
          value: lawfirm.id,
          label: (lawfirm.first_name || "") + " " + (lawfirm.last_name || ""),
        })),
      ];
      setLawFirmData(dataArr);

      if (!data) {
        lawFirmRef.current.setValue(dataArr[0]);
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  const getClient = async () => {
    sdk.setTable("client");

    const result2 = await sdk.callRestAPI(
      {
        payload: { ...data },
        // page: pageNum,
        // limit: limitNum,
        // sortId: sortField.length ? sortField[0].accessor : "",
        // direction: sortField.length
        //   ? sortField[0].isSortedDesc
        //     ? "DESC"
        //     : "ASC"
        //   : "",
      },
      "PAGINATE"
    );

    const { list: list2 } = result2;
    const obj = {};
    list2.forEach(
      (client) => (obj[client.id] = `${client.first_name} ${client.last_name}`)
    );

    setClients(obj);

    sdk.setTable("doc_type");
    const result3 = await sdk.callRestAPI(
      {
        // page: pageNum,
        // limit: limitNum,
      },
      "PAGINATE"
    );

    const { list: list3 } = result3;
    console.log(list3);
    if (!list3[0]?.configuration) {
      let arr = [{ value: "", label: "All" }];
      arr = arr.concat(
        list3.map((doctype) => {
          return { label: doctype.name, value: doctype.id };
        })
      );
      setDocTypes(arr);
      if (!data) {
        docTypesRef?.current?.setValue(arr[0]);
      }
    }

    sdk.setTable("tag");

    (async () => {
      const tagResult = await sdk.callRestAPI(
        {
          // page: pageNum,
          // limit: limitNum,
        },
        "PAGINATE"
      );

      const { list } = tagResult;

      if (!list[0]?.configuration) {
        let arr = [];
        list.forEach((val) => {
          arr.push({ label: val.name, value: val.id });
        });

        setTags(arr);

        console.log(list);
      }
    })();
  };

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
      navigate(`/admin/documents/${id}`);
    } else {
      const docUrl = contracts?.doc_url;
      const fileType = docUrl
        .substring(docUrl.lastIndexOf(".") + 1)
        .toLowerCase();

      if (fileType === "doc" || fileType === "docx") {
        navigate(`/admin/documents/${id}`);
      } else {
        window.open(docUrl, "_blank");
      }
    }
  }

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
      navigate(`/admin/executed_documents/${id}`);
    } else {
      const executedDocUrl = contracts?.executed_doc_url;
      const fileType = executedDocUrl
        .substring(executedDocUrl.lastIndexOf(".") + 1)
        .toLowerCase();

      if (fileType === "doc" || fileType === "docx") {
        navigate(`/admin/executed_documents/${id}`);
      } else {
        window.open(executedDocUrl, "_blank");
      }
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "documents",
      },
    });
    getClient();
    getAllLawfirm();
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
        <h4 className="text-2xl font-medium">Search Documents</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Search By Firm Name
            </label>
            <Select options={lawFirmData} ref={lawFirmRef} />
          </div>

          {/* <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Date Added
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
          </div> */}

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="date"
            >
              Date Added
            </label>
            <input
              placeholder=""
              type="date"
              {...register("date")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.date?.message ? "border-red-500" : ""
              }`}
            />
          </div>
          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Doc Type
            </label>
            <Select options={docTypes} ref={docTypesRef} />
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Client First Name
            </label>
            <input
              placeholder=""
              {...register("firstName")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.firstName?.message ? "border-red-500" : ""
              }`}
            />
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Client Last Name
            </label>
            <input
              placeholder=""
              {...register("lastName")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.lastName?.message ? "border-red-500" : ""
              }`}
            />
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Project Name
            </label>
            <input
              placeholder=""
              {...register("project_name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.id?.message ? "border-red-500" : ""
              }`}
            />
          </div>

          <div
            className="mb-4 w-full md:w-1/2 pr-2 pl-2"
            style={{ width: "40%" }}
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="office"
            >
              Tags
            </label>
            <Select options={tags} ref={tagRef} />

            <p className="text-red-500 text-xs italic">
              {errors.law_firm?.message}
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
            tagRef.current.setValue("");
            docTypesRef.current.setValue("");
            lawFirmRef.current.setValue(lawFirmData[0]);
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
          <h4 className="text-2xl font-medium">Documents</h4>
          {/* <AddButton link={"/admin/add-law_firm"} /> */}
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
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
                            <div className="flex flex-col gap-3">
                              {row.status == 1 && (
                                // <Link
                                //   className="text-xs underline text-[#4a5fe6] hover:text-purple-700 duration-200"
                                //   to={"/admin/executed_documents/" + row.id}
                                // >
                                //   View Executed document
                                // </Link>
                                <button
                                  // to={`/admin/documents/${row.id}`}
                                  onClick={() => openExecutedDocument(row.id)}
                                  className="text-xs text-[#4a5fe6] underline capitalize hover:text-purple-700 duration-200"
                                >
                                  View Executed document
                                </button>
                              )}

                              {/* <Link
                                to={`/admin/documents/${row.id}`}
                                className="text-xs text-[#4a5fe6] underline capitalize hover:text-purple-700 duration-200"
                              >
                                view Document
                              </Link> */}
                              <button
                                // to={`/admin/documents/${row.id}`}
                                onClick={() => openDocument(row.id)}
                                className="text-xs text-[#4a5fe6] underline capitalize hover:text-purple-700 duration-200"
                              >
                                view Document
                              </button>
                            </div>
                          </td>
                        );
                      }
                      if (cell.accessor === "client_id") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {`${row["client_first_name"] || ""} ${
                              row["client_last_name"] || ""
                            }`}
                          </td>
                        );
                      }
                      if (cell.accessor === "lawfirm_name") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {(row.lawfirm_first_name || "") +
                              " " +
                              (row.lawfirm_last_name || "")}
                          </td>
                        );
                      }
                      if (cell.accessor === "create_at") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {moment(row[cell.accessor]).format("MM/DD/YYYY")}
                          </td>
                        );
                      }

                      if (cell.accessor === "tag") {
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
                                  "/admin/document_client_tags/" + row.id,
                                  {
                                    state: row,
                                  }
                                );
                              }}
                            >
                              {" "}
                              View Client's Tags
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

export default AdminDocumentsListPage;
