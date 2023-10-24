import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";

const AddLawFirmTagPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      name: yup.string().required(),
      input_type: yup.string().required(),
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
      sdk.setTable("tag");

      const result = await sdk.callRestAPI(
        {
          name: data.name,
          input_type: data.input_type,
        },
        "POST"
      );
      if (!result.error) {
        showToast(globalDispatch, "Added");
        navigate("/law_firm/tag");
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
      setError("name", {
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
        path: "tag",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Tag</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            placeholder="name"
            {...register("name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.name?.message}</p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="input_type"
          >
            InputType
          </label>
          <select
            {...register("input_type")}
            className={`bg-white cursor-pointer border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.client?.message ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Status</option>
            <option value="0">String</option>
            <option value="1">Number</option>
            <option value="2">Boolean</option>
          </select>
          {/* <textarea
            placeholder="input_type"
            {...register("input_type")}
            className={`"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              errors.input_type?.message ? "border-red-500" : ""
            }`}
            rows={15}
          ></textarea> */}
          <p className="text-red-500 text-xs italic">
            {errors.input_type?.message}
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

export default AddLawFirmTagPage;
