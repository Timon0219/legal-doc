import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { tokenExpireError } from "../authContext";

let sdk = new MkdSDK();

const ClientProfilePage = () => {
  const schema = yup
    .object({
      full_name: yup.string().optional(),
      email: yup.string().email().required(),
      password: yup.string().optional(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);
  const [oldEmail, setOldEmail] = useState("");
  const [oldName, setOldName] = useState("");
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
        setValue(
          "name",
          (result.first_name ? result.first_name : "") +
            " " +
            (result.last_name ? result.last_name : "")
        );
        setOldEmail(result.email);
        setOldName(result.first_name + " " + result.last_name);
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
      if (data.name && oldName !== data.name) {
        let name = data.name.split(" ");
        let first_name = name[0];
        let last_name;
        if (name.length > 1) {
          last_name = name[1];
        }

        const result = await sdk.editProfile({
          first_name,
          last_name,
        });
        console.log(result);
        showToast(dispatch, "Profile Updated", 2000);
      }

      // if (docID && data.expiry_date) {
      //   sdk.setTable("profile");
      //   const result = await sdk.callRestAPI(
      //     {
      //       set: {
      //         attorney_expiry_date: data.expiry_date,
      //       },
      //       where: {
      //         attorney_license: docID,
      //       },
      //     },
      //     "PUTWHERE"
      //   );

      //   if (!result.error) {
      //     console.log(result);
      //     showToast(dispatch, "Details Updated", 2000);
      //   }
      // }

      console.log(data);
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
        <div className="bg-white shadow rounded p-5 px-10  ">
          <h4 className="text-2xl font-medium mb-8 ">Edit Profile</h4>
          <div className=" w-10/12 mx-auto ">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="full-name"
                  type="text"
                  placeholder="Full Name"
                  {...register("name")}
                />
                <p className="text-red-500 text-xs italic">
                  {errors.full_name?.message}
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
        </div>
      </main>
    </>
  );
};

export default ClientProfilePage;
