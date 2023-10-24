import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import PayWithDefaultPaymentMethod from "../components/PayWithDefaultPaymentMethod";
import StripePaymentMethod from "../components/StripePaymentMethod";
import { GlobalContext } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";

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

const ClientPaymentPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [showModal, setShowModal] = React.useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(false);
  const [defaultMethod, setDefaultMethod] = React.useState({});
  const [total, setTotal] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState(0);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const [searchParams] = useSearchParams();
  const { id: invoiceId } = useParams();

  const countTotal = () => {
    const newTotal = invoiceDetails.reduce(
      (sum, item) => sum + item.charged_amount,
      0
    );
    setTotal(newTotal);
  };

  async function getData() {
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
          page: "1",
          limit: 9999,
        },
        "POST"
      );
      
      const { list } = result;
      let invoiceId = list && list?.length > 0 && (list[0].id ? list[0].id : " ");
      setInvoiceNumber(invoiceId)
      let newTotal = 0;
      list.length > 0 &&
        list.map((item) => {
          newTotal += item.charged_amount;
        });
      setTotal(newTotal);

      const groupedObjects = {};

      for (const obj of list) {
        const email = obj.lawfirm_email;

        if (email in groupedObjects) {
          groupedObjects[email].push(obj);
        } else {
          groupedObjects[email] = [obj];
        }
      }
      let temparray = [];
      for (const email in groupedObjects) {
        temparray.push({ email: email, data: groupedObjects[email] });
      }
      console.log({ temparray });
      setInvoiceDetails(temparray);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const mutateData = async (list) => {};
  async function getDefaultCard() {
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/get-cards/${
          searchParams.get("client_id") ?? user_id
        }`,
        undefined,
        "GET"
      );
      const { data } = result;
      console.log("here", data?.data);
      setDefaultMethod(
        data?.data.find((item) => item.id === item.customer.default_source) ||
          {}
      );
    } catch (error) {
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

    (async function () {
      await getData();
      await getDefaultCard();
    })();
  }, []);

  // useEffect(() => {
  //   countTotal();
  // }, [invoiceDetails]);

  

  return (
    <div className="p-5 bg-white shadow rounded mb-10">
      
      <h4 className="text-2xl font-semibold mb-5 ">Billing History</h4>
      <div className="w-full max-w-3xl mx-auto border border-solid border-[#d0d0d0] py-5  px-10 ">
        <h4 className="text-2xl font-semibold mb-5 ">Invoice</h4>
        {invoiceDetails.length > 0 ? (
          
          <>
          
            <ul>
              <li className=" flex justify-between items-center ">
                <p className=" text-[16px] font-medium ">
                  #
                  {invoiceDetails &&
                  invoiceDetails.length > 0 &&
                  invoiceNumber
                    ? invoiceNumber
                    : " "}{" "}
                </p>
                <p className=" text-[16px] font-medium ">
                  {invoiceDetails &&
                  invoiceDetails.length > 0 &&
                  searchParams.get("generated_at")
                    ? moment(searchParams.get("generated_at")).format(
                        "MM/DD/yyyy"
                      )
                    : " "}
                </p>
              </li>
            </ul>
            {invoiceDetails.map((invoiceData) => {
            const { email, data } = invoiceData;

            // Calculate total charged amount for the group
            const groupTotal = data.reduce(
              (sum, item) => sum + item.charged_amount,
              0
            );
              
              return (
                <>
                  <ul className="mt-5">
                    <li className=" flex items-center mb-2 ">
                      <p className=" text-[16px] font-medium ">
                        Law firm Name :
                        <span className="ml-1  font-normal ">
                          {data &&
                            data.length > 0 &&
                            `${
                              data[0].lawfirm_first_name
                                ? data[0].lawfirm_first_name
                                : ""
                            } ${
                              data[0].lawfirm_last_name
                                ? data[0].lawfirm_last_name
                                : ""
                            }`}
                        </span>
                      </p>
                    </li>
                    <li className=" flex items-center mb-2 ">
                      <p className=" text-[16px] font-medium ">
                        Office :
                        <span className="ml-1  font-normal ">{data[0].base_office}</span>
                      </p>
                    </li>
                    <li className=" flex items-center mb-2 ">
                      <p className=" text-[16px] font-medium ">
                        Law firm email :
                        <span className="ml-1  font-normal ">
                          {data.length > 0 && email ? email : " "}
                        </span>
                      </p>
                    </li>
                  </ul>
                  <ul className="mt-5">
                    <h4 className="text-xl font-bold mb-2 ">Client</h4>
                    <li className=" flex justify-between items-center ">
                      <p className=" text-[16px] font-medium ">
                        Client Name{" "}
                        <span className="ml-1  font-normal ">
                          {data.length > 0 &&
                            `${
                              data[0].client_first_name
                                ? data[0].client_first_name
                                : " "
                            } ${
                              data[0].client_last_name
                                ? data[0].client_last_name
                                : " "
                            }`}
                        </span>{" "}
                      </p>
                      <p className=" text-[16px] font-medium ">
                        Client Email{" "}
                        <span className="ml-1  font-normal ">
                          {data.length > 0 && data[0].client_email
                            ? data[0].client_email
                            : " "}
                        </span>{" "}
                      </p>
                    </li>
                  </ul>
                  {/* <ul className="mt-5">
                    <h4 className="text-xl font-bold mb-2 ">Details</h4>
                    <li className=" flex justify-between items-center ">
                      <p className=" text-[16px] font-medium ">
                        Hourly Rate:
                        <span className="ml-1  font-normal ">
                          ${" "}
                          {data.length > 0 && data[0].rate ? data[0].rate : " "}{" "}
                          / hr
                        </span>{" "}
                      </p>
                    </li>
                  </ul> */}
                  <ul className="mt-5">
                    <li className=" flex justify-between items-center border-b-2 border-solid border-[#111] px-1 py-2  ">
                      <h5 className=" font-bold ">Description</h5>
                      <h5 className=" font-bold ">Charges</h5>
                    </li>
                  </ul>
                  {data &&
                    data.length > 0 &&
                    data.map((item, i) => (
                      <ul key={i}>
                        <li className=" flex justify-between items-center px-1 py-2  ">
                          {item.project_name && (
                            <h5 className=" font-bold ">{item.project_name}</h5>
                          )}

                          {item.total_rate && (
                            <h5 className=" font-bold ">${item.rate}</h5>
                          )}
                        </li>
                        {item.counter_party_name && (
                          <li className=" flex justify-between items-center px-10 py-2  ">
                            <h5 className="">
                              Counter Party : {item.counter_party_name}
                            </h5>
                          </li>
                        )}
                        {item.project_name && (
                          <li className=" flex justify-between items-center px-10 py-2  ">
                            <h5 className="">Project : {item.project_name}</h5>
                          </li>
                        )}


                        <li className=" flex justify-between items-center px-10 py-2  ">
                          <h5 className="">Expedited</h5>
                          <h5 className="">
                            {item.delivery === 1 ? "+ 50%" : "0%"}
                            
                          </h5>
                        </li>
                          
                          {item.hour && (
                        <li className=" flex justify-between items-center px-10 py-2  ">
                          <h5 className="">Hours</h5>
                          <h5 className="">
                      
                            {item.hour}
                          </h5>
                        </li>
                          )}
                        {item.charged_amount && (
                          <li className=" flex justify-between items-center px-10 py-2 border-b-2 border-solid border-[#111] ">
                            <h5 className="flex font-semibold ">Total</h5>
                            <h5 className="font-semibold">
                              $ {item.charged_amount}
                             
                            </h5>
                          </li>
                        )}
                      
                      </ul>
                    ))}
                     <li className=" flex justify-between items-center px-10 py-2 border-b-2 border-solid border-[#111] ">
                            <h5 className=" font-semibold ">Lawfirm Net Total</h5>
                            <h5 className="font-semibold">
                           
                              {/* {countPercentHandle(item.charged_amount, item.delivery)} */}
                              ${groupTotal}
                            </h5>
                          </li>
                      
                </>
                
              );
            })}

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
          </>
        ) : (
          <>
            {" "}
            <p className=" capitalize ">Loading...</p>
          </>
        )}
      </div>
      <div className=" w-3/4 mx-auto mt-10 ">
        <div className="flex items-center justify-center p-6 border-t border-solid border-slate-200 rounded-b">
          {defaultMethod.id && (
            <button
              onClick={() => setPaymentMethod(true)}
              className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-60"
            >
              Pay Default Card
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className=" bg-purple-700 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-60"
          >
            Pay New Card
          </button>
        </div>

        {showModal ? (
          <StripePaymentMethod
            invoiceId={invoiceId}
            setShowModal={setShowModal}
            client_id={searchParams.get("client_id") ?? user_id}
          />
        ) : null}
        {paymentMethod ? (
          <PayWithDefaultPaymentMethod
            invoiceId={invoiceId}
            setShowModal={setPaymentMethod}
            currentData={defaultMethod}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ClientPaymentPage;
