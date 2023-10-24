import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import Select from "react-select";
import moment from "moment";

let sdk = new MkdSDK();

const AttorneyAddHoursLogListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState({});
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState({});
  const [contracts, setContracts] = useState([]);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const clientRef = useRef(null);
  const contractRef = useRef(null);

  const schema = yup.object({
    date: yup
      .date()
      .transform((curr, orig) => (orig === "" ? null : curr))
      .typeError("This field is required"),
    description: yup.string().required(),
    hours: yup.number().required().typeError("This field is required"),
    status: yup.number().positive().integer(),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    console.log(data);

    try {
      if (!client?.value) {
        showToast(globalDispatch, "Select Client");
        return;
      }
      // TODO: get lawfirm id of attorney
      // const lawfirmId = await getLawfirmId();
      sdk.setTable("client_hours");
      const result = await sdk.callRestAPI(
        {
          client_id: client.value,
          contract_id: contract?.value,
          hour: data.hours,
          date: moment(data.date).format("yyyy-MM-DD"),
          description: data.description,
        },
        "POST"
      );
      if (result.message === "Validation error") {
        showToast(globalDispatch, "Already have an hour for this client");
        return;
      }
      if (
        !result.error &&
        typeof result.message === "number" &&
        contract?.value
      ) {
        sdk.setTable("contract");
        await sdk.callRestAPI(
          {
            id: contract?.value,
            contract_type: 1,
          },
          "PUT"
        );
      }
      showToast(globalDispatch, "Added new Hour");
      reset();
      setContract("");
      setClients("");
      setClient("");
      setContracts("");
    } catch (error) {
      setLoading(false);
      console.log("Error", error);
      tokenExpireError(dispatch, error.message);
    }

    setLoading(false);
  };

  async function getLawfirmId() {
    // fix this function
    console.log("getting lawfirm id");
    try {
      sdk.setTable("forkfirm_law_firm_attorney");
      const result = await sdk.callRawAPI(
        "/v1/api/rest/forkfirm_law_firm_attorney/PAGINATE",
        { page: 1, limit: 1, where: [`attorney_id = ${user_id}`] },
        "POST"
      );
      console.log("result", result);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function fetchClients() {
    try {
      sdk.setTable("attorney/client");
      const result = await sdk.callRestAPI(
        {
          where: {
            "client.name": null,
            "client.first_name": null,
            "client.last_name": null,
            "client.email": null,
            "attorney.id": user_id,
            "client.id": null,
          },
          page: 1,
          limit: 9999,
        },
        "PAGINATE"
      );

      if (result.error) throw new Error(result.message);

      if (Array.isArray(result.list)) {
        setClients(
          result.list.map((val) => ({
            label: `${val.first_name} ${val.last_name ?? ""}`,
            value: val.id,
          }))
        );
      }
    } catch (err) {
      tokenExpireError(globalDispatch, err.message);
    }
  }

  async function fetchContractIds() {
    try {
      sdk.setTable("contract"); //;
      const result = await sdk.callRestAPI(
        {
          where: [
            `forkfirm_contract.client_id=${client.value} AND forkfirm_contract.status = 0 AND forkfirm_contract.attorney_id IS NOT NULL`,
          ],
          page: 1,
          limit: 999999999,
        },
        "PAGINATE"
      );

      console.log("list", result.list);

      if (result.error) throw new Error(result.message);
      if (Array.isArray(result.list)) {
        setContracts(
          result.list.map((val) => ({ label: val.id, value: val.id }))
        );
      }
    } catch (err) {
      tokenExpireError(globalDispatch, err.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "add_hours",
      },
    });

    fetchClients();
  }, []);

  React.useEffect(() => {
    if (client.value) {
      fetchContractIds();
    }
  }, [client.value]);

  return (
    <form
      className="p-6  bg-white shadow rounded mb-10 w-7/12 mx-auto "
      onSubmit={handleSubmit(onSubmit)}
    >
      <h4 className="text-2xl font-medium">Add Hours</h4>
      <div className="mt-5 w-11/12 mx-auto ">
        <div className="mb-8 w-full pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="client"
          >
            Client
          </label>
          <Select
            options={clients}
            onChange={(e) => setClient(e)}
            ref={clientRef}
          />
          <p className="text-red-500 text-xs italic">
            {errors.client?.message}
          </p>
        </div>

        <div className="mb-8 w-full pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contract_id"
          >
            Contract ID
          </label>
          <Select
            options={contracts}
            onChange={(e) => setContract(e)}
            ref={contractRef}
          />
          <p className="text-red-500 text-xs italic">
            {errors.contract_id?.message}
          </p>
        </div>

        <div className="mb-8 w-full pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contract_id"
          >
            Hours
          </label>
          <input
            type="number"
            placeholder="Hours"
            {...register("hours")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.hours?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.hours?.message}</p>
        </div>
        <div className="mb-8 w-full pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contract_id"
          >
            Date
          </label>
          <input
            type="date"
            placeholder="Date"
            {...register("date")}
            className={`"shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.date?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.date?.message}</p>
        </div>

        <div className="mb-8 w-full pr-2 pl-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contract_id"
          >
            Description
          </label>
          <textarea
            placeholder="Description"
            {...register("description")}
            className={`"shadow appearance-none border min-h-[100px] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.description?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.description?.message}
          </p>
        </div>
      </div>

      {loading ? (
        <p
          type="submit"
          className=" inline-block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Loading...
        </p>
      ) : (
        <button
          type="submit"
          className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      )}
    </form>
  );
};

export default AttorneyAddHoursLogListPage;
