import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import Select from "react-select";

let sdk = new MkdSDK();

const EditAdminLawFirmAttorneyPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup.object({
    // password: yup.string().required(),
    first_name: yup.string().required(),
    last_name: yup.string().optional(),
    email: yup.string().required(),
    associated_law_firm: yup.object().required("This field is required"),
  });
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [law_firm_id, setLawFirmId] = useState(0);
  const [attorney_id, setAttorneyId] = useState(0);
  const lawFirmRef = React.useRef(null);
  const [lawFirmData, setLawFirmData] = React.useState([]);
  const [id, setId] = useState(0);
  const statusRef = React.useRef(null);
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const params = useParams();
  const navigate = useNavigate();

  const selectStatus = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];

  useEffect(function () {
    (async function () {
      try {
        sdk.setTable("user");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        sdk.setTable("lawfirm");
        const result2 = await sdk.callRestAPI(
          {
            payload: {},
          },
          "PAGINATE"
        );
        let arr = [];
        result2.list.forEach((lawFirm) =>
          arr.push({
            id: lawFirm.id,
            label: `${lawFirm.first_name} ${lawFirm.last_name ?? ""}`,
            value: lawFirm.id,
          })
        );
        setLawFirmData(arr);
        if (!result.error) {
          setValue("first_name", result.model.first_name);
          setValue("last_name", result.model.last_name);
          setValue("email", result.model.email);
          arr.filter((val, index) => {
            if (val.id === location.state.current_law_firm_id) {
              lawFirmRef.current.setValue(arr[index]);
              return true;
            }
          });
          console.log(location.state);
          statusRef.current.setValue(selectStatus[location.state.status ?? 0]);
          setLawFirmId(result.model.current_law_firm_id);
          setAttorneyId(result.model.law_firm_attorney_id);
          setId(result.model.id);
        }
      } catch (error) {
        console.log("error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    console.log("submitting");
    try {
      sdk.setTable("user");

      let status = "";
      let current_law_firm_id = "";

      if (statusRef.current.getValue().length) {
        status = parseInt(statusRef.current.getValue()[0].value);
      } else {
        status = 0;
      }

      if (lawFirmRef.current.getValue().length) {
        current_law_firm_id = parseInt(lawFirmRef.current.getValue()[0].value);
      }

      console.log(current_law_firm_id);

      const result = await sdk.callRestAPI(
        {
          id: id,
          role: "attorney",
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          status,
        },
        "PUT"
      );

      if (!result.error) {
        const result = await sdk.callRestAPI(
          {
            id: id,
            law_firm_id: current_law_firm_id,
            current_law_firm_id: location.state.current_law_firm_id
              ? location.state.current_law_firm_id
              : null,
          },
          "PUTATTORNEY"
        );
        if (!result.error) {
          showToast(globalDispatch, "Updated");
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
      setError("first_name", {
        type: "manual",
        message: error.message,
      });
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "attorney",
      },
    });
  }, []);

  function onError(err) {
    console.log("erroring", err);
  }

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit Attorney</h4>
      <form
        className=" w-full max-w-lg mt-4"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="first_name"
          >
            First Name
          </label>
          <input
            placeholder=""
            {...register("first_name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
          />
          <p className="text-red-500 text-xs italic">
            {errors.first_name?.message}
          </p>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="last_name"
          >
            Last Name
          </label>
          <input
            placeholder=""
            {...register("last_name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
          />
          <p className="text-red-500 text-xs italic">
            {errors.last_name?.message}
          </p>
        </div>

        <div className="mb-4">
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
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
          />
          <p className="text-red-500 text-xs italic">{errors.email?.message}</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Associated Law Firm
          </label>
          <Controller
            {...register("associated_law_firm")}
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <Select
                options={lawFirmData}
                ref={lawFirmRef}
                onChange={onChange}
              />
            )}
            control={control}
          />
          <p className="text-red-500 text-xs italic">
            {errors.associated_law_firm?.message}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Status
          </label>
          <Select options={selectStatus} ref={statusRef} />
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

export default EditAdminLawFirmAttorneyPage;
