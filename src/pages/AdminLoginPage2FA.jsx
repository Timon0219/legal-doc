import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSearchParams } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
import { AuthContext } from "../authContext";
let sdk = new MkdSDK();
const AdminLoginPage2FA = () => {
  const { dispatch } = React.useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  let role = searchParams.get("role");
  //   let qr_code = searchParams.get("qr_code");
  //   console.log(role, qr_code);
  const qr_code = localStorage.getItem("qr_code");
  const one_time_token = localStorage.getItem("one_time_token");

  const schema = yup.object({}).required();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = async (data) => {
    let sdk = new MkdSDK();
    try {
      const result = await sdk.loginTwoFa(data.code, one_time_token);
      console.log(result);
      if (!result.error) {
        // dispatch({
        //   type: "LOGIN",
        //   payload: result,
        // });
        // navigate(`/${role}/dashboard`);
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
      setError("email", {
        type: "manual",
        message: error.message,
      });
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 "
      >
        <h4 className=" text-sm text-center ">
          Download Google Authentictor App and scan the QR code
        </h4>
        <div className="">
          {
            <img
              src="data:image/png;base64,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"
              alt=""
              className=" w-[200px] h-[200px] mx-auto mb-5 "
            />
          }
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Enter your Code
          </label>
          <input
            type="text"
            placeholder="Code here"
            {...register("code")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.code?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.code?.message}</p>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            value="Submit"
          />
          {/* <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              to="/admin/forgot"
            >
              Forgot Password?
            </Link> */}
        </div>
      </form>
      <p className="text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} forkfirm inc. All rights reserved.
      </p>
    </div>
  );
};

export default AdminLoginPage2FA;
