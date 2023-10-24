import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";
import { showToast } from "../globalContext";
import { numberLimited } from "../utils/utils";

const AdminResetPage = () => {
  const [loading, setLoading] = React.useState(false);
  const { dispatch } = React.useContext(AuthContext);
  const [code, setCode] = React.useState(false);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const schema = yup
    .object({
      // code: yup
      //   .number()
      //   .required("Code is required")
      //   .typeError("Code must be a number")
      //   .max(999999, "Code must be 6 digits"),
      password: yup.string().required("Password is required"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    })
    .required();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    console.log(data);
    setLoading(true);
    let sdk = new MkdSDK();
    try {
      if (data.password === data.confirmPassword) {
        // let token = localStorage.getItem("token");
        const result = await sdk.reset(token, code, data.password);
        console.log(result);
        if (!result.error) {
          setLoading(false);
          navigate("/admin/login");
        }
      }
    } catch (error) {
      setLoading(false);
      console.log("Error", error);
      setError("code", {
        type: "manual",
        message: error.message,
      });
    }
  };

  const handleInputChange = ({ target }) => {
    target.value = numberLimited(target.value);
    if (target.value.length >= 6) {
      clearErrors(["code"]);
      setCode(target.value);
    } else {
      setError("code", {
        type: "manual",
        message: "Code must be 6 digits",
      });
    }
  };

  return (
    <>
      <div className="w-full max-w-xs mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 "
        >
          <h2 className="font-bold text-xl text-center">Reset Password</h2>
          <div className="mb-6 mt-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              New Password
            </label>
            <input
              type="password"
              placeholder="******************"
              {...register("password")}
              className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                errors.password?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.password?.message}
            </p>
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="******************"
              {...register("confirmPassword")}
              className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                errors.confirmPassword?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.confirmPassword?.message}
            </p>
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Code
            </label>
            <input
              type="text"
              required
              onChange={handleInputChange}
              // onFocus={handleInputFocus}
              placeholder="Enter code sent to your email"
              className={`remove-arrow shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                errors.code?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.code?.message}
            </p>
          </div>
          <div className="flex items-center justify-center">
            {loading ? (
              <p className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline opacity-60 ">
                Loading...
              </p>
            ) : (
              <>
                <input
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  value="Reset"
                />
              </>
            )}
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} forkfirm. All rights reserved.
        </p>
      </div>
    </>
  );
};

export default AdminResetPage;
