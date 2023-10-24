import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";

const AddAdminTagPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [inputTypeValue, setInputTypeValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const schema = yup
    .object({
      name: yup.string().required(),
      input_type: yup.object().required(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);
  const inputTypeRef = React.useRef(null);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const input_types = [
    { value: 0, label: "Month" },
    { value: 1, label: "Year" },
    { value: 2, label: "String" },
    { value: 3, label: "Binary" },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    let sdk = new MkdSDK();

    let input_type = "";
    if (inputTypeRef.current.getValue().length) {
      input_type = inputTypeRef.current.getValue()[0].value;
    }

    try {
      sdk.setTable("tag");
      let result;
      if (data.status) {
        result = await sdk.callRestAPI(
          {
            name: data.name,
            input_type,
            status: JSON.parse(data.status),
          },
          "POST"
        );
      } else {
        result = await sdk.callRestAPI(
          {
            name: data.name,
            input_type,
          },
          "POST"
        );
      }

      if (!result.error) {
        showToast(globalDispatch, "Added");
        navigate("/admin/tag");
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
  console.log(inputTypeValue);
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
        <div className="mb-4 mt-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Tag Name
          </label>
          <input
            placeholder=""
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
            Input Type
          </label>

          <Controller
            {...register("input_type")}
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <Select
                options={input_types}
                placeholder="Duration"
                ref={inputTypeRef}
                onChange={(e) => {
                  onChange(e);
                  setInputTypeValue(e.label);
                }}
              />
            )}
            control={control}
          />

          <p className="text-red-500 text-xs italic">
            {errors.input_type?.message}
          </p>
        </div>
        {/* {inputTypeValue === "Binary" && (
          <div className="mb-5">
            <h5 className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </h5>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <input
                  checked
                  id="default-radio-1"
                  type="radio"
                  {...register("status")}
                  value="1"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 "
                />
                <label
                  for="default-radio-1"
                  className="ml-2 text-sm font-medium text-gray-900 uppercase"
                >
                  yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-2"
                  type="radio"
                  {...register("status")}
                  value="0"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 "
                />
                <label
                  for="default-radio-2"
                  className="ml-2 text-sm font-medium text-gray-900 uppercase"
                >
                  no
                </label>
              </div>
            </div>
          </div>
        )} */}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60"
          disabled={loading}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddAdminTagPage;
