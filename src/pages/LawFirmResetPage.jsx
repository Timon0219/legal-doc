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

const LawFirmResetPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState(false);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const schema = yup
    .object({
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
    let sdk = new MkdSDK();
    setLoading(true);
    try {
      const result = await sdk.reset(token, code, data.password);
      if (!result.error) {
        setLoading(false);
        showToast(dispatch, "Password Reset");
        setTimeout(() => {
          navigate("/lawfirm/login");
        }, 2000);
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
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="code"
            >
              Code
            </label>
            <input
              type="number"
              required
              onChange={handleInputChange}
              placeholder="Enter code sent to your email"
              className={`remove-arrow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.code?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.code?.message}
            </p>
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
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
                  value="Reset Password"
                />
              </>
            )}
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              to="/lawfirm/login"
            >
              Login?
            </Link>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} forkfirm. All rights reserved.
        </p>
      </div>
    </>
  );
};

export default LawFirmResetPage;
