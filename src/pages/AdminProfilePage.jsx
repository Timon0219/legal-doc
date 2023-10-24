import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { tokenExpireError, AuthContext } from "../authContext";

let sdk = new MkdSDK();

const AdminProfilePage = () => {
  const schema = yup
    .object({
      email: yup.string().email().required(),
      first_name: yup.string().required(),
      last_name: yup.string().optional(),
      password: yup.string().optional(),
      // current_password: yup.string().optional(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);

  const [oldEmail, setOldEmail] = useState("");
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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
        console.log(result);
        setValue("email", result.email);
        setValue("first_name", result.first_name);
        setValue("last_name", result.last_name);
        setOldEmail(result.email);
      } catch (error) {
        console.log("Error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    console.log(data);
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
      if (data.password) {
        if (data.password.length > 0) {
          const passwordresult = await sdk.updatePassword("", data.password);
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
      }

      let id = localStorage.getItem("user");
      sdk.setTable("user");
      const result = await sdk.callRestAPI(
        {
          first_name: data.first_name,
          last_name: data.last_name,
          id,
        },
        "PUT"
      );
      showToast(dispatch, "Profile Updated", 2000);
    } catch (error) {
      console.log("Error", error);
      setError("password", {
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
                First Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="firstName"
                type="text"
                placeholder=""
                name="first_name"
                {...register("first_name")}
              />
              <p className="text-red-500 text-xs italic">
                {errors.first_name?.message}
              </p>
            </div>
            <div className="mb-4 mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Last Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="lastName"
                type="text"
                placeholder=""
                name="last_name"
                {...register("last_name")}
              />
              <p className="text-red-500 text-xs italic">
                {errors.last_name?.message}
              </p>
            </div>
            <div className="mb-4 mt-4">
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
                placeholder=""
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
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default AdminProfilePage;
