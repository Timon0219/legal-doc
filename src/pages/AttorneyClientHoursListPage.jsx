import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import AddButton from "../components/AddButton";
import moment from "moment/moment";

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
    header: "contract id",
    accessor: "contract_id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Hour",
    accessor: "hour",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Date",
    accessor: "date",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Description",
    accessor: "description",
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

const AttorneyClientHoursListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const [data, setCurrentTableData] = React.useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

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
      await getData(0, 10000, { user_id: id });
    })();
  }

  async function getData(pageNum, limitNum, data) {
    try {
      sdk.setTable("client_hours");
      let sortField = columns.filter((col) => col.isSorted);
      const result = await sdk.callRestAPI(
        {
          payload: {
            client_id: data.user_id ? data.user_id : null,
          },
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[0].accessor : "",
          direction: sortField.length
            ? sortField[0].isSortedDesc
              ? "DESC"
              : "ASC"
            : "",
        },
        "GETALL"
      );

      const { list } = result;

      setCurrentTableData(list);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    (async function () {
      await getData(1, 100000, { user_id: id });
    })();
  }, []);

  return (
    <>
      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Client Hours</h4>
          <AddButton link={"/attorney/add_hours"} />
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
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
                              onClick={() => {
                                navigate(
                                  "/attorney/edit_client_hours/" + row.id,
                                  {
                                    state: row,
                                  }
                                );
                              }}
                            >
                              {" "}
                              Edit
                            </button>
                          </td>
                        );
                      }
                      if (cell.accessor == "date") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {moment(row.date).format("MM/DD/yyyy")}
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
    </>
  );
};

export default AttorneyClientHoursListPage;
