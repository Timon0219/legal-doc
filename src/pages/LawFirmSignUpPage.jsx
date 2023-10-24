import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../authContext";
import Select from "react-select";
import { useEffect } from "react";

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

const LawFirmSignUpPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  let invited_by = searchParams.get("invited_by");
  let getting_email = searchParams.get("getting_email");
  console.log(invited_by);
  const [checkConPassword, setCheckConPassword] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const schema = yup.object({
    base_office: yup.object().required("This field is required"),
    name: yup.string().required("Name is required"),
    email: yup.string().email().required("Email is required"),
    password: yup.string().required("password is required"),
    confirmPassword: yup.string().required("Confirm Password is required"),
  });

  const { dispatch } = React.useContext(AuthContext);
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

  const officeRef = React.useRef(null);
  const [base_offices, setBaseOffices] = React.useState([]);

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

  const onSubmit = async (data) => {
    console.log(data);
    let sdk = new MkdSDK();
    setLoading(true);
    if (data.password === data.confirmPassword) {
      //   console.log(data);
      try {
        // let arr = data.name.split(" ");
        // let first_name, last_name;
        // first_name = arr[0];
        // if (arr.length > 1) {
        //   last_name = arr[1];
        // }
        const result = await sdk.registerEmail(
          data.email,
          data.password,
          "lawfirm"
        );
        console.log(result);
        if (!result.error) {
          localStorage.setItem("token", result.token);

          let base_office;
          if (officeRef.current.getValue().length) {
            base_office = officeRef.current.getValue()[0].value;
          }

          await sdk.callRestAPI(
            {
              id: result.user_id,
              user: {
                first_name: data.name,
                last_name: null,
              },
            },
            "EDITSELF"
          );
          // sdk.setTable("user");
          // console.log(nameResult);
          // const nameResult2 = await sdk.callRestAPI(
          //   {
          //     id: result.user_id,
          //     first_name,
          //     last_name,
          //   },
          //   "PUT"
          // );

          sdk.setTable("profile");
          if (invited_by) {
            const result2 = await sdk.callRestAPI(
              {
                set: {
                  invited_by: invited_by,
                  base_office,
                },
                where: {
                  user_id: result.user_id,
                },
              },

              "PUTWHERE"
            );

            // console.log(result2);
          } else {
            const result2 = await sdk.callRestAPI(
              {
                set: {
                  base_office,
                },
                where: {
                  user_id: result.user_id,
                },
              },

              "PUTWHERE"
            );
          }

          console.log("HERE IS OUR TEST LOG");
          // CREATING AN ATTORNEY FOR THIS LAWFIRM
          sdk.setTable("forkfirm_law_firm_attorney");
          await sdk.callRawAPI(
            "/v1/api/rest/law_firm_attorney/POST",
            {
              law_firm_id: result.user_id,
              attorney_id: result.user_id,
            },
            "POST"
          );

          localStorage.setItem("message", JSON.stringify(result.message));
          navigate(`/verification-modal`);
          setLoading(false);
        } else {
          setLoading(false);
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
        setLoading(false);
        console.log("Error", error);
        setError("email", {
          type: "manual",
          message: error.message,
        });
      }
    } else {
      setLoading(false);
      setCheckConPassword(true);
    }
  };

  useEffect(() => {
    let arr = base_offices_json.map((office) => {
      return { value: office.value, label: office.value };
    });
    setBaseOffices(arr);
  }, []);

  return (
    <div className="w-full max-w-xs mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 "
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 capitalize"
            htmlFor="email"
          >
            Name <span className="text-[red] ">*</span>
          </label>
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  ${
              errors.name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic capitalize">
            {errors.name?.message}
          </p>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 capitalize"
            htmlFor="email"
          >
            Email <span className="text-[red] ">*</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            value={getting_email}
            readOnly
            {...register("email")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic capitalize">
            {errors.email?.message}
          </p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Base Office <span className="text-[red] ">*</span>
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

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 capitalize"
            htmlFor="password"
          >
            Password <span className="text-[red] ">*</span>
          </label>
          <input
            type="password"
            placeholder="******************"
            {...register("password")}
            className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              errors.password?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic capitalize">
            {errors.password?.message}
          </p>
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 capitalize"
            htmlFor="password"
          >
            Confirm Password <span className="text-[red] ">*</span>
          </label>
          <input
            type="password"
            placeholder="******************"
            {...register("confirmPassword")}
            className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline capitalize ${
              errors.confirmPassword?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic capitalize">
            {errors.confirmPassword?.message}
          </p>
          {checkConPassword && (
            <p className="text-red-500 text-xs italic capitalize">
              Confirm password is not same
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {loading ? (
            <p className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline opacity-60 ">
              Loading...
            </p>
          ) : (
            <>
              <input
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                value="Sign In"
              />
            </>
          )}
          {/* <Link
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            to="/client/forgot"
          >
            Forgot Password?
          </Link> */}
        </div>
      </form>
      <p className="text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} forkfirm. All rights reserved.
      </p>
    </div>
  );
};

export default LawFirmSignUpPage;
