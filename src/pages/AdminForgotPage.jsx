import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";

let sdk = new MkdSDK();

const AdminForgotPage = () => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const schema = yup
    .object({
      email: yup.string().email().required(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { dispatch } = React.useContext(GlobalContext);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await sdk.forgot(data.email, "admin");

      if (!result.error) {
        setLoading(false);
        showToast(dispatch, "Reset Code Sent");
        localStorage.setItem(
          "message",
          JSON.stringify(
            "Please Check Your Email for Reset Password Instructions"
          )
        );
        navigate("/verification-modal");
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
  };

  return (
    <>
      <div className="w-full max-w-xs mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 "
        >
          <h2 className="font-bold text-xl text-center">Forgot Password?</h2>
          <div className="mb-4 mt-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.email?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.email?.message}
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
                  value="Submit"
                />
              </>
            )}

            {/* <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              to="/admin/login"
            >
              Login?
            </Link> */}
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} forkfirm. All rights reserved.
        </p>
      </div>
    </>
  );
};

export default AdminForgotPage;
