import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";

let sdk = new MkdSDK();

const EditLawFirmInvoiceCronjobPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({

      client_id: yup.number().required().positive().integer(),
      charged_amount: yup.number().required(),
      fork_fee: yup.number().required(),
      payout_amount: yup.number().required(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
const [client_id, setClientId] = useState(0);const [charged_amount, setChargedAmount] = useState(0);const [fork_fee, setForkFee] = useState(0);const [payout_amount, setPayoutAmount] = useState(0);
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
        sdk.setTable("invoice_cronjob");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {

            setValue('client_id', result.model.client_id);
            setValue('charged_amount', result.model.charged_amount);
            setValue('fork_fee', result.model.fork_fee);
            setValue('payout_amount', result.model.payout_amount);


            setClientId(result.model.client_id);
            setChargedAmount(result.model.charged_amount);
            setForkFee(result.model.fork_fee);
            setPayoutAmount(result.model.payout_amount);
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
          client_id: data.client_id,
          charged_amount: data.charged_amount,
          fork_fee: data.fork_fee,
          payout_amount: data.payout_amount,
        },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        navigate("/law_firm/invoice_cronjob");
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
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "invoice_cronjob",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit InvoiceCronjob</h4>
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
            htmlFor="charged_amount"
          >
            ChargedAmount
          </label>
          <input
            placeholder="charged_amount"
            {...register("charged_amount")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.charged_amount?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.charged_amount?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="fork_fee"
          >
            ForkFee
          </label>
          <input
            placeholder="fork_fee"
            {...register("fork_fee")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.fork_fee?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.fork_fee?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="payout_amount"
          >
            PayoutAmount
          </label>
          <input
            placeholder="payout_amount"
            {...register("payout_amount")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.payout_amount?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.payout_amount?.message}
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

export default EditLawFirmInvoiceCronjobPage;
