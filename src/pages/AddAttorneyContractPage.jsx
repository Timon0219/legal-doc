import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";

const AddAttorneyContractPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({

      client_id: yup.number().required().positive().integer(),
      originator: yup.string().required(),
      project_name: yup.string().required(),
      attorney_id: yup.number().required().positive().integer(),
      counter_party_name: yup.string().required(),
      counter_party_email: yup.string().required(),
      status: yup.number().required().positive().integer(),
      doc_type_id: yup.number().required().positive().integer(),
      duration: yup.number().required().positive().integer(),
      duration_type: yup.number().required().positive().integer(),
      delivery: yup.number().required().positive().integer(),
      document: yup.string().required(),
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
      sdk.setTable("contract");

      const result = await sdk.callRestAPI(
        {

          client_id: data.client_id,
          originator: data.originator,
          project_name: data.project_name,
          attorney_id: data.attorney_id,
          counter_party_name: data.counter_party_name,
          counter_party_email: data.counter_party_email,
          status: data.status,
          doc_type_id: data.doc_type_id,
          duration: data.duration,
          duration_type: data.duration_type,
          delivery: data.delivery,
          document: data.document,
        },
        "POST"
      );
      if (!result.error) {
        showToast(globalDispatch, "Added");
        navigate("/attorney/contract");
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
        path: "contract",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Contract</h4>
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
            htmlFor="originator"
          >
            Originator
          </label>
          <input
            placeholder="originator"
            {...register("originator")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.originator?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.originator?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="project_name"
          >
            ProjectName
          </label>
          <input
            placeholder="project_name"
            {...register("project_name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.project_name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.project_name?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="attorney_id"
          >
            AttorneyId
          </label>
          <input
            placeholder="attorney_id"
            {...register("attorney_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.attorney_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.attorney_id?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="counter_party_name"
          >
            CounterPartyName
          </label>
          <input
            placeholder="counter_party_name"
            {...register("counter_party_name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.counter_party_name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.counter_party_name?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="counter_party_email"
          >
            CounterPartyEmail
          </label>
          <input
            placeholder="counter_party_email"
            {...register("counter_party_email")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.counter_party_email?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.counter_party_email?.message}
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
            htmlFor="duration"
          >
            Duration
          </label>
          <input
            placeholder="duration"
            {...register("duration")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.duration?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.duration?.message}
          </p>
        </div>
            
        
                  <div className="mb-4 ">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="duration_type"
                    >
                      DurationType
                    </label>
                    <select
                    {...register("duration_type")}
                    className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.duration_type?.message ? "border-red-500" : ""
                    }`}
                    >
                      <option value='0' >month</option><option value='1' >year</option>
                    </select>
                    <p className="text-red-500 text-xs italic">
                      {errors.duration_type?.message}
                    </p>
                  </div>
            
        
                  <div className="mb-4 ">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="delivery"
                    >
                      Delivery
                    </label>
                    <select
                    {...register("delivery")}
                    className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.delivery?.message ? "border-red-500" : ""
                    }`}
                    >
                      <option value='0' >expedited</option><option value='1' >standard</option>
                    </select>
                    <p className="text-red-500 text-xs italic">
                      {errors.delivery?.message}
                    </p>
                  </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="document"
          >
            Document
          </label>
          <textarea
            placeholder="document"
            {...register("document")}
            className={`"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              errors.document?.message ? "border-red-500" : ""
            }`}
            rows={15}
          ></textarea>
          <p className="text-red-500 text-xs italic">
            {errors.document?.message}
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

export default AddAttorneyContractPage;
