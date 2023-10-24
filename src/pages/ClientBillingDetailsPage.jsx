import React, { useState } from "react";
import { useLocation } from "react-router";
import { useSearchParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";

let sdk = new MkdSDK();

const ClientBillingDetailsPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [total, setTotal] = useState(0);
  const [lawfirmProjects, setLawfirmProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const [searchParams] = useSearchParams();

  async function getData() {
    setLoading(true);
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/client/invoice-details`,
        {
          where: [
            `forkfirm_contract.client_id=${
              searchParams.get("client_id") ?? user_id
            }`,
          ],
          date: searchParams.get("generated_at") ?? "0000-00-00",
          page: 1,
          limit: 10000,
        },
        "POST"
      );

      setLawfirmProjects(
        Object.entries(
          result.list.reduce((r, s) => {
            r[s.lawfirm_email] = r[s.lawfirm_email] || [];
            r[s.lawfirm_email].push(s);
            return r;
          }, Object.create(null))
        )
      );

      console.log(
        Object.entries(
          result.list.reduce((r, s) => {
            r[s.lawfirm_email] = r[s.lawfirm_email] || [];
            r[s.lawfirm_email].push(s);
            return r;
          }, Object.create(null))
        )
      );

      setTotal(result.list.reduce((acc, curr) => acc + curr.charged_amount, 0));

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "billing",
      },
    });

    getData();
  }, []);

  return (
    <div className="p-5 bg-white shadow rounded mb-10">
      <h4 className="text-2xl font-semibold mb-5 ">Billing History</h4>
      <div className=" w-full max-w-3xl mx-auto border border-solid border-[#d0d0d0] py-5  px-10 ">
        <h4 className="text-2xl font-semibold mb-5 ">Invoice</h4>
        {lawfirmProjects.map(([lawfirmMail, projects]) => {
          return (
            <>
              {/* <ul>
                <li className=" flex justify-between items-center ">
                  <p className=" text-[16px] font-medium ">
                    # {projects[0].id}
                  </p>
                  <p className=" text-[16px] font-medium ">
                    {searchParams.get("generated_at") ?? "0000-00-00"}
                  </p>
                </li>
              </ul> */}
              <ul className="mt-5">
                <li className=" flex items-center mb-2 ">
                  <p className=" text-[16px] font-medium ">
                    Law firm Name :
                    <span className="ml-1  font-normal ">
                      {projects[0].lawfirm_first_name ?? ""}{" "}
                      {projects[0].lawfirm_last_name ?? ""}
                    </span>
                  </p>
                </li>
                <li className=" flex items-center mb-2 ">
                  <p className=" text-[16px] font-medium ">
                    Office :
                    <span className="ml-1  font-normal ">
                      {projects[0].base_office}
                    </span>
                  </p>
                </li>
                <li className=" flex items-center mb-2 ">
                  <p className=" text-[16px] font-medium ">
                    Law firm email :
                    <span className="ml-1  font-normal ">{lawfirmMail}</span>
                  </p>
                </li>
              </ul>
              <ul className="mt-5">
                <h4 className="text-xl font-bold mb-2 ">Client</h4>
                <li className=" flex justify-between items-center ">
                  <p className=" text-[16px] font-medium ">
                    Client Name{" "}
                    <span className="ml-1  font-normal ">
                      {projects[0].client_first_name ?? ""}{" "}
                      {projects[0].client_last_name ?? ""}
                    </span>{" "}
                  </p>
                  <p className=" text-[16px] font-medium ">
                    Client Email{" "}
                    <span className="ml-1  font-normal ">
                      {projects[0].client_email}
                    </span>{" "}
                  </p>
                </li>
              </ul>
              <ul className="mt-5">
                <h4 className="text-xl font-bold mb-2 ">Details</h4>
              </ul>
              <ul className="mt-5">
                <li className=" flex justify-between items-center border-b-2 border-solid border-[#111] px-1 py-2  ">
                  <h5 className=" font-bold ">Description</h5>
                  <h5 className=" font-bold ">Charges</h5>
                </li>
              </ul>

              {projects.map((project) => (
                <ul>
                  <li className=" flex justify-between items-center px-1 py-2  ">
                    {project.project_name && (
                      <h5 className=" font-bold ">{project.project_name}</h5>
                    )}

                    {project.charged_amount && (
                      <h5 className=" font-bold ">
                        $
                        {project.hour > 0 ? project.rate + "/hr" : project.rate}
                      </h5>
                    )}
                  </li>
                  {project.counter_party_name && (
                    <li className=" flex justify-between items-center px-10 py-2  ">
                      <h5 className="">
                        Counter Party : {project.counter_party_name}
                      </h5>
                    </li>
                  )}
                  {project.hour > 0 && (
                    <li className=" flex justify-between items-center px-10 py-2  ">
                      <h5 className="">Number of hours : {project.hour}</h5>
                    </li>
                  )}
                  {project.project_name && (
                    <li className=" flex justify-between items-center px-10 py-2  ">
                      <h5 className="">Project : {project.project_name}</h5>
                    </li>
                  )}

                  <li className=" flex justify-between items-center px-10 py-2  ">
                    <h5 className="">Expedited</h5>
                    <h5 className="">
                      {project.delivery === 1 ? "+ 50%" : "0%"}
                    </h5>
                  </li>
                  {project.charged_amount && (
                    <li className=" flex justify-between items-center px-10 py-2 border-b-2 border-solid border-[#111] ">
                      <h5 className=" font-semibold ">Total</h5>
                      <h5 className="font-semibold">
                        ${project.charged_amount}
                      </h5>
                    </li>
                  )}
                </ul>
              ))}
            </>
          );
        })}
        {lawfirmProjects.length > 0 && (
          <ul>
            <li className=" flex justify-between items-center px-10 py-2 mt-4  border-b-2 border-solid border-[#111] ">
              <h5 className=" font-semibold ">Net Total </h5>
              <h5 className="font-semibold">${total}</h5>
            </li>
            <li className=" flex justify-between items-center px-10 py-2 mt-3 ">
              <h5 className=" font-semibold ">Total Payable Amount </h5>
              <h5 className="font-semibold">${total}</h5>
            </li>
          </ul>
        )}

        {!loading && lawfirmProjects.length === 0 && (
          <>
            <p className=" capitalize ">You Don't have any invoice</p>
          </>
        )}
        {loading && (
          <>
            <p className=" capitalize ">Loading...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientBillingDetailsPage;
