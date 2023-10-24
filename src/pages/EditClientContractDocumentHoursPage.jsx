import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";

let sdk = new MkdSDK();

const EditClientContractDocumentHoursPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({

      contract_id: yup.number().required().positive().integer(),
      client_id: yup.number().required().positive().integer(),
      hour: yup.number().required().positive().integer(),
      date: yup.string().matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, "Date Format YYYY-MM-DD"),
      description: yup.string().required(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
const [contract_id, setContractId] = useState(0);const [client_id, setClientId] = useState(0);const [hour, setHour] = useState(0);const [date, setDate] = useState('');const [description, setDescription] = useState('');
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
        sdk.setTable("contract_document_hours");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {

            setValue('contract_id', result.model.contract_id);
            setValue('client_id', result.model.client_id);
            setValue('hour', result.model.hour);
            setValue('date', result.model.date);
            setValue('description', result.model.description);


            setContractId(result.model.contract_id);
            setClientId(result.model.client_id);
            setHour(result.model.hour);
            setDate(result.model.date);
            setDescription(result.model.description);
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
          client_id: data.client_id,
          hour: data.hour,
          date: data.date,
          description: data.description,
        },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        navigate("/client/contract_document_hours");
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
        path: "contract_document_hours",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit ContractDocumentHours</h4>
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
            htmlFor="hour"
          >
            Hour
          </label>
          <input
            placeholder="hour"
            {...register("hour")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.hour?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.hour?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="date"
          >
            Date
          </label>
          <input
            type="date"
            placeholder="date"
            {...register("date")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.date?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.date?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            placeholder="description"
            {...register("description")}
            className={`"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              errors.description?.message ? "border-red-500" : ""
            }`}
            rows={15}
          ></textarea>
          <p className="text-red-500 text-xs italic">
            {errors.description?.message}
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

export default EditClientContractDocumentHoursPage;
