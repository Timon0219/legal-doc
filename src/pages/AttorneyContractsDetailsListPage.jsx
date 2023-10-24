import React from "react";
import { Link, useParams } from "react-router-dom";
import { GlobalContext } from "../globalContext";

const AttorneyContractsDetailsListPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const params = useParams();
  const { id } = params;

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "pending_contracts",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  return (
    <div className=" p-5 bg-white shadow rounded">
      <div className="grid grid-cols-2 gap-6 px-4 ">
        <div className="">
          <h1 className=" text-2xl  ">Contract Details</h1>
          <ul className="mt-5">
            <li className="flex items-center my-2 ">
              <span className=" font-medium mr-4 ">Contract Id:</span> 123
            </li>
            <li className="flex items-center my-2 ">
              <span className=" font-medium mr-4 ">Project Name:</span> Moon
            </li>
            <li className="flex items-center my-2 ">
              <span className=" font-medium mr-4 ">Client Name:</span> Client 1
            </li>
            <li className="flex items-center my-2 ">
              <span className=" font-medium mr-4 ">Current Status:</span>{" "}
              Escalated
              <Link
                to={`/attorney/contract_activity_log/${id}`}
                className=" text-[#2039a6] underline ml-2 "
              >
                View Activity Log
              </Link>
            </li>
            <li className="flex items-center my-2 ">
              <span className=" font-medium mr-4 ">Counter Paty:</span> abc
            </li>
            <li className="flex items-center my-2 flex-wrap ">
              <span className=" font-medium mr-4 ">Counter Party Emails: </span>{" "}
              <div className=" mt-2 border border-solid border-[#dbdbdb] p-3 flex justify-start  ">
                <span className=" mr-4 ">
                  <a href="mailto:ap@mga.com" className="underline">
                    ap@mga.com
                  </a>
                  ,
                </span>
                <span className=" mr-4 ">
                  <a href="mailto:ap@mga.com" className="underline">
                    ap@mga.com
                  </a>
                  ,
                </span>
                <span className=" mr-4 ">
                  <a href="mailto:ap@mga.com" className="underline">
                    ap@mga.com
                  </a>
                  ,
                </span>
              </div>
            </li>
            <li className="flex items-center my-2 ">
              <span className=" font-medium mr-4 ">Assigned Attorney: </span>{" "}
              abc
            </li>
            <li className="flex items-center my-2 ">
              <span className=" font-medium mr-4 ">Mark B:</span> abc
            </li>
          </ul>
        </div>
        <div className="">
          <div className="">
            <button className=" border border-solid border-[#c5c5c565] py-1 px-4 ">
              Download Original Doc
            </button>
            <button className=" border border-solid border-[#c5c5c565] py-1 px-4 ml-4 ">
              Upload Executed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttorneyContractsDetailsListPage;
