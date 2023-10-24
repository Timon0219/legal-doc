import React from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";
import {
  formatCreditCardNumber,
  formatCVC,
  formatExpirationDate,
  formatFormData,
} from "../utils/utils";

let sdk = new MkdSDK();

const AddCardMethodModal = ({ setShowModal, getData }) => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [state, setState] = React.useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    issuer: "",
    focused: "",
    formData: null,
  });
  let form = React.useRef(null);

  const handleCallback = ({ issuer }, isValid) => {
    if (isValid) {
      setState({ issuer });
    }
  };

  const handleInputFocus = ({ target }) => {
    setState({
      focused: target.name,
    });
  };

  const handleInputChange = ({ target }) => {
    if (target.name === "number") {
      target.value = formatCreditCardNumber(target.value);
    } else if (target.name === "expiry") {
      target.value = formatExpirationDate(target.value);
    } else if (target.name === "cvc") {
      target.value = formatCVC(target.value);
    }

    setState({ [target.name]: target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { issuer } = state;
    const formData = [...e.target.elements]
      .filter((d) => d.name)
      .reduce((acc, d) => {
        acc[d.name] = d.value;
        return acc;
      }, {});
    console.log(formData);
    setState({ formData });

    try {
      const res = await sdk.addStripeCard(formData);
      console.log(res, "res");

      if (res.error) {
        showToast(globalDispatch, res.error.code);
      }
      if (res.id) {
        const cardAddRes = await sdk.callRawAPI(
          `/v2/api/lambda/stripe/customer/card`,
          {
            sourceToken: res.id,
          },
          "POST"
        );
        if (cardAddRes) {
          console.log(cardAddRes, "cardAddRes");
          showToast(globalDispatch, cardAddRes.message);
          setShowModal(false);
          getData();
          // form.reset();
        }
      } else {
        //   console.log(error.message);
      }
    } catch (error) {
      console.log(error);
      tokenExpireError(dispatch, error.message);
    }
  };
  console.log(form);
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
              <h3 className="text-3xl font-semibold">Add Card</h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => setShowModal(false)}
              >
                <span className="bg-transparent text-black opacity-100 h-6 w-6 text-2xl block outline-none focus:outline-none">
                  ×
                </span>
              </button>
            </div>
            <form
              ref={(c) => (form = c)}
              onSubmit={handleSubmit}
              className="px-10 my-6"
            >
              <div className="form-group">
                <input
                  type="tel"
                  name="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                  placeholder="Card Number"
                  // pattern="[\d| ]{16,22}"
                  required
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
                {/* <small>E.g.: 49..., 51..., 36..., 37...</small> */}
              </div>
              <div className="row">
                <div className="col-6">
                  <input
                    type="tel"
                    name="expiry"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4 "
                    placeholder="Valid Thru"
                    pattern="\d\d/\d\d"
                    required
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="tel"
                    name="cvc"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                    placeholder="CVC"
                    pattern="\d{3,4}"
                    required
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                  />
                </div>
              </div>
              <input type="hidden" name="issuer" value={state.issuer} />
              {/* <div className="form-actions">
                <button className="btn btn-primary btn-block">PAY</button>
              </div> */}
              <div className="flex items-center p-6 border-t border-solid border-slate-200 rounded-b">
                <button
                  className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none  mb-1 ease-linear transition-all duration-150 mr-4 "
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 disabled:opacity-60">
                  Add Card
                </button>
              </div>
            </form>
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

export default AddCardMethodModal;
