import React from "react";
import { useNavigate } from "react-router";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";

let sdk = new MkdSDK();
const PayWithDefaultPaymentMethod = ({
  invoiceId,
  setShowModal,
  currentData,
}) => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payment = await sdk.callRawAPI(
        `/v2/api/forkfirm/client/pay`,
        {
          invoice_id: invoiceId,
          payment_method: currentData.customer.default_source,
        },
        "POST"
      );

      if (payment.error)
        throw new Error(payment.message || "An error occurred");

      navigate(-1);
      showToast(globalDispatch, payment.message);
      setShowModal(false);
    } catch (error) {
      tokenExpireError(dispatch, error.message);
      showToast(globalDispatch, error.message);
    }
  };

  return (
    <>
      <div
        style={{ zIndex: "999" }}
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
      >
        <div
          style={{ width: "50%" }}
          className="relative w-auto my-6 mx-auto max-w-3xl"
        >
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <h3 className="text-3xl font-semibold">Pay with default card</h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => setShowModal(false)}
              >
                <span className="bg-transparent text-black opacity-100 h-6 w-6 text-2xl block outline-none focus:outline-none">
                  ×
                </span>
              </button>
            </div>
            <p className=" p-6 text-2xl">Are you sure?</p>
            <div className="flex items-center p-6 border-t border-solid border-slate-200 rounded-b">
              <button
                className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none  mb-1 ease-linear transition-all duration-150 mr-4 "
                type="button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-60"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="opacity-25 fixed inset-0 z-2 bg-black"
        style={{ zIndex: "1" }}
      ></div>
    </>
  );
};

export default PayWithDefaultPaymentMethod;
