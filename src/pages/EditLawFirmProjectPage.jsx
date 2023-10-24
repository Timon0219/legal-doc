import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import Select from "react-select";
import moment from "moment";

let sdk = new MkdSDK();

const EditLawFirmProjectPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({
      name: yup.string().required(),
      launch_date: yup
        .date()
        .required()
        .typeError("Date must be of format: MM/DD/YYYY"),
      no_of_parties_outreach: yup.number().required().positive().integer(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState({});
  const user_id = JSON.parse(localStorage.getItem("user"));

  const [showNdaButton, setShowNdaButton] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { id } = useParams();
  const getClients = async (data) => {
    try {
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? ` ${
                  data.user_id
                    ? `forkfirm_law_firm_client.law_firm_id=${data.user_id}`
                    : "1"
                } `
              : "1",
          ],
          page: 1,
          limit: 999999,
        },
        "VIEWCLIENTLAWFIRMS"
      );
      const { list: clientList } = result;
      console.log(result);
      let newListOfArray = [];
      clientList.forEach((val) =>
        newListOfArray.push({
          label: `${val.first_name} ${val.last_name ? val.last_name : ""}`,
          value: val.id,
        })
      );
      setClients(newListOfArray);
    } catch (error) {
      console.log("Error", error);
      tokenExpireError(dispatch, error.message);
    }
  };
  useEffect(
    function () {
      (async function () {
        try {
          sdk.setTable("project");
          const result = await sdk.callRestAPI({ id: Number(id) }, "GET");
          if (!result.error) {
            setValue("name", result.model.name);
            setValue("client_id", result.model.client_id);
            setValue(
              "launch_date",
              moment(result.model.launch_date).format("yyyy-MM-DD")
            );
            setValue(
              "no_of_parties_outreach",
              result.model.no_of_parties_outreach
            );
            setValue("playbook", result.model.playbook);
            setValue("nda", result.model.nda);

            setShowNdaButton(
              result.model.nda || result.model.nda2 || result.mode.nda3
            );

            setClient(
              clients.find((item) => item.value === result.model.client_id) ||
                {}
            );
          }
        } catch (error) {
          console.log("error", error);
          tokenExpireError(dispatch, error.message);
        }
      })();
    },
    [clients]
  );
  useEffect(() => {
    if (user_id) {
      getClients({ user_id });
    }
  }, [user_id]);

  const onSubmit = async (data) => {
    try {
      const result = await sdk.callRestAPI(
        {
          id: id,
          name: data.name,
          client_id: client.client_id,
          launch_date: moment(data.launch_date).format("yyyy-MM-DD"),
          no_of_parties_outreach: data.no_of_parties_outreach,
        },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        navigate("/lawfirm/projects");
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
      setError("name", {
        type: "manual",
        message: error.message,
      });
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "project",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit Project</h4>
      <div className=" md:grid grid-cols-[45%_50%] gap-[5%]">
        <form className=" w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              placeholder="name"
              {...register("name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.name?.message}
            </p>
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="client_id"
            >
              Client
            </label>
            <Select
              options={clients}
              value={client}
              onChange={(e) => setClient(e)}
            />
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="launch_date"
            >
              Launch Date
            </label>
            <input
              type="date"
              placeholder="launch_date"
              {...register("launch_date")}
              className={`"shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline ${
                errors.launch_date?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.launch_date?.message}
            </p>
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="no_of_parties_outreach"
            >
              # Of Parties Outreach
            </label>
            <input
              placeholder="# Of Parties OutReach"
              {...register("no_of_parties_outreach")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.no_of_parties_outreach?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.no_of_parties_outreach?.message}
            </p>
          </div>

          {loading ? (
            <p className=" capitalize block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Loading...
            </p>
          ) : (
            <button
              type="submit"
              className=" capitalize block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          )}
        </form>
        <div className=" ">
          <div className="mt-4 sticky top-[10%] left-0">
            {showNdaButton && (
              <Link
                to={`/lawfirm/view_nda/${id}`}
                className="capitalize bg-[#2b51dc] block m-4 py-2 px-6 text-md text-white font-medium text-center"
              >
                See and Update already Uploaded NDA
              </Link>
            )}
            <Link
              to={`/lawfirm/view_playbook/${id}`}
              className="capitalize bg-[#2b51dc] block m-4 py-2 px-6 text-md text-white font-medium text-center"
            >
              See and Update already Uploaded playbook
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLawFirmProjectPage;
