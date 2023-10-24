import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../authContext";

const ClientSignUpPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  let invited_by = searchParams.get("invited_by");
  let lawfirm_id = searchParams.get("lawfirm_id");
  let getting_email = searchParams.get("getting_email");
  console.log(invited_by);
  console.log(lawfirm_id);
  const [checkConPassword, setCheckConPassword] = useState(false);
  const schema = yup
    .object({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required(),
      confirmPassword: yup.string().required(),
    })
    .required();

  const { dispatch } = React.useContext(AuthContext);
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
    console.log(data);
    let sdk = new MkdSDK();
    setLoading(true);
    if (data.password === data.confirmPassword) {
      console.log(data);
      try {
        let arr = data.name.split(" ");
        let first_name, last_name;
        first_name = arr[0];
        if (arr.length > 1) {
          last_name = arr[1];
        }
        const result = await sdk.registerEmail(
          data.email,
          data.password,
          "client",
          first_name,
          last_name
        );
        console.log(result);
        if (!result.error) {
          sdk.setTable("user");
          localStorage.setItem("token", result.token);
          // const nameResult = await sdk.callRestAPI(
          //   {
          //     id: result.user_id,
          //     first_name,
          //     last_name,
          //   },
          //   "PUT"
          // );

          const nameResult = await sdk.callRestAPI(
            {
              id: result.user_id,
              user: {
                first_name,
                last_name,
              },
            },
            "EDITSELF"
          );

          sdk.setTable("profile");
          if (invited_by) {
            const result2 = await sdk.callRestAPI(
              {
                set: {
                  invited_by: invited_by,
                  // current_law_firm_id: lawfirm_id ? lawfirm_id : null,
                },
                where: {
                  user_id: result.user_id,
                },
              },

              "PUTWHERE"
            );
          }

          if (lawfirm_id) {
            sdk.setTable("law_firm_client");
            const result2 = await sdk.callRestAPI(
              { law_firm_id: lawfirm_id, client_id: result.user_id },
              "POST"
            );

            console.log(result2, "result2");
          }

          // console.log(nameResult);
          navigate(`/verification-modal`);
          localStorage.setItem("message", JSON.stringify(result.message));
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
            {...register("email")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic capitalize">
            {errors.email?.message}
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

export default ClientSignUpPage;
