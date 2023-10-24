import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";

const base_offices_json = [
  { value: "Alabama", label: "AL" },
  { value: "Alaska", label: "AK" },
  { value: "Arizona", label: "AZ" },
  { value: "Arkansas", label: "AR" },
  { value: "California", label: "CA" },
  { value: "Colorado", label: "CO" },
  { value: "Connecticut", label: "CT" },
  { value: "Delaware", label: "DE" },
  { value: "Florida", label: "FL" },
  { value: "Georgia", label: "GA" },
  { value: "Hawaii", label: "HI" },
  { value: "Idaho", label: "ID" },
  { value: "Illinois", label: "IL" },
  { value: "Indiana", label: "IN" },
  { value: "Iowa", label: "IA" },
  { value: "Kansas", label: "KS" },
  { value: "Kentucky", label: "KY" },
  { value: "Louisiana", label: "LA" },
  { value: "Maine", label: "ME" },
  { value: "Maryland", label: "MD" },
  { value: "Massachusetts", label: "MA" },
  { value: "Michigan", label: "MI" },
  { value: "Minnesota", label: "MN" },
  { value: "Mississippi", label: "MS" },
  { value: "Missouri", label: "MO" },
  { value: "Montana", label: "MT" },
  { value: "Nebraska", label: "NE" },
  { value: "Nevada", label: "NV" },
  { value: "New Hampshire", label: "NH" },
  { value: "New Jersey", label: "NJ" },
  { value: "New Mexico", label: "NM" },
  { value: "New York", label: "NY" },
  { value: "North Carolina", label: "NC" },
  { value: "North Dakota", label: "ND" },
  { value: "Ohio", label: "OH" },
  { value: "Oklahoma", label: "OK" },
  { value: "Oregon", label: "OR" },
  { value: "Pennsylvania", label: "PA" },
  { value: "Rhode Island", label: "RI" },
  { value: "South Carolina", label: "SC" },
  { value: "South Dakota", label: "SD" },
  { value: "Tennessee", label: "TN" },
  { value: "Texas", label: "TX" },
  { value: "Utah", label: "UT" },
  { value: "Vermont", label: "VT" },
  { value: "Virginia", label: "VA" },
  { value: "Washington", label: "WA" },
  { value: "West Virginia", label: "WV" },
  { value: "Wisconsin", label: "WI" },
  { value: "Wyoming", label: "WY" },
];

const AddAdminLawFirmPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      first_name: yup.string().required(),
      website: yup.string().optional(),
      email: yup.string().required(),
      password: yup.string().required(),
      base_office: yup.object().required(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);

  const navigate = useNavigate();
  const officeRef = React.useRef(null);
  const statusRef = React.useRef(null);
  const [base_offices, setBaseOffices] = React.useState([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    control
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectStatus = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];

  React.useEffect(() => {
    let arr = base_offices_json.map((office) => {
      return { value: office.value, label: office.value };
    });
    setBaseOffices(arr);
  }, []);

  const onSubmit = async (data) => {
    console.log(data);
    let sdk = new MkdSDK();

    try {
      sdk.setTable("lawfirm");
      let status,
        base_office = "";
      if (officeRef.current.getValue().length) {
        base_office = officeRef.current.getValue()[0].value;
      }
      if (statusRef.current.getValue().length) {
        status = parseInt(statusRef.current.getValue()[0].value);
      }

      const result = await sdk.callRestAPI(
        {
          first_name: data.first_name,
          last_name: "",
          email: data.email,
          base_office,
          status,
          website: data.website,
          password: data.password,
          role: "lawfirm",
        },
        "POST"
      );

      console.log(result);
      if (!result.error) {
        showToast(globalDispatch, "Added");
        navigate("/admin/law_firm");
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
        path: "law_firm",
      },
    });
    statusRef.current.setValue(selectStatus[1]);
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Law Firms</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 mt-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="first_name"
          >
            Law Firm Name
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
            htmlFor="website"
          >
            Website
          </label>
          <input
            placeholder=""
            {...register("website")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.website?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.website?.message}
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
            htmlFor="office"
          >
            Office
          </label>
          <Controller 
          {...register("base_office")}
          render={({field: { onChange, onBlur, value, name, ref }})=>(<Select options={base_offices} ref={officeRef} onChange={onChange}/>)}
          control={control}
          />
          

          <p className="text-red-500 text-xs italic">
            {errors.base_office?.message}
          </p>
        </div>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <Select options={selectStatus} ref={statusRef} />

          <p className="text-red-500 text-xs italic">
            {errors.status?.message}
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

export default AddAdminLawFirmPage;
