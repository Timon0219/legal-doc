import React, { useRef } from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { checkingDate, dateHandle2, getNonNullValue } from "../utils/utils";
import PaginationBar from "../components/PaginationBar";
import UpArrow from "../components/svcIcon/UpArrow";
import DownArrow from "../components/svcIcon/DownArrow";
import moment from "moment";
import Select from "react-select";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Action",
    accessor: "",
    device: "small",
  },
  {
    header: "Originator",
    accessor: "originator_name",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Date Executed",
    accessor: "executed_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Project Name",
    accessor: "project_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Law firm",
    accessor: "lawfirm_first_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Counter Party",
    accessor: "counter_party_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Counter party email",
    accessor: "counter_party_emails",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
    mappings: {},
  },
  {
    header: "Terminates At",
    accessor: "terminated_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Doc Type",
    accessor: "doc_type",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
    device: "large",
  },
  {
    header: "Tags",
    accessor: "tag",
  },
];

const SubclientExecutedContractsListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);

  const [selectArrow, setSelectArrow] = React.useState(true);
  const [docType, setDocType] = React.useState([]);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [subclient, setSubclient] = React.useState();
  const navigate = useNavigate();
  const [tags, setTags] = React.useState([]);
  const tagRef = useRef(null);

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
    if (columns[columnIndex].isSorted) {
      columns[columnIndex].isSortedDesc = !columns[columnIndex].isSortedDesc;
    } else {
      columns.map((i) => (i.isSorted = false));
      columns.map((i) => (i.isSortedDesc = false));
      columns[columnIndex].isSorted = true;
    }

    (async function () {
      await getData(0, pageSize, { user_id, status: 1 });
    })();
  }

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(0, limit, { user_id, status: 1 });
    })();
  }

  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize, {
        user_id,
        status: 1,
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

  const user_id = JSON.parse(localStorage.getItem("user"));
  async function getData(pageNum, limitNum, data) {
    console.log(data);
    setLoading(true);
    try {
      sdk.setTable("contract"); //;
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? `${
                  data.user_id
                    ? `forkfirm_contract.client_id=${subclient.client_id}`
                    : 1
                } AND ${`forkfirm_contract.status=${1}`}
                `
              : 1,
          ],
          page: pageNum,
          limit: limitNum,
        },
        "PAGINATE"
      );

      if (result) {
        setLoading(false);
      }
      const { list, total, limit, num_pages, page } = result;
      console.log(list);

      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
      const clientTagsList = list[0].client_tag.split(",");
      const clientTags = clientTagsList.map((singleTag) => {
        const splitTag = singleTag.split("|");
        return {
          tag_id: splitTag[1],
          tag: splitTag[0],
          input_type: splitTag[2],
        };
      });

      // FUNCTION TO GET TAGS
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

          // Filter tags that aren't in this client.
          const newTagList = clientTags.map((clientTag) => {
            const hasTag = arr.find((tag) => +clientTag.tag_id === +tag.value);
            return hasTag && hasTag;
          });
          setTags(newTagList);
        }
      })();
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  async function searchData(pageNum, limitNum, data) {
    console.log(data);
    setLoading(true);
    try {
      sdk.setTable("contract"); //;
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? `${
                  data.user_id
                    ? `forkfirm_contract.client_id=${subclient.client_id}`
                    : 1
                } AND ${`forkfirm_contract.status=${1}`}
                  AND ${`forkfirm_contract.status=${data.status}`}  AND ${
                  data.originator
                    ? `forkfirm_contract.originator_name LIKE '%${data.originator}%'`
                    : "1"
                } AND ${
                  data.project_name
                    ? `forkfirm_contract.project_name LIKE '%${data.project_name}%'`
                    : "1"
                } AND ${
                  data.counter_party_name
                    ? `forkfirm_contract.counter_party_name LIKE '%${data.counter_party_name}%'`
                    : "1"
                } AND ${
                  data.doc_type_id
                    ? `forkfirm_doc_type.id  = '${data.doc_type_id}'`
                    : "1"
                }
AND ${data.tag ? `forkfirm_tag.name LIKE '%${data.tag}%'` : "1"}
                `
              : 1,
          ],
          page: pageNum,
          limit: limitNum,
        },
        "PAGINATE"
      );

      if (result) {
        setLoading(false);
      }
      const { list, total, limit, num_pages, page } = result;
      console.log(list);

      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
      const clientTagsList = list[0].client_tag.split(",");
      const clientTags = clientTagsList.map((singleTag) => {
        const splitTag = singleTag.split("|");
        return {
          tag_id: splitTag[1],
          tag: splitTag[0],
          input_type: splitTag[2],
        };
      });

      // FUNCTION TO GET TAGS
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

          // Filter tags that aren't in this client.
          const newTagList = clientTags.map((clientTag) => {
            const hasTag = arr.find((tag) => +clientTag.tag_id === +tag.value);
            return hasTag && hasTag;
          });
          setTags(newTagList);
        }
      })();
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    console.log(data);
    let tag = "";
    let counter_party = getNonNullValue(data.counter_party);
    let doc_type = getNonNullValue(data.doc_type);
    let project_name = getNonNullValue(data.project_name);
    let originator = getNonNullValue(data.originator);
    if (tagRef.current.getValue().length) {
      tag = tagRef.current.getValue()[0].label;
    }
    let filter = {
      counter_party_name: counter_party,
      doc_type_id: doc_type,
      originator: originator,
      project_name: project_name,
      user_id,
      status: 1,
      tag: tag ? tag : undefined,
    };
    searchData(1, pageSize, filter);
  };

  const filterDocTypeHandle = (docId) => {
    const newItem = docType.filter((item) => docId === item.id);
    // console.log(newItem);
    return newItem.length > 0 ? newItem[0].name : "N/A";
  };
  const getDocType = async () => {
    try {
      sdk.setTable("doc_type");
      const result = await sdk.callRestAPI("", "GETALL");
      setDocType(result?.list?.filter((res) => !res.client_id));
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  async function getSubclient() {
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/admin/client/subclient`,
        {
          where: [`subclient.id  = ${user_id}`],
          groupBy: `subclient.id`,
          page: 1,
          limit: 10,
        },
        "POST"
      );

      const { list } = result;

      setSubclient(list.filter((item) => item.id === user_id)[0]);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
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
      navigate(`/subclient/view_executed_document/${id}`);
    } else {
      const executedDocUrl = contracts?.executed_doc_url;
      const fileType = executedDocUrl
        .substring(executedDocUrl.lastIndexOf(".") + 1)
        .toLowerCase();

      if (fileType === "doc" || fileType === "docx") {
        navigate(`/subclient/view_executed_document/${id}`);
      } else {
        window.open(executedDocUrl, "_blank");
      }
    }
  }

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
      navigate(`/subclient/view_document/${id}`);
    } else {
      window.open(contracts?.doc_url, "__blank");
    }
  }

  React.useEffect(() => {
    getSubclient();
  }, []);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "executed_contracts",
      },
    });

    if (subclient) {
      (async function () {
        await getData(1, pageSize, { user_id: subclient.client_id, status: 1 });
      })();
    }

    (async function () {
      await getDocType();
    })();
  }, [subclient]);

  const handleReset = async () => {
    tagRef.current.setValue("");
    reset();
    await getData(1, pageSize, { user_id, status: 1 });
  };

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10 max-w-5xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search Executed Contracts</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="originator"
            >
              Originator
            </label>
            <input
              placeholder="originator"
              id="originator"
              {...register("originator")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.originator?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.originator?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2 relative">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="doc_type"
            >
              Filter By Doc Type
            </label>
            <select
              id="doc_type"
              placeholder="Doc Type"
              onFocus={() => setSelectArrow(!selectArrow)}
              onClick={() => setSelectArrow(!selectArrow)}
              {...register("doc_type")}
              className={`bg-white cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline capitalize ${
                errors.doc_type?.message ? "border-red-500" : ""
              }`}
              defaultValue=""
            >
              <option value="">Select doc type</option>
              {docType.length > 0 &&
                docType.map((item, i) => (
                  <option key={i} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>

            {selectArrow ? (
              <span className=" absolute top-[58%] right-5">
                <UpArrow />
              </span>
            ) : (
              <span className=" absolute top-[58%] right-5">
                <DownArrow />
              </span>
            )}

            <p className="text-red-500 text-xs italic">
              {errors.doc_type?.message}
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="project_name"
            >
              Project Name
            </label>
            <input
              placeholder="Project Name"
              id="project_name"
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
              htmlFor="counter_party"
            >
              Counter Party
            </label>
            <input
              placeholder="Counter Party"
              id="counter_party"
              {...register("counter_party")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.counter_party?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.counter_party?.message}
            </p>
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
        <div className="items-center flex mb-3">
          <h4 className="text-2xl font-medium">Executed Contracts</h4>
          <p className="ml-7 relative before:contents-[''] before:bg-red-500 before:h-3 before:w-3 before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-14%] before:z-[5] after:contents-[''] after:bg-red-300 after:h-3 after:w-3 after:absolute after:top-1/2 after:-translate-y-[15%] after:z-[2] after:left-[-12%] capitalize ">
            {" "}
            30 days left to expiry{" "}
          </p>
          <p className="ml-7 relative before:contents-[''] before:bg-[#d5ce00] before:h-3 before:w-3 before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-14%] before:z-[5] after:contents-[''] after:bg-[#d5ce0042] after:h-3 after:w-3 after:absolute after:top-1/2 after:-translate-y-[15%] after:z-[2] after:left-[-12%] capitalize ">
            {" "}
            60 days left to expiry{" "}
          </p>
        </div>
        <div className="shadow  border-b border-gray-200 ">
          <div className="overflow-x-auto block w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, i) => {
                    if (column.accessor == "") {
                      if (column.device == "small") {
                        return (
                          <th
                            key={i}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 2xl:hidden "
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
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden 2xl:block"
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
                    } else {
                      return (
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
                      );
                    }
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.length > 0 &&
                  data.map((row, i) => {
                    let rowTags = row?.contract_tag?.split(",");
                    let definedRowTags = rowTags?.map((rowTag) => {
                      let rowInfo = rowTag?.split("|");
                      return {
                        name: rowInfo[0],
                        id: rowInfo[1],
                        type: rowInfo[2],
                        value: rowInfo[3],
                      };
                    });

                    let durationTag = definedRowTags?.find(
                      (tag) => tag.name.toLowerCase() === "duration"
                    );

                    return (
                      <tr
                        key={i}
                        className={
                          row.terminated_at
                            ? checkingDate(
                                moment(row.executed_at).add(
                                  +durationTag?.value || 12,
                                  "M"
                                )
                              )
                            : " null"
                        }
                      >
                        <td className="2xl:hidden px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-3">
                            {/* <Link
                            to={`/subclient/view_document/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                          >
                            view Document
                          </Link> */}
                            {/* <button
                              onClick={() => openDocument(row.id)}
                              className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                            >
                              view Document
                            </button> */}
                            {/* <Link
                            to={`/subclient/view_executed_document/${row.id}`}
                            className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                          >
                            view executed Document
                          </Link> */}
                            <button
                              onClick={() => openExecutedDocument(row.id)}
                              className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                            >
                              view executed Document
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.originator_name ?? "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {moment(row.executed_at).format("MM/DD/yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.project_name === null ? "N/A" : row.project_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.lawfirm_first_name === null
                            ? "N/A"
                            : row.lawfirm_first_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.counter_party_name === null
                            ? "N/A"
                            : row.counter_party_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start">
                            <button
                              className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100"
                              onClick={() => {
                                navigate(
                                  "/subclient/edit_contracts/" + row.id,
                                  {
                                    state: row,
                                  }
                                );
                              }}
                            >
                              View all Edit
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.terminated_at == null
                            ? "N/A"
                            : moment(row.executed_at)
                                .add(+durationTag?.value || 12, "M")
                                .format("MM/DD/yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.doc_type_id === null && docType.length > 0
                            ? "n/a"
                            : filterDocTypeHandle(row.doc_type_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden 2xl:block  ">
                          <div className="flex flex-col items-start gap-3">
                            <Link
                              to={`/subclient/view_document/${row.id}`}
                              className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                            >
                              view Document
                            </Link>
                            <Link
                              to={`/subclient/view_executed_document/${row.id}`}
                              className="text-xs text-[#4a5fe6] underline hover:text-purple-500 duration-100 capitalize "
                            >
                              view executed Document
                            </Link>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="text-xs"
                            style={{ textDecoration: "underline" }}
                            onClick={() => {
                              navigate(
                                "/subclient/document_client_tags/" + row.id,
                                {
                                  state: row,
                                }
                              );
                            }}
                          >
                            {" "}
                            View Tags
                          </button>
                        </td>
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
                  You Don't have any Contracts
                </p>
              </>
            )}
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

export default SubclientExecutedContractsListPage;

// AND
// ${`forkfirm_contract.status=${data.status}`}  AND ${
//   data.originator
//     ? `forkfirm_contract.originator_name LIKE '%${data.originator}%'`
//     : "1"
// } AND ${
//   data.project_name
//     ? `forkfirm_contract.project_name LIKE '%${data.project_name}%'`
//     : "1"
// } AND ${
//   data.counter_party_name
//     ? `forkfirm_contract.counter_party_name LIKE '%${data.counter_party_name}%'`
//     : "1"
// } AND ${
//   data.doc_type_id
//     ? `forkfirm_doc_type.id  = '${data.doc_type_id}'`
//     : "1"
// }
// AND ${
//   data.tag ? `forkfirm_tag.name LIKE '%${data.tag}%'` : "1"
// }
