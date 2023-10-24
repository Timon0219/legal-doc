import React from "react";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { useState } from "react";
import { tokenExpireError } from "../authContext";
import DownloadButton from "../components/DownloadButton";
import { csvFileMake } from "../utils/utils";
import moment from "moment";
import { saveAs } from "file-saver";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Lawfirm",
    accessor: "name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Doc Type",
    accessor: "doc_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Expedited",
    accessor: "1",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: { 0: "0", 1: "0", 2: "String" },
  },
  {
    header: "Standard",
    accessor: "0",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: { 0: "0", 1: "0", 2: "String" },
  },
  {
    header: "Total",
    accessor: "total",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
];
const columns2 = [
  {
    header: "Client",
    accessor: "client_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Contract Id",
    accessor: "contract_id",
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
  // {
  //   header: "Turnaround Time",
  //   accessor: "turnaround_time",
  //   isSorted: false,
  //   isSortedDesc: false,
  //   days: true,
  //   mappingExist: false,
  //   mappings: {},
  // },
  {
    header: "Doc type",
    accessor: "doc_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Delivery Type",
    accessor: "delivery",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: "Standard ", 1: "Expedited" },
  },
  {
    header: "Tags",
    accessor: "tags",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
];

const defaultDate = [
  { value: "1 month", label: "1 month" },
  { value: "3 month", label: "3 month" },
];
const AdminCustomReportingPage = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setCurrentTableData] = React.useState([]);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [docTypes, setDocTypes] = React.useState([]);
  const [lawfirms, setLawfirms] = React.useState([]);
  const [lawfirm, setLawfirm] = React.useState("");
  const [lawfirmName, setLawfirmName] = React.useState("");
  const [clients, setClients] = React.useState([]);
  const [client, setClient] = React.useState("");
  const [allDocTypes, setAllDocTypes] = React.useState([]);
  const [selectedDoc, setSelectedDoc] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const [selectedTags, setSelectedTags] = React.useState("");
  const [count, setCount] = React.useState("");
  const [submitData, setSubmitData] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const schema = yup.object({
    start_date: yup
      .string()
      .matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, "Date Format MM/DD/YYYY")
      .transform((val) => (!!val ? val : null))
      .nullable(),
    end_date: yup
      .string()
      .matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, "Date Format MM/DD/YYYY")
      .transform((val) => (!!val ? val : null))
      .nullable(),
  });
  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  async function getTableList(data) {
    setLoading(true);
    try {
      const result2 = await sdk.callRawAPI(
        `/v2/api/forkfirm/lawfirm/tag-count/PAGINATE`,
        {
          where: {
            "lawfirm.id": lawfirm,
            "forkfirm_contract.client_id": data.client ? data.client : null,
            "forkfirm_tag.id": data.tag ? data.tag : null,
            "forkfirm_contract.doc_type_id": data.doc ? data.doc : null,
          },
          start_date: data.start_date ? data.start_date : null,
          end_date: data.end_date ? data.end_date : null,
          page: 1,
          limit: 10,
          sortId: null,
          direction: null,
          groupBy: "forkfirm_contract.id",
        },
        "POST"
      );
      if (result2) {
        setLoading(false);
      }
      const { list: listTable } = result2;
      console.log("result", result2);
      setCurrentTableData(listTable);
    } catch (error) {
      setLoading(false);
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = async (data) => {
    setSubmitData(data);
    if (lawfirm) {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/lawfirm/doc-type-count/PAGINATE`,
        {
          where: {
            "lawfirm.id": lawfirm,
          },
          start_date: data.start_date ? data.start_date : null,
          end_date: data.end_date ? data.end_date : null,
          page: 1,
          limit: 10,
          sortId: null,
          direction: null,
          groupBy: "forkfirm_contract.doc_type_id, delivery",
        },
        "POST"
      );
      setDocTypes(result.data);
      getTableList(data);
      setShowForm(false);
    } else {
      showToast(globalDispatch, "Select A Lawfirm");
    }
  };

  const getLawfirm = async () => {
    try {
      sdk.setTable("lawfirm");
      const result = await sdk.callRestAPI(
        {
          where: [],
          page: 1,
          limit: 9999999,
        },
        "PAGINATE"
      );

      const { list, total, limit, num_pages, page } = result;
      let clientOptions = [];
      list.map((item) =>
        clientOptions.push({
          value: item.id,
          label: `${item.first_name ? item.first_name : ""} ${
            item.last_name ? item.last_name : ""
          }`,
        })
      );
      setLawfirms(clientOptions);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };
  async function getClients(data) {
    try {
      console.log(data);
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? ` ${
                  data.user_id
                    ? `forkfirm_law_firm_client.law_firm_id=${data.user_id}`
                    : "1"
                } `
              : "1",
          ],
          page: 1,
          limit: 9999999,
        },
        "VIEWCLIENTLAWFIRMS"
      );

      const { list, total, limit, num_pages, page } = result;
      let clientOptions = [];
      list.map((item) =>
        clientOptions.push({
          value: item.id,
          label: `${item.first_name ? item.first_name : ""} ${
            item.last_name ? item.last_name : ""
          }`,
        })
      );
      setClients(clientOptions);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }
  async function getDocType() {
    sdk.setTable("doc_type");
    try {
      const result = await sdk.callRestAPI(
        {
          // page: 1,
          limit: 9999999,
        },
        "PAGINATE"
      );

      const { list, total, limit, num_pages, page } = result;
      let clientOptions = [];
      list.map((item) =>
        clientOptions.push({
          value: item.id,
          label: item.name,
        })
      );
      setAllDocTypes(clientOptions);
    } catch (error) {
      console.log("ERROR", error);
      // tokenExpireError(dispatch, error.message);
    }
  }
  async function getTags() {
    sdk.setTable("tag");
    try {
      const result2 = await sdk.callRestAPI(
        {
          // page: 1,
          limit: 999999,
        },
        "PAGINATE"
      );

      const { list, total, limit, num_pages, page } = result2;
      let clientOptions2 = [];
      list.map((item) =>
        clientOptions2.push({
          value: item.id,
          label: item.name,
        })
      );
      setTags(clientOptions2);
    } catch (error) {
      console.log("ERROR", error);
    }
  }

  const searchTableList = (e) => {
    e.preventDefault();
    const newValue = {
      client: client.value,
      doc: selectedDoc.value,
      tag: selectedTags.value,
      ...submitData,
    };
    console.log(newValue);
    setCount(newValue);
    getTableList(newValue);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "custom_reporting",
      },
    });
    getLawfirm();
    getDocType();
  }, []);
  React.useEffect(() => {
    if (allDocTypes.length > 0) {
      getTags();
    }
  }, [allDocTypes]);

  React.useEffect(() => {
    if (lawfirm) {
      getClients({ user_id: lawfirm });
    }
  }, [lawfirm]);

  const handleReset = () => {
    setShowForm(true);
    setDocTypes([]);
    setCurrentTableData([]);
    setCount("");
    // reset();
    setLawfirm("");
  };

  const exportCSV = async () => {
    let newDocType = [];
    docTypes.map((item) => {
      newDocType.push({
        standard: item["0"],
        expedited: item["1"],
        doc_name: item.doc_name,
        first_name: item.first_name,
        last_name: item.last_name,
        total: item.total,
      });
    });
    if (docTypes.length === newDocType.length) {
      csvFileMake(newDocType);
    }
  };
  const exportCSV2 = async () => {
    let newDocType = [];
    data.map((item) => {
      const {
        id,
        oauth,
        role,
        first_name,
        last_name,
        email,
        type,
        verify,
        phone,
        photo,
        refer,
        stripe_uid,
        paypal_uid,
        two_factor_authentication,
        status,
        create_at,
        update_at,
        tags,
        doc_name,
        contract_id,
        client_first_name,
        client_id,
        client_last_name,
        project_name,
        turnaround_time,
        delivery,
      } = item;
      newDocType.push({
        "lawfirm name": `${first_name} ${last_name ? last_name : ""}`,
        tags,
        doc_name,
        contract_id,
        client_id,
        "client name": `${client_first_name} ${
          client_last_name ? client_last_name : ""
        }`,
        project_name,
        turnaround_time,
        delivery,
      });
    });
    if (data.length === newDocType.length) {
      csvFileMake(newDocType);
    }
  };

  async function exportTagCount() {
    try {
      await sdk.exportRawCSVFile("/v2/api/forkfirm/lawfirm/tag-count/EXPORT", {
        where: {
          "lawfirm.id": lawfirm,
        },
        start_date: startDate,
        end_date: endDate,
        page: 1,
        limit: 10000,
        sortId: null,
        direction: null,
        groupBy: "forkfirm_contract.id",
      });
    } catch (err) {}
  }

  async function exportDocType() {
    console.log("exporting here");
    try {
      await sdk.exportRawCSVFile(
        "/v2/api/forkfirm/lawfirm/doc-type-count/EXPORT",
        {
          where: {
            "lawfirm.id": lawfirm,
          },
          start_date: startDate,
          end_date: endDate,
          page: 1,
          limit: 10000,
          sortId: null,
          direction: null,
          groupBy: "forkfirm_contract.doc_type_id, delivery",
        }
      );
    } catch (err) {
      showToast(globalDispatch, err.message);
    }
  }

  return (
    <>
      {showForm && (
        <form
          className="p-5 bg-white shadow rounded mb-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h4 className="text-2xl font-medium">Custom Reporting</h4>
          <div className="filter-form-holder mt-10 flex flex-wrap max-w-5xl">
            <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                htmlFor="office"
              >
                Select Lawfirm
              </label>
              <Select
                onChange={(e) => {
                  setLawfirm(e.value);
                  setLawfirmName(e.label);
                }}
                options={lawfirms}
              />

              <p className="text-red-500 text-xs italic">
                {errors.law_firm?.message}
              </p>
            </div>
            <div className="w-1/2"></div>

            <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                htmlFor="start_date"
              >
                From
              </label>
              <input
                type="date"
                placeholder=""
                {...register("start_date")}
                className={`"shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline ${
                  errors.start_date?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-red-500 text-xs italic">
                {errors.start_date?.message}
              </p>
            </div>

            <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                htmlFor="end_date"
              >
                to
              </label>
              <input
                type="date"
                placeholder=""
                {...register("end_date")}
                className={`"shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline ${
                  errors.end_date?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-red-500 text-xs italic">
                {errors.end_date?.message}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Search
          </button>
        </form>
      )}
      {!showForm && (
        <div className="overflow-x-auto  p-5 bg-white shadow rounded">
          <div className="flex justify-end ">
            <button
              onClick={handleReset}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline capitalize "
            >
              back
            </button>
          </div>
          <div className="flex justify-between mt-4">
            <h4 className="text-2xl font-medium">
              Law firm {lawfirmName ? lawfirmName : ""} monthly report
            </h4>
            <DownloadButton handleClick={exportDocType} />
          </div>
          <div className="shadow overflow-x-auto border-b border-gray-200 mt-4">
            <table className="min-w-full divide-y divide-gray-200 mt-5">
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
                {docTypes &&
                  docTypes.map((row, i) => {
                    return (
                      <tr key={i}>
                        {columns.map((cell, index) => {
                          if (cell.accessor == "") {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                1
                              </td>
                            );
                          }
                          if (cell.accessor == "name") {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {row.first_name}{" "}
                                {row.last_name ? row.last_name : ""}
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
            {docTypes.length === 0 && (
              <>
                <p className=" capitalize px-10 py-3 text-xl ">
                  You Don't have any report
                </p>
              </>
            )}
          </div>

          <form
            className="mt-10  p-5 bg-white shadow rounded"
            onSubmit={searchTableList}
          >
            <h4 className="text-2xl font-medium"></h4>
            <div className="filter-form-holder mt-4 flex flex-wrap mb-8">
              <div className="mb-4 w-full md:w-1/3 pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                  htmlFor="office"
                >
                  Client Name
                </label>
                <Select
                  onChange={(e) => setClient(e)}
                  options={clients}
                  value={client}
                />

                <p className="text-red-500 text-xs italic">
                  {errors.law_firm?.message}
                </p>
              </div>
              <div className="mb-4 w-full md:w-1/3 pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                  htmlFor="office"
                >
                  Doc Type
                </label>
                <Select
                  onChange={(e) => setSelectedDoc(e)}
                  options={allDocTypes}
                  value={selectedDoc}
                />

                <p className="text-red-500 text-xs italic">
                  {errors.law_firm?.message}
                </p>
              </div>
              <div className="mb-4 w-full md:w-1/3 pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                  htmlFor="office"
                >
                  Tags
                </label>
                <Select
                  options={tags}
                  onChange={(e) => setSelectedTags(e)}
                  value={selectedTags}
                />

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
              type="button"
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => {
                getTableList({ client: null, ...submitData });
                setCount("");
                setClient("");
                setSelectedTags("");
                setSelectedDoc("");
              }}
            >
              Reset
            </button>
          </form>
          <div className="flex justify-between mt-8 ">
            {" "}
            <h4 className="text-2xl font-semibold  ">
              Report By Law firm Clients
            </h4>
            <DownloadButton handleClick={exportTagCount} />
          </div>
          {count && (
            <div className=" mt-4">
              {count.doc && (
                <h4 className="text-xl font-semibold">
                  Results for Selected Doc Type:{" "}
                  <span className=" font-normal ml-4 ">
                    {count.doc ? count.doc : "N/A"}
                  </span>
                </h4>
              )}
              {count.tag && (
                <h4 className="text-xl font-semibold">
                  Results for Selected Tags:{" "}
                  <span className=" font-normal ml-4 ">
                    {count.tag ? count.tag : "N/A"}
                  </span>
                </h4>
              )}

              <h4 className="text-xl font-semibold ">
                Results for applied filters:{" "}
                <span className=" font-normal ml-4 ">{data.length}</span>
              </h4>
            </div>
          )}

          <div className="shadow overflow-x-auto border-b border-gray-200 mt-10">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns2.map((column, i) => (
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
                {data &&
                  data.length > 0 &&
                  data.map((row, i) => {
                    return (
                      <tr key={i}>
                        {columns2.map((cell, index) => {
                          if (cell.accessor == "") {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                <button
                                  className="text-xs"
                                  style={{ textDecoration: "underline" }}
                                  onClick={async () => {
                                    console.log(row);
                                    sdk.setTable("tag");
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
                                </button>
                              </td>
                            );
                          }
                          if (cell.accessor == "turnaround_time") {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {row.executed_at
                                  ? moment
                                      .duration(
                                        moment(row.executed_at).diff(
                                          moment(row.create_at)
                                        )
                                      )
                                      .asHours() + " hr(s)"
                                  : "N/A"}
                              </td>
                            );
                          }
                          if (cell.accessor == "client_name") {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {row.client_first_name}{" "}
                                {row.client_last_name
                                  ? row.client_last_name
                                  : ""}
                              </td>
                            );
                          }
                          if (cell.days) {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {row[cell.accessor]
                                  ? row[cell.accessor] + " Days"
                                  : "N/A"}
                              </td>
                            );
                          }
                          if (cell.mappingExist) {
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                {cell.mappings[row[cell.accessor]]
                                  ? cell.mappings[row[cell.accessor]]
                                  : "N/A"}
                              </td>
                            );
                          }
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {row[cell.accessor] ? row[cell.accessor] : "N/A"}
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
                  You Don't have any report
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCustomReportingPage;
