import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";
import PaginationBar from "../components/PaginationBar";

const sdk = new MkdSDK();
const columns = [
  {
    header: "Client Name",
    accessor: "client_name",
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Primary Email",
    accessor: "primary_email",
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

const ViewLawFirmAttorneyAssignedClients = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup.object({}).required();

  const { dispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const clientRef = React.useRef(null);
  const [clients, setClients] = React.useState([]);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const user_id = JSON.parse(localStorage.getItem("user"));

  const params = useParams();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function getClient(data) {
    try {
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
          limit: 999999,
        },
        "VIEWCLIENTLAWFIRMS"
      );

      const { list, total, limit, num_pages, page } = result;
      console.log(list, "list");
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
      await getData(0, pageSize, { user_id: params.id });
    })();
  }

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(0, limit, { user_id: params.id });
    })();
  }

  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize, {
        user_id: params.id,
      });
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize,
        { user_id: params.id }
      );
    })();
  }
  async function getData(pageNum, limitNum, data) {
    setLoading(true);
    try {
      sdk.setTable("attorney/client");
      const result = await sdk.callRestAPI(
        {
          where: {
            "client.name": null,
            "client.first_name": data.client_name ? data.client_name : null,
            "client.last_name": data.last_name ? data.last_name : null,
            "client.email": data.primary_email ? data.primary_email : null,
            "attorney.id": data.user_id ? data.user_id : null,
            "client.id": null,
          },
          page: pageNum,
          limit: limitNum,
        },
        "PAGINATE"
      );
      if (result) {
        setLoading(false);
      }
      const { list, total, limit, num_pages, page } = result;

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

  const onSubmit = async () => {
    let clients;
    if (clientRef.current.getValue().length) {
      clients = clientRef.current.getValue();
    }

    let result;
    console.log(clients);
    sdk.setTable("attorney_client");
    for (let i of clients) {
      try {
        result = await sdk.callRestAPI(
          {
            client_id: i.value,
            attorney_id: Number(params.id),
          },
          "POST"
        );

        console.log(result);
      } catch (error) {
        console.log("Error", error);
        setError("law_firm_id", {
          type: "manual",
          message: error.message,
        });
        tokenExpireError(dispatch, error.message);
        break;
      }
    }

    if (!result.error) {
      showToast(globalDispatch, "Added");
      navigate("/lawfirm/attorneys");
    } else {
      if (result.validation) {
        const keys = Object.keys(result.validation);
        for (let i = 0; i < keys.length; i++) {
          const field = keys[i];
          setError(field, {
            type: "manual",
            message: result.validation[field],
          });
        }
      }
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "attorneys",
      },
    });

    (async function () {
      await getClient({ user_id });
    })();
  }, []);

  React.useEffect(() => {
    getData(1, pageSize, { user_id: params.id });
  }, [params.id]);

  return (
    <>
      {/* <div className=" shadow-md rounded  mx-auto p-5">
        <h4 className="text-2xl font-medium">Assign Client To an Attorney</h4>
        <form
          className="mt-4 w-full max-w-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor=""
            >
              Client
            </label>
            <Select options={clients} ref={clientRef} isMulti />

            <p className="text-red-500 text-xs italic">
              {errors.client?.message}
            </p>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </form>
      </div> */}
      <h4 className="text-2xl my-6 font-medium">Assigned Client</h4>
      <div className="shadow overflow-x-auto border-b border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 ">
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
                    {column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 &&
              data.map((row, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {`${row.first_name ? row.first_name : ""} ${
                      row.last_name ? row.last_name : ""
                    } `}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.email ? row.email : "n/a"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start justify-start flex-col ">
                      <button
                        className="text-xs underline"
                        onClick={() => {
                          navigate("/lawfirm/client_hours/" + row.id, {
                            state: row,
                          });
                        }}
                      >
                        View Hours
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && data.length === 0 && (
          <>
            <p className=" capitalize px-10 py-3 text-xl ">loading...</p>
          </>
        )}
        {!loading && data.length === 0 && (
          <>
            <p className=" capitalize px-10 py-3 text-xl ">
              You Don't have any client
            </p>
          </>
        )}
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

export default ViewLawFirmAttorneyAssignedClients;
