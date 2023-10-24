import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";

const LawFirmLoginPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  const schema = yup
    .object({
      email: yup.string().email().required(),
      password: yup.string().required(),
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
    let sdk = new MkdSDK();
    setLoading(true);
    try {
      const result = await sdk.regularLogin(
        data.email,
        data.password,
        "lawfirm"
      );
      dispatch({ type: "LOGIN", payload: result });
      navigate("/lawfirm/dashboard");
      return;
      // const result = await sdk.login(data.email, data.password, "lawfirm");
      console.log(result);
      if (!result.error) {
        // dispatch({
        //   type: "LOGIN",
        //   payload: result,
        // });
        // navigate("/law_firm/dashboard");
        // localStorage.setItem("one_time_token", result.one_time_token);
        // localStorage.setItem("qr_code", result.qr_code);
        // navigate(`/two_fa/code?role=lawfirm&qr_code=${result.qr_code}`);

        const body = encodeURI(
          `${location.origin}/two_fa?role=lawfirm&token=${result.one_time_token}`
        );
        const result2 = await sdk.sendMail2Fa({
          email: data.email,
          body,
          subject: "Two Factor Authentication",
        });

        console.log(result2);

        if (!result2.error) {
          showToast(globalDispatch, "Link sent Successfully!");
          localStorage.setItem(
            "message",
            JSON.stringify(
              "Please check your email for your two-factor authorization"
            )
          );
          navigate(`/verification-modal`);
          setLoading(false);
        }
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
      console.log("Error", error);
      setLoading(false);
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
        <div className="mb-4">
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
          <p className="text-red-500 text-xs italic">{errors.email?.message}</p>
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
        <div className="flex items-center justify-between">
          <input
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60"
            value="Sign In"
            disabled={loading}
          />
          <Link
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            to="/lawfirm/forgot"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
      <p className="text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} forkfirm. All rights reserved.
      </p>
    </div>
  );
};

export default LawFirmLoginPage;
