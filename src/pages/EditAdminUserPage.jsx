import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";

let sdk = new MkdSDK();

const roleMap = {
  admin: 0,
  attorney: 1,
  client: 2,
  lawfirm: 3,
  subclient: 4,
};

const EditAdminUserPage = () => {
  const schema = yup
    .object({
      first_name: yup.string().required(),
      last_name: yup.string().optional(),
      email: yup.string().required(),
      // password: yup.string().optional(),
      role: yup.object().required(),
    })
    .required();
  const [userRole, setUserRole] = useState("");
  const [clients, setClients] = useState([]);
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const params = useParams();
  const [oldEmail, setOldEmail] = useState("");
  const [client, setClient] = useState({});
  const [id, setId] = useState(0);
  const statusRef = React.useRef(null);
  const roleRef = React.useRef(null);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectRole = [
    { value: "admin", label: "Admin" },
    { value: "attorney", label: "Attorney" },
    { value: "client", label: "Client" },
    { value: "lawfirm", label: "Law Firm" },
    { value: "subclient", label: "Subclient" },
  ];

  const selectStatus = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];

  /**
   *
   *
   * Use /user/put to update user info
   * use /profile/put to update profile info
   */
  const submitHandler = async (data) => {
    console.log(data);
    let sdk = new MkdSDK();

    let status, role;

    if (statusRef.current.getValue().length) {
      status = parseInt(statusRef.current.getValue()[0].value);
    }

    if (roleRef.current.getValue().length) {
      role = roleRef.current.getValue()[0].value;
    }

    try {
      let user = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        status,
        verify: 1,
        role,
      };

      if (data.password) {
        user.password = data.password;
      }
      console.log(user);
      const result = await sdk.callRestAPI(
        {
          user,
          id: params.id,
        },
        "EDITUSER"
      );
      if (role === "subclient") {
        sdk.setTable("client_subclient");
        const idResult = await sdk.callRestAPI(
          {
            subclient_id: params.id,
            client_id: client.value && client.value,
          },
          "POST"
        );
        console.log(idResult);
      }
      if (!result.error) {
        showToast(dispatch, "Updated Details!");
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

  const getSingleClient = async () => {
    const result = await sdk.callRawAPI(
      `/v2/api/forkfirm/admin/client/subclient`,
      { where: [`subclient.id=${params.id}`], page: 1, limit: 10 },
      "POST"
    );
    const client = {
      value: result.list[0].client_id,
      label:
        (result.list[0].client_first_name
          ? result.list[0].client_first_name
          : "") +
        " " +
        (result.list[0].client_last_name
          ? result.list[0].client_last_name
          : ""),
    };
    console.log(client);
    setClient(client);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "user",
      },
    });
    getClient();
    (async function () {
      try {
        sdk.setTable("user");
        const result = await sdk.callRestAPI(
          {
            customWhere: params
              ? `
                    ${params.id ? `forkfirm_user.id = ${params.id}` : "1"} 
                  `
              : 1,
          },
          "GETALL"
        );

        console.log(result);
        if (!result.error) {
          setValue("email", result.list[0].email);
          setValue("first_name", result.list[0].first_name);
          setValue("last_name", result.list[0].last_name);
          statusRef.current.setValue(selectStatus[result.list[0].status]);
          roleRef.current.setValue(selectRole[roleMap[result.list[0].role]]);

          console.log(selectRole[roleMap[result.list[0].role]], "role set");
          if (selectRole[roleMap[result.list[0].role]].value === "subclient") {
            let associated_client = location.state.client_first_name
              ? location.state.client_first_name +
                " " +
                location.state.client_last_name
              : "N/A";
            console.log(location.state);
          }
          if (location.state.role === "subclient") {
            getSingleClient();
          }
          setOldEmail(result.list[0].email);
          setId(params.id);
        }
      } catch (error) {
        console.log("Error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit User</h4>
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
        {/* <div className="mb-4 ">
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
              errors.password?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.password?.message}
          </p>
        </div> */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Role
          </label>
          <Controller
            {...register("role")}
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <Select
                options={selectRole}
                ref={roleRef}
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
              value={client}
              onChange={(e) => {
                setClient(e);
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
          <p className="text-red-500 text-xs italic">
            {errors.status?.message}
          </p>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditAdminUserPage;
