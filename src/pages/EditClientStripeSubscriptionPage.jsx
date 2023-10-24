import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";

let sdk = new MkdSDK();

const EditClientStripeSubscriptionPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({

      stripe_id: yup.string().required(),
      price_id: yup.string().required(),
      user_id: yup.number().required().positive().integer(),
      object: yup.string().required(),
      status: yup.string().required(),
      is_lifetime: yup.string().required(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
const [stripe_id, setStripeId] = useState('');const [price_id, setPriceId] = useState('');const [user_id, setUserId] = useState(0);const [object, setObject] = useState('');const [status, setStatus] = useState('');
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
        sdk.setTable("stripe_subscription");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {

            setValue('stripe_id', result.model.stripe_id);
            setValue('price_id', result.model.price_id);
            setValue('user_id', result.model.user_id);
            setValue('object', result.model.object);
            setValue('status', result.model.status);
            setValue('is_lifetime', result.model.is_lifetime);


            setStripeId(result.model.stripe_id);
            setPriceId(result.model.price_id);
            setUserId(result.model.user_id);
            setObject(result.model.object);
            setStatus(result.model.status);
            setIsLifetime(result.model.is_lifetime);
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
          stripe_id: data.stripe_id,
          price_id: data.price_id,
          user_id: data.user_id,
          object: data.object,
          status: data.status,
          is_lifetime: data.is_lifetime,
        },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        navigate("/client/stripe_subscription");
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
      setError("stripe_id", {
        type: "manual",
        message: error.message,
      });
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "stripe_subscription",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit StripeSubscription</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>

        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="stripe_id"
          >
            StripeId
          </label>
          <input
            placeholder="stripe_id"
            {...register("stripe_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.stripe_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.stripe_id?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="price_id"
          >
            PriceId
          </label>
          <input
            placeholder="price_id"
            {...register("price_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.price_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.price_id?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="user_id"
          >
            UserId
          </label>
          <input
            placeholder="user_id"
            {...register("user_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.user_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.user_id?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="object"
          >
            Object
          </label>
          <textarea
            placeholder="object"
            {...register("object")}
            className={`"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              errors.object?.message ? "border-red-500" : ""
            }`}
            rows={15}
          ></textarea>
          <p className="text-red-500 text-xs italic">
            {errors.object?.message}
          </p>
        </div>
            
        
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <input
            placeholder="status"
            {...register("status")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.status?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.status?.message}
          </p>
        </div>
            
        N\A tinyint
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

export default EditClientStripeSubscriptionPage;
