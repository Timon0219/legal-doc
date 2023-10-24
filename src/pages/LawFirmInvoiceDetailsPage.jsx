import React, { useEffect, useState } from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";
import moment from "moment";
import { useSearchParams } from "react-router-dom";

let sdk = new MkdSDK();

const percentCount = {
  0: 0,
  1: 50,
};
const countPercentHandle = (total_rate, delivery) => {
  const newRate =
    total_rate +
    (percentCount[delivery] > 0
      ? (percentCount[delivery] * total_rate) / 100
      : 0);
  return newRate.toFixed(2);
};

const LawFirmInvoiceDetailsPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchParams] = useSearchParams();
  const user_id = Number(localStorage.getItem("user"));
  
  async function getData() {
    console.log(
      "where",
      [
        `forkfirm_contract.client_id=${searchParams.get(
          "client_id"
        )} AND lawfirm.id = ${user_id}`,
      ],
      searchParams.get("generated_at") ?? "0000-00-00"
    );
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/client/invoice-details`,
        {
          where: [
            `forkfirm_contract.client_id=${searchParams.get(
              "client_id"
            )} AND lawfirm.id = ${user_id}`,
          ],
          date: searchParams.get("generated_at") ?? "0000-00-00",
          page: 1,
          limit: '40',
        },
        "POST"
      );

      console.log("res", result);

      if (Array.isArray(result.list)) {
        setInvoiceDetails(result.list);
        setTotal(
          result.list.reduce((acc, curr) => {
            return acc + curr.charged_amount;
          }, 0)
        );
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }
  const twentyPercentOfTotal = total * 0.2;
  const difference = total - twentyPercentOfTotal;

  // console.log(invoiceDetails);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "invoice",
      },
    });

    getData();
  }, []);

  return (
    <div className="p-5 bg-white shadow rounded mb-10">
      <h4 className="text-2xl font-semibold mb-5 ">Invoice Detail</h4>
      <div className=" w-full max-w-3xl mx-auto border border-solid border-[#d0d0d0] py-5  px-10 ">
        <h4 className="text-2xl font-semibold mb-5 ">Invoice</h4>
        {invoiceDetails.length > 0 ? (
          <>
            {/* <ul>
              <li className=" flex justify-between items-center ">
                <p className=" text-[16px] font-medium ">
                  #
                  {invoiceDetails &&
                  invoiceDetails.length > 0 &&
                  invoiceDetails[0].id
                    ? invoiceDetails[0].id
                    : " "}{" "}
                </p>
                <p className=" text-[16px] font-medium ">
                  {invoiceDetails.length > 0
                    ? moment(
                        searchParams.get("generated_at") ?? "0000-00-00"
                      ).format("MM/DD/YYYY")
                    : " "}
                </p>
              </li>
            </ul> */}
            <ul className="mt-5">
              <h4 className="text-xl font-bold mb-2 ">Client</h4>
              <li className=" flex justify-between items-center ">
                <p className=" text-[16px] font-medium ">
                  Client Name{" "}
                  <span className="ml-1  font-normal ">
                    {invoiceDetails.length > 0 &&
                      `${
                        invoiceDetails[0].client_first_name
                          ? invoiceDetails[0].client_first_name
                          : " "
                      } ${
                        invoiceDetails[0].client_last_name
                          ? invoiceDetails[0].client_last_name
                          : " "
                      }`}
                  </span>{" "}
                </p>
                <p className=" text-[16px] font-medium ">
                  Client Email{" "}
                  <span className="ml-1  font-normal ">
                    {invoiceDetails.length > 0 && invoiceDetails[0].client_email
                      ? invoiceDetails[0].client_email
                      : " "}
                  </span>{" "}
                </p>
              </li>
            </ul>
            <ul className="mt-5">
            <h4 className="text-xl font-bold mb-2 ">Details</h4>
              <li className=" flex items-center mb-2 ">
                <p className=" text-[16px] font-medium ">
                  Law firm Name :
                  <span className="ml-1  font-normal ">
                    {invoiceDetails.length > 0 &&
                      `${
                        invoiceDetails[0].lawfirm_first_name
                          ? invoiceDetails[0].lawfirm_first_name
                          : ""
                      } ${
                        invoiceDetails[0].lawfirm_last_name
                          ? invoiceDetails[0].lawfirm_last_name
                          : ""
                      }`}
                  </span>
                </p>
              </li>
              <li className=" flex items-center mb-2 ">
                <p className=" text-[16px] font-medium ">
                  Office :<span className="ml-1  font-normal ">{
                        invoiceDetails[0].base_office
                          ? invoiceDetails[0].base_office
                          : ""
                      }</span>
                </p>
              </li>
              <li className=" flex items-center mb-2 ">
                <p className=" text-[16px] font-medium ">
                  Law firm email :
                  <span className="ml-1  font-normal ">
                    {invoiceDetails.length > 0 &&
                    invoiceDetails[0].lawfirm_email
                      ? invoiceDetails[0].lawfirm_email
                      : " "}
                  </span>
                </p>
              </li>
            </ul>
          
            <ul className="mt-5">
              <li className=" flex justify-between items-center border-b-2 border-solid border-[#111] px-1 py-2  ">
                <h5 className=" font-bold ">Description</h5>
                {/* <h5 className=" font-bold ">Charges</h5> */}
              </li>
            </ul>
            {invoiceDetails.map((item, i) => (
              <ul key={i}>
                <li className=" flex justify-between items-center px-1 py-2  ">
                  {item.project_name && (
                    <h5 className=" font-bold ">{item.project_name}</h5>
                  )}

                  {item.rate && (
                    <h5 className=" font-bold ">
                      {/* ${item.hour > 0 ? item.rate + "/hr" : item.rate} */}
                    </h5>
                  )}
                </li>
                {item.counter_party_name && (
                  <li className=" flex justify-between items-center px-10 py-2  ">
                    <h5 className="">
                      Counter Party : {item.counter_party_name}
                    </h5>
                  </li>
                )}
                {item.hour > 0 && (
                  <li className=" flex justify-between items-center px-10 py-2  ">
                    <h5 className="">Number of hours : {item.hour}</h5>
                  </li>
                )}
                {item.project_name && (
                  <li className=" flex justify-between items-center px-10 py-2  ">
                    <h5 className="">Project : {item.project_name}</h5>
                  </li>
                )}

                <li className=" flex justify-between items-center px-10 py-2 border-b-2 border-solid border-[#111] ">
                  <h5 className="">Expedited</h5>
                  <h5 className="">{item.delivery === 1 ? "+ 50%" : "0%"}</h5>
                </li>
                {/* {item.charged_amount && (
                  <li className=" flex justify-between items-center px-10 py-2 border-b-2 border-solid border-[#111] ">
                    <h5 className=" font-semibold ">Total</h5>
                    <h5 className="font-semibold">${item.charged_amount}</h5>
                  </li>
                )} */}
              </ul>
            ))}
            <ul>
              {/* <li className=" flex justify-between items-center px-10 py-2 mt-4  border-b-2 border-solid border-[#111] ">
                <h5 className=" font-semibold ">Net Total </h5>
                <h5 className="font-semibold">${total}</h5>
              </li> */}
              <li className=" flex justify-between items-center px-10 py-2 mt-3 ">
                <h5 className=" font-semibold ">Total Payable Amount </h5>
                <h5 className="font-semibold">${difference}</h5>
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="capitalize text-center">Loading Invoice Details!</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LawFirmInvoiceDetailsPage;
