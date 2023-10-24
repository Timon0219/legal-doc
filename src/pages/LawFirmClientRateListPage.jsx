import React from "react";
import { AuthContext } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import AddButton from "../components/AddButton";
import PaginationBar from "../components/PaginationBar";

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
    header: "ClientId",
    accessor: "client_id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "DocTypeId",
    accessor: "doc_type_id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Rate",
    accessor: "rate",
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

const LawFirmClientRateListPage = () => {
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
  const [role, setRole] = React.useState(false);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  console.log(location);

  const schema = yup.object({
    client_id: yup.number().positive().integer(),
    doc_type_id: yup.number().positive().integer(),
    rate: yup.number().positive().integer(),
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
      sdk.setTable("client_rate");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.getClientRates({
        // payload: { id: parseInt(params.id) },
        where: [params.id ? `${`forkfirm_user.id = ${params.id}`}` : 1],
        page: pageNum,
        limit: limitNum,
        sortId: sortField.length ? sortField[0].accessor : "",
        direction: sortField.length
          ? sortField[0].isSortedDesc
            ? "DESC"
            : "ASC"
          : "",
      });

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
  React.useEffect(() => {
    sdk
      .handleGetUserRole(location.state.invited_by)
      .then((res) => setRole(res));
  }, [location.state.invited_by]);
  console.log(role);
  return (
    <>
      <section className="flex justify-between">
        <h4 className="text-2xl font-medium">View Client's Rates</h4>
        {role == "lawfirm" && location.state.current_law_firm_id == user_id && (
          <button
            className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {
              navigate("/lawfirm/edit_client_rate/" + params.id, {
                state: location.state,
              });
            }}
          >
            Edit Rates
          </button>
        )}
      </section>

      <section
        className="p-5 bg-white shadow rounded mb-10 mt-4"
        style={{ width: "50%" }}
      >
        <div className="flex font-bold justify-between mb-10">
          <h2>Client: </h2>
          <span>
            {location.state.first_name + " " + location.state.last_name}
          </span>
        </div>
        <section className="flex-col font-bold mt-4">
          <div className="flex justify-between">
            <span>Doc Types</span>
            <span>Price</span>
          </div>
          {data
            ? data.map((docType, index) => {
                if (docType.doc_name && docType.rate) {
                  return (
                    <div
                      className="flex justify-between mt-4 font-medium"
                      key={index}
                    >
                      <span>{docType.doc_name}</span>
                      <span>{docType.rate}</span>
                    </div>
                  );
                }
              })
            : ""}
        </section>
        <hr className="mt-4" />
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
      </section>
    </>
  );
};

export default LawFirmClientRateListPage;
