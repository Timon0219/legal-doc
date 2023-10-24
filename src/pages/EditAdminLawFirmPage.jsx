import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
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

let sdk = new MkdSDK();

const EditAdminLawFirmPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({
      first_name: yup.string().required(),
      website: yup.string().optional(),
      email: yup.string().required(),
      // password: yup.string().required(),
      base_office: yup.object().required(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const [law_firm_id, setLawFirmId] = useState(0);
  const statusRef = React.useRef(null);
  const officeRef = React.useRef(null);
  const [base_offices, setBaseOffices] = React.useState([]);

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
  const location = useLocation();

  const selectStatus = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];

  React.useEffect(() => {
    let arr = base_offices_json.map((office) => {
      return { value: office.value, label: office.value };
    });
    setBaseOffices(arr);
    let locIndex = usa_states.indexOf(location.state.base_office);
    officeRef.current.setValue(arr[locIndex]);
  }, []);

  const usa_states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  async function fetchLawfirm() {
    try {
      sdk.setTable("user");
      const result = await sdk.callJoinRestAPI(
        "user",
        "profile",
        "id",
        "user_id",
        "user.*, website",
        [`user.id = ${params.id}`]
      );
      if (
        !result.error &&
        Array.isArray(result.list) &&
        result.list.length > 0
      ) {
        setValue(
          "first_name",
          result.list[0].first_name + " " + (result.list[0].last_name ?? "")
        );
        setValue("website", result.list[0].website);
        setValue("email", result.list[0].email);
        statusRef.current.setValue(selectStatus[result.list[0].status]);

        setLawFirmId(result.list[0].id);
      }
    } catch (err) {
      console.log("error", err);
      tokenExpireError(dispatch, err.message);
    }
  }

  useEffect(() => {
    fetchLawfirm();
  }, []);

  const onSubmit = async (data) => {
    try {
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
          id: law_firm_id,
          first_name: data.first_name,
          last_name: "",
          email: data.email,
          status,
          // base_office,
          // website: data.website,
          role: "lawfirm",
        },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        sdk.setTable("profile");
        await sdk.callRestAPI(
          {
            set: {
              base_office,
              website: data.website,
            },
            where: { user_id: result.user_id },
          },
          "PUTWHERE"
        );
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
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "law_firm",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit Law Firm</h4>
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
            htmlFor="base_office"
          >
            Office
          </label>
          <Controller
            {...register("base_office")}
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <Select
                options={base_offices}
                ref={officeRef}
                onChange={onChange}
              />
            )}
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

export default EditAdminLawFirmPage;
