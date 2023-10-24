import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useParams } from "react-router-dom";
import { GlobalContext } from "../globalContext";

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
    header: "Tag",
    accessor: "tag",
  },
  {
    header: "Input Type",
    accessor: "input_type",
    mappingExist: true,
    mappings: { 0: "Month", 1: "Year", 2: "String", 3: "Binary" },
    mapping: ["Month", "Year", "String", "Binary"],
  },
  {
    header: "Input Duration",
    accessor: "input_duration",
  },
];
const binary = { 0: "No", 1: "Yes" };

const ClientDocumentClientTagsListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [data, setCurrentTableData] = React.useState([]);
  const params = useParams();

  async function getData() {
    try {
      const result = await sdk.callJoinRestAPI(
        "contract_tag",
        "tag",
        "tag_id",
        "id",
        "contract_tag.*, name as tag",
        [`contract_tag.contract_id = ${params.id}`]
      );
      console.log("DATA", result.list);

      if (Array.isArray(result.list)) {
        setCurrentTableData(result.list);
        console.log("DATA", data);
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "documents",
      },
    });
    getData();
  }, []);

  return (
    <>
      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Contract Tags</h4>
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

                      if (cell.accessor === "input_duration") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row[cell.accessor] && row[cell.accessor] !== "0"
                              ? row.input_type == 3
                                ? binary[row[cell.accessor]]
                                : row[cell.accessor]
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
    </>
  );
};

export default ClientDocumentClientTagsListPage;
