import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";

let sdk = new MkdSDK();

const AddAdminLawFirmAttorneyPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      password: yup.string().required(),
      first_name: yup.string().required(),
      last_name: yup.string().optional(),
      email: yup.string().required(),
      associated_law_firm: yup.object().required(),
    })
    .required();
  const lawFirmRef = React.useRef(null);
  const { dispatch } = React.useContext(GlobalContext);
  const [lawFirmData, setLawFirmsData] = React.useState([]);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    control
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getData = async () => {
    sdk.setTable("lawfirm");
    const result = await sdk.callRestAPI({}, "PAGINATE");

    let data = [];
    result.list.forEach((lawFirm) => {
      data.push({
        value: lawFirm.id,
        label: lawFirm.first_name + lawFirm.last_name,
      });
    });

    console.log(data);
    setLawFirmsData(data);
  };

  const onSubmit = async (data) => {
    let law_firm_id;
    if (lawFirmRef.current.getValue().length) {
      law_firm_id = parseInt(lawFirmRef.current.getValue()[0].value);
    }

    try {
      sdk.setTable("attorney");

      const result = await sdk.callRestAPI(
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          role: "attorney",
          password: data.password,
        },
        "POST"
      );
      if (!result.error) {
        const result2 = await sdk.callRestAPI(
          {
            id: result.message,
            current_law_firm_id: null,
            law_firm_id,
          },
          "PUTATTORNEY"
        );

        console.log(result2);
        if (!result2.error) {
          showToast(globalDispatch, "Added");
          navigate("/admin/attorney");
        }
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
      setError("law_firm_id", {
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
        path: "attorney",
      },
    });

    getData();
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Attorney</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 mt-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="first_name"
          >
            First Name
          </label>
          <input
            placeholder=""
            {...register("first_name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.first_name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.first_name?.message}
          </p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="last_name"
          >
            Last Name
          </label>
          <input
            placeholder=""
            {...register("last_name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.last_name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.last_name?.message}
          </p>
        </div>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            placeholder=""
            type="email"
            {...register("email")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.email?.message}</p>
        </div>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="associated_law_firm"
          >
            Associated Law Firm
          </label>
          <Controller 
          {...register("associated_law_firm")}
          render={({field: { onChange, onBlur, value, name, ref }})=>(<Select options={lawFirmData} ref={lawFirmRef} onChange={onChange}/>)}
          control={control}
          />
          <p className="text-red-500 text-xs italic">
            {errors.associated_law_firm?.message}
          </p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            placeholder=""
            type="password"
            {...register("password")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.password?.message ? "border-red-500" : ""
            }`}
          />

          <p className="text-red-500 text-xs italic">
            {errors.password?.message}
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

export default AddAdminLawFirmAttorneyPage;
