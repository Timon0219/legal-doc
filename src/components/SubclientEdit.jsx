import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import MkdSDK from "../utils/MkdSDK";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";

let sdk = new MkdSDK();

const SubclientEdit = ({ id, show_billing, getData }) => {
  const [showModal, setShowModal] = React.useState(false);
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup.object({});
    // console.log(id, show_billing);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = async (data) => {
    console.log(data);

    const newObj = {
      id: id,
      show_billing: JSON.parse(data.billing),
    };
    try {
      sdk.setTable("client_subclient");

      const result = await sdk.callRestAPI(newObj, "PUT");
      console.log(result);
      if (!result.error) {
        getData();
        showToast(globalDispatch, "Billing show has been updated");
        setShowModal(false);
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };
  return (
    <>
      <button
        className="text-xs ml-2"
        style={{ textDecoration: "underline" }}
        onClick={() => setShowModal(true)}
      >
        Edit
      </button>
      {showModal ? (
        <>
          <form
            style={{ zIndex: "3" }}
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div
              style={{ width: "50%" }}
              className="relative w-auto my-6 mx-auto max-w-3xl"
            >
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    Edit Subclient Billing
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-100 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>

                {/*body*/}
                {/* <div className="relative p-6 flex-auto">
                      <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Who are you inviting?
                        </label>
                        <Select options={selectStatus} ref={statusRef} />
                        <p className="text-red-500 text-xs italic"></p>
                      </div>
                    </div> */}
                <div className="relative p-6 flex-auto">
                  <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="id"
                    >
                      Billing
                    </label>
                    <select
                      defaultValue={show_billing}
                      {...register("billing")}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>

                    {/* <input
                      placeholder=""
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.id?.message ? "border-red-500" : ""
                      }`}
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.id?.message}
                    </p> */}
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 mr-4"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="submit"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </form>
          <div
            className="opacity-25 fixed inset-0 z-2 bg-black"
            style={{ zIndex: "2" }}
            onClick={() => setShowModal(false)}
          ></div>
        </>
      ) : null}
    </>
  );
};

export default SubclientEdit;
