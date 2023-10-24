import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { tokenExpireError } from "../authContext";
import Select from "react-select";
let sdk = new MkdSDK();
const AddAdminUserPage = () => {
  const [userRole, setUserRole] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = React.useState(false);
  const schema = yup
    .object({
      first_name: yup.string().required(),
      last_name: yup.string().optional(),
      email: yup.string().required(),
      password: yup.string().required(),
      role: yup.object().required(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const statusRef = React.useRef(null);
  // const roleRef = React.useRef(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectRole = [
    { value: "admin", label: "Admin" },
    { value: "lawfirm", label: "Law Firm" },
    { value: "attorney", label: "Attorney" },
    { value: "client", label: "Client" },
    { value: "subclient", label: "Subclient" },
  ];
  const selectStatus = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];

  /**
   *
   *
   * Use /user/put to update user remaining info after registration success
   * use /profile/put to update profile info
   */
  const submitHandler = async (data) => {
    console.log(data);
    setLoading(true);

    let status, role;

    if (statusRef.current.getValue().length) {
      status = parseInt(statusRef.current.getValue()[0].value);
    }

    // if (roleRef.current.getValue().length) {
    //   role = roleRef.current.getValue()[0].value;
    // }

    try {
      const result = await sdk.callRestAPI(
        {
          ...data,
          status,
          role: userRole && userRole,
          verify: 1,
        },
        "ADDUSER"
      );
      if (!result.error) {
        console.log(result);
        if (result.role == "subclient") {
          sdk.setTable("client_subclient");
          const idResult = await sdk.callRestAPI(
            {
              subclient_id: result.user_id,
              client_id: selectedClient && selectedClient,
            },
            "POST"
          );
          console.log(idResult);
        }
        showToast(dispatch, "Added");
        navigate("/admin/user");
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
      tokenExpireError(dispatch, error.message);
    }
  };
  async function getClient(pageNum, limitNum, data) {
    try {
      sdk.setTable("user");
      const clientResult = await sdk.callRestAPI(
        { customWhere: "role like 'client'" },
        "GETALL"
      );
      console.log(clientResult);

      if (!clientResult.error) {
        let arr = [];
        clientResult.list.forEach((val) =>
          arr.push({
            value: val.id,
            label:
              (val["first_name"] ? val["first_name"] : "") +
              " " +
              (val["last_name"] ? val["last_name"] : ""),
          })
        );
        setClients(arr);
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "user",
      },
    });
    getClient();
    statusRef.current.setValue(selectStatus[1]);
  }, []);
  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add User</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(submitHandler)}>
        <div className="mb-4 mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            First Name
          </label>
          <input
            type="text"
            placeholder=""
            {...register("first_name")}
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
          <p className="text-red-500 text-xs italic">
            {errors.first_name?.message}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Last Name
          </label>
          <input
            type="text"
            placeholder=""
            {...register("last_name")}
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
          <p className="text-red-500 text-xs italic">
            {errors.last_name?.message}
          </p>
        </div>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            placeholder=""
            {...register("email")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.email?.message}</p>
        </div>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            placeholder=""
            {...register("password")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.password?.message}
          </p>
        </div>
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Role
          </label>
          <Controller
            {...register("role")}
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <Select
                options={selectRole}
                // ref={roleRef}
                onChange={(e) => {
                  onChange(e);
                  setUserRole(e.value);
                }}
              />
            )}
            control={control}
          />
          <p className="text-red-500 text-xs italic">{errors.role?.message}</p>
        </div>
        {userRole == "subclient" && (
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select client for subclient
            </label>
            <Select
              options={clients}
              onChange={(e) => {
                setSelectedClient(e.value);
              }}
            />
            <p className="text-red-500 text-xs italic">
              {errors.role?.message}
            </p>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Status
          </label>
          <Select options={selectStatus} ref={statusRef} />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-60"
          disabled={loading}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddAdminUserPage;
