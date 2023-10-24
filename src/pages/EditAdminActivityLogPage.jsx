import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";

let sdk = new MkdSDK();

const EditAdminActivityLogPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({

      contract_id: yup.number().required().positive().integer(),
      status: yup.number().required().positive().integer(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
const [contract_id, setContractId] = useState(0);const [status, setStatus] = useState(0);
  const [id, setId] = useState(0);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const params = useParams();

  useEffect(function () {
    (async function () {
      try {
        sdk.setTable("activity_log");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {

            setValue('contract_id', result.model.contract_id);
            setValue('status', result.model.status);


            setContractId(result.model.contract_id);
            setStatus(result.model.status);
            setId(result.model.id);
        }
      } catch (error) {
        console.log("error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    try {
      const result = await sdk.callRestAPI(
        {
          id: id,
          contract_id: data.contract_id,
          status: data.status,
        },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        navigate("/admin/activity_log");
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
      setError("contract_id", {
        type: "manual",
        message: error.message,
      });
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "activity_log",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit ActivityLog</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>

        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contract_id"
          >
            ContractId
          </label>
          <input
            placeholder="contract_id"
            {...register("contract_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.contract_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.contract_id?.message}
          </p>
        </div>
            
        
                  <div className="mb-4 ">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="status"
                    >
                      Status
                    </label>
                    <select
                    {...register("status")}
                    className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.status?.message ? "border-red-500" : ""
                    }`}
                    >
                      <option value='0' >followed_up</option><option value='1' >escalated</option><option value='2' >executed</option>
                    </select>
                    <p className="text-red-500 text-xs italic">
                      {errors.status?.message}
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

export default EditAdminActivityLogPage;
