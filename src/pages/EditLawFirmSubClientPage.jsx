import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import Select from "react-select";

let sdk = new MkdSDK();

const EditLawFirmSubClientPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({
      name: yup.string().required(),
      email: yup.string().email().required(),
      associated_client: yup.string().optional(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const statusRef = React.useRef(null);
  const [clients, setClients] = React.useState([]);
  const clientRef = useRef(null);
  const [law_firm_id, setLawFirmId] = useState(0);
  const [client_id, setClientId] = useState(0);
  const [id, setId] = useState(0);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const params = useParams();
  const location = useLocation();

  useEffect(function () {
    (async function () {
      try {
        sdk.setTable("user");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {
          console.log(result);
          setValue(
            "name",
            (result.model.first_name ? result.model.first_name : "") +
              " " +
              (result.model.last_name ? result.model.last_name : "")
          );
          setValue("email", result.model.email ? result.model.email : "N/A");
          setValue("status", result.model.status ? result.model.status : 0);

          let associated_client = location.state.client_first_name
            ? location.state.client_first_name +
              " " +
              location.state.client_last_name
            : "N/A";
          let index = null;
          setLawFirmId(result.model.law_firm_id);
          setClientId(result.model.client_id);
          setId(result.model.id);
          sdk.setTable("user");
          const clientResult = await sdk.callRestAPI(
            {
              where: [
                ` ${
                  user_id
                    ? `forkfirm_law_firm_client.law_firm_id=${user_id}`
                    : "1"
                } `,
              ],
              page: 1,
              limit: 99999,
            },
            "VIEWCLIENTLAWFIRMS"
          );

          console.log(clientResult);
          let arr = [];
          clientResult.list.forEach((val, ind) => {
            let label =
              (val["first_name"] ? val["first_name"] : "") +
              " " +
              (val["last_name"] ? val["last_name"] : "");

            if (label === associated_client) {
              index = ind;
            }

            arr.push({
              value: val.id,
              label,
            });
          });
          console.log(index);
          setClients(arr);
          if (index != null) {
            clientRef.current.setValue(arr[index]);
          }
        }
      } catch (error) {
        console.log("error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    console.log(data);
    try {
      let subclient_name, client_name, client_id;

      if (clientRef.current.getValue().length) {
        client_name = clientRef.current.getValue()[0].label;
        client_id = clientRef.current.getValue()[0].value;
      }

      if (data.name) {
        subclient_name = data.name.split(" ");
      }

      if (client_name) {
        client_name = client_name.split(" ");
      }

      sdk.setTable("user");
      let payload = {
        id,
        first_name: subclient_name[0],
        last_name: subclient_name[1],
        email: data.email,
        status: data.status,
      };

      const result = await sdk.callRestAPI(payload, "PUT");

      if (!result.error) {
        sdk.setTable("client_subclient");
        if (location.state.forkfirm_client_subclient_id != null) {
          const result2 = await sdk.callRestAPI(
            {
              client_id,
              // subclient_id: id,
              id: location.state.forkfirm_client_subclient_id,
            },
            "PUT"
          );
          console.log(result2);
        } else {
          const result2 = await sdk.callRestAPI(
            {
              client_id,
              subclient_id: id,
            },
            "POST"
          );
          console.log(result2);
        }
        showToast(globalDispatch, "Updated");
        navigate("/lawfirm/subclient");
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
      setError("law_firm_id", {
        type: "manual",
        message: error.message,
      });
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "subclient",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <div className="flex justify-between">
        <h4 className="text-2xl font-medium">Edit Sub-Client</h4>
      </div>

      <form className="mt-4 w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            placeholder=""
            {...register("name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.name?.message}</p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            placeholder=""
            type="email"
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
            htmlFor="associated_client"
          >
            Associated Client
          </label>
          <Select options={clients} ref={clientRef} />
          <p className="text-red-500 text-xs italic">
            {errors.associated_client?.message}
          </p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <select
            {...register("status")}
            className={`"shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email?.message ? "border-red-500" : ""
            }`}
          >
            <option value="0">Inactive</option>
            <option value="1">Active</option>
          </select>
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

export default EditLawFirmSubClientPage;
