import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { tokenExpireError } from "../authContext";
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

const LawFirmProfilePage = () => {
  const schema = yup
    .object({
      email: yup.string().email().required(),
      firm_name: yup.string().optional(),
      website: yup.string().optional(),
      password: yup.string().optional(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);
  const [oldEmail, setOldEmail] = useState("");
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
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

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "profile",
      },
    });

    (async function () {
      try {
        const result = await sdk.getProfile();
        setValue("email", result.email);
        setValue(
          "firm_name",
          (result.first_name ? result.first_name : "") +
            " " +
            (result.last_name ? result.last_name : "")
        );
        setOldEmail(result.email);
        if (!result.error) {
          sdk.setTable("lawfirm");
          const result = await sdk.callRestAPI(
            {
              where: [`forkfirm_user.id=${user_id}`],
              page: 1,
              limit: 10,
            },
            "PAGINATE"
          );
          // const result = await sdk.callRestAPI({ id: user_id }, "GET");

          console.log(result);
          setValue("website", result.list[0].website ?? "");

          let arr = base_offices_json.map((office) => {
            return { value: office.value, label: office.value };
          });
          setBaseOffices(arr);
          let locIndex = usa_states.indexOf(result.list[0].base_office);
          officeRef.current.setValue(arr[locIndex]);
        }
      } catch (error) {
        console.log("Error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (oldEmail !== data.email) {
        const emailresult = await sdk.updateEmail(data.email);
        if (!emailresult.error) {
          showToast(dispatch, "Profile Updated", 1000);
        } else {
          if (emailresult.validation) {
            const keys = Object.keys(emailresult.validation);
            for (let i = 0; i < keys.length; i++) {
              const field = keys[i];
              setError(field, {
                type: "manual",
                message: emailresult.validation[field],
              });
            }
          }
        }
      }

      if (data.password.length > 0) {
        const passwordresult = await sdk.updatePassword(
          data.current_password,
          data.password
        );
        if (!passwordresult.error) {
          showToast(dispatch, "Profile Updated", 2000);
        } else {
          if (passwordresult.validation) {
            const keys = Object.keys(passwordresult.validation);
            for (let i = 0; i < keys.length; i++) {
              const field = keys[i];
              setError(field, {
                type: "manual",
                message: passwordresult.validation[field],
              });
            }
          }
        }
      }

      if (data.firm_name) {
        let base_office;
        let name = data.firm_name.split(" ");
        let website = data.website;
        let first_name = name[0];
        let last_name;
        if (name.length > 1) {
          last_name = name[1];
        }

        if (officeRef.current.getValue().length) {
          base_office = officeRef.current.getValue()[0].value;
        }

        const result = await sdk.callRestAPI(
          {
            user: {
              first_name: first_name,
              last_name: last_name,
              id: user_id,
              role: "lawfirm",
            },
            profile: {
              base_office,
              website,
            },
          },
          "EDITSELF"
        );
        console.log(result);
        showToast(dispatch, "Profile Updated", 2000);
      }
    } catch (error) {
      console.log("Error", error);
      setError("email", {
        type: "manual",
        message: error.message,
      });
      tokenExpireError(dispatch, error.message);
    }
  };

  return (
    <>
      <main>
        <div className="bg-white shadow rounded p-5  ">
          <h4 className="text-2xl font-medium">Edit Profile</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
            <div className="mb-4 mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Firm Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="text"
                placeholder="Firm Name"
                name="firm_name"
                {...register("firm_name")}
              />
              <p className="text-red-500 text-xs italic">
                {errors.email?.message}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                name="email"
                {...register("email")}
              />
              <p className="text-red-500 text-xs italic">
                {errors.email?.message}
              </p>
            </div>
            <div className="mb-4 mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Website
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="website"
                type="text"
                placeholder="Website"
                name="website"
                {...register("website")}
              />
              <p className="text-red-500 text-xs italic">
                {errors.website?.message}
              </p>
            </div>
            <div className="mb-4 ">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="status"
              >
                Base Office
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
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                {...register("password")}
                name="password"
                className={
                  "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                }
                id="password"
                type="password"
                placeholder="******************"
              />
              <p className="text-red-500 text-xs italic">
                {errors.password?.message}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default LawFirmProfilePage;
