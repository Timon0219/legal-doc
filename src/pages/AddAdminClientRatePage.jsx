import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";

const AddAdminClientRatePage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({

      client_id: yup.number().required().positive().integer(),
      doc_type_id: yup.number().required().positive().integer(),
      rate: yup.number().required().positive().integer(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    let sdk = new MkdSDK();

    try {
      sdk.setTable("client_rate");

      const result = await sdk.callRestAPI(
        {

          client_id: data.client_id,
          doc_type_id: data.doc_type_id,
          rate: data.rate,
        },
        "POST"
      );
      if (!result.error) {
        showToast(globalDispatch, "Added");
        navigate("/admin/client_rate");
      } else {
        if (result.validation) {
          const keys = Object.keys(result.validation);
          for (let i = 0; i < keys.length; i++) {
            const field = keys[i];
            setError(field, {
              type: "manual",
              message: result.validation[field],
            });
          }
        }
      }
    } catch (error) {
      console.log("Error", error);
      setError("client_id", {
        type: "manual",
        message: error.message,
      });
      tokenExpireError(dispatch, error.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client_rate",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add ClientRate</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>

        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="client_id"
          >
            ClientId
          </label>
          <input
            placeholder="client_id"
            {...register("client_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.client_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.client_id?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="doc_type_id"
          >
            DocTypeId
          </label>
          <input
            placeholder="doc_type_id"
            {...register("doc_type_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.doc_type_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.doc_type_id?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="rate"
          >
            Rate
          </label>
          <input
            placeholder="rate"
            {...register("rate")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.rate?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.rate?.message}
          </p>
        </div>
            
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddAdminClientRatePage;
