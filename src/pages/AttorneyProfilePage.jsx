import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { AuthContext, tokenExpireError } from "../authContext";
import DocIcon from "../components/svcIcon/DocIcon";
import { useEffect } from "react";
import { useNavigate } from "react-router";

let sdk = new MkdSDK();

const AttorneyProfilePage = () => {
  const schema = yup
    .object({
      email: yup.string().email().required(),
    })
    .required();

  const [oldEmail, setOldEmail] = useState("");
  const [oldName, setOldName] = useState("");
  const [docID, setDocID] = React.useState(null);
  const [attorney, setAttorney] = useState([]);
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const [documentUrl, setDocumentUrl] = useState("");
  const [attorneyVerified, setAttorneyVerified] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  async function verifyAttorneyLicense() {
    try {
      sdk.setTable("attorney");
      const result = await sdk.callRestAPI(
        {
          where: [`forkfirm_user.id=${user_id}`],
          page: 1,
          limit: 10,
        },
        "PAGINATE"
      );

      const { list, total, limit, num_pages, page } = result;
      if (!list[0].attorney_license) {
        console.log("attorney not verified");
        navigate(`/attorney/license`);
        return;
      }
      console.log("attorney verified");
      setAttorneyVerified(true);
      setAttorney(list);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  async function fetchAttorneyProfile() {
    try {
      const result = await sdk.getProfile();
      setValue("email", result.email);
      setValue(
        "name",
        `${result.first_name ? result.first_name : "N/A"} ${
          result.last_name ? result.last_name : " "
        }`
      );
      setOldEmail(result.email);
      setOldName(`${result.first_name} ${result.last_name}`);
    } catch (error) {
      console.log("Error", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "profile",
      },
    });

    verifyAttorneyLicense();
  }, []);

  useEffect(() => {
    if (attorneyVerified) {
      fetchAttorneyProfile();
    }
  }, [attorneyVerified]);

  const onSubmit = async (data) => {
    try {
      if (oldEmail !== data.email) {
        const emailresult = await sdk.updateEmail(data.email);
        if (!emailresult.error) {
          showToast(globalDispatch, "Profile Updated", 1000);
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
          showToast(globalDispatch, "Profile Updated", 2000);
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
        showToast(globalDispatch, "Profile Updated", 2000);
      }

      if (docID && data.expiry_date) {
        sdk.setTable("profile");
        const result = await sdk.callRestAPI(
          {
            set: {
              attorney_expiry_date: data.expiry_date,
              attorney_license: docID,
            },
            where: {
              user_id: user_id,
            },
          },
          "PUTWHERE"
        );

        if (!result.error) {
          console.log(result);
          showToast(globalDispatch, "Profile Updated", 2000);
        }
      } else {
        showToast(globalDispatch, "Profile Updated", 2000);
      }

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

  const uploadFile = async (e) => {
    console.log("my");
    console.log(e.target.files);
    const newUrl = URL.createObjectURL(e.target.files[0]);
    console.log(newUrl);
    setDocumentUrl(newUrl);
    let formData = new FormData();
    formData.append("file", e.target.files[0]);
    const result = await sdk.upload(formData, "POST");

    setDocID(result.id);

    console.log(result);
  };

  if (!attorneyVerified) return null;

  return (
    <>
      <main>
        <div className="bg-white shadow rounded p-5  ">
          <h4 className="text-2xl font-medium">Edit Profile</h4>
          <div className="grid grid-cols-2 gap-5 ">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mt-5 ">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Name"
                  {...register("name")}
                />
                <p className="text-red-500 text-xs italic">
                  {errors.name?.message}
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

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  License
                </label>

                <div
                  className={
                    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline relative h-[150px] cursor-pointer  "
                  }
                >
                  <input
                    // {...register("license")}
                    className="absolute top-0 left-0 w-full h-full opacity-0  cursor-pointer "
                    onChange={uploadFile}
                    id="license"
                    type="file"
                  />
                  <label
                    className=""
                    htmlFor="license"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <DocIcon caption="Update License" />
                  </label>
                </div>

                <p className="text-red-500 text-xs italic">
                  {errors.password?.message}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Expiry Date
                </label>
                <input
                  defaultValue={
                    attorney.length > 0 ? attorney[0].attorney_expiry_date : ""
                  }
                  {...register("expiry_date")}
                  className={
                    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  }
                  id="expiry_date"
                  type="date"
                />
                <p className="text-red-500 text-xs italic">
                  {errors.expiry_date?.message}
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
            <div className="">
              <p className=" capitalize text-xl py-3  ">License :</p>
              {documentUrl ? (
                <>
                  {" "}
                  <embed
                    src={documentUrl}
                    className="h-auto w-full min-h-[500px] mt-4 "
                  />
                </>
              ) : (
                <>
                  {attorney.length > 0 && (
                    <embed
                      src={attorney[0].attorney_license}
                      className="h-auto w-full min-h-[500px] mt-4 "
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AttorneyProfilePage;
