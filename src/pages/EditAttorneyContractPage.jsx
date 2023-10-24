import React, { useState } from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { parseJsonSafely } from "../utils/utils";

import { useEffect } from "react";
import CheckBoxControlled from "../components/CheckBoxControlled";
import SelectableControlled from "../components/SelectableControlled";
import dayjs from "dayjs";
import moment from "moment";
import DatePicker from "react-multi-date-picker";
import InputIcon from "react-multi-date-picker/components/input_icon";

const turnaround = [
  {
    id: 0,
    name: "Standard",
  },
  {
    id: 1,
    name: "Expedited",
  },
];

export default function EditClientContractPage() {
  const [loading, setLoading] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const { dispatch } = React.useContext(AuthContext);
  const user_id = parseInt(localStorage.getItem("user"));
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { id } = useParams();
  // const [date, setDate] = useState("");

  const schema = yup.object({
    project_name: yup.string().required("This field is required"),
    type_of_document: yup.string(),
    counter_party_name: yup.string().required(),
    counter_party_known: yup.boolean().required(),
    doc_type_id: yup.number().required(),
    counter_party_email: yup.array(yup.object()),
    cc: yup.array(yup.object()),
  });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const counterPartyKnown = watch("counter_party_known");

  let sdk = new MkdSDK();

  const onSubmit = async (data) => {
    console.log("submitting", data);
    setLoading(true);
    try {
      sdk.setTable("contract");
      await sdk.callRestAPI(
        {
          id,
          counter_party_known: data.counter_party_known ? 0 : 1,
          project_name: data.project_name,
          counter_party_email: JSON.stringify(
            data.counter_party_email.map((field) => field.value)
          ),
          counter_party_name: data.counter_party_name,
          cc: JSON.stringify(data.cc.map((field) => field.value)),
          doc_type_id: data.doc_type_id,
          delivery: data.delivery,
          // date_updated: dayjs(new Date(date)).format("YYYY-MM-DD HH:mm:ss"),
          // date_updated: dayjs(data.date_updated).format("YYYY-MM-DD HH:mm:ss"),
        },
        "PUT"
      );
      showToast(globalDispatch, "Contract Edited Successfully");
      navigate("/attorney/pending_contracts");
    } catch (err) {
      tokenExpireError(dispatch, err.message);
      showToast(globalDispatch, err.message, 5000, "ERROR");
    }
    setLoading(false);
  };

  async function fetchContract() {
    try {
      sdk.setTable("contract");

      const result = await sdk.callRestAPI({ id }, "GET");
      console.log("res", result);
      setValue("project_name", result.model.project_name);
      setValue("counter_party_name", result.model.counter_party_name);
      setValue("counter_party_known", result.model.counter_party_known == 0);
      setValue("delivery", result.model.delivery);
      setValue("doc_type_id", result.model.doc_type_id);
      // setValue(
      //   "date_updated",
      //   `${
      //     result.model.date_updated
      //       ? moment(result.model.date_updated).format("MM/DD/yyyy")
      //       : ""
      //   }`
      // );
      setValue(
        "counter_party_email",
        parseJsonSafely(result.model.counter_party_email, []).map((v) => ({
          label: v,
          value: v,
        }))
      );
      setValue(
        "cc",
        parseJsonSafely(result.model.cc, []).map((v) => ({
          label: v,
          value: v,
        }))
      );
      // if (result.model.date_updated) {
      //   setDate(new Date(result.model.date_updated));
      // }
      fetchDocType(result.model.client_id);
    } catch (err) {
      tokenExpireError(dispatch, err.message);
      showToast(globalDispatch, err.message);
    }
  }

  async function fetchDocType(client_id) {
    try {
      sdk.setTable("client_rate");
      const clientResult = await sdk.getClientRates({
        where: [`forkfirm_user.id = ${client_id}`],
        page: 1,
        limit: 1000,
      });

      const { list, total, limit, num_pages, page } = clientResult;

      let clientDocTypes = list.map((val) => val.rate && val.doc_name);

      sdk.setTable("doc_type");
      const result = await sdk.callRestAPI("", "GETALL");
      let finalDocTypes = await result.list.filter(
        (val) => clientDocTypes.indexOf(val.name) !== -1
      );
      setDocTypes(finalDocTypes);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "pending_contracts",
      },
    });

    (async function () {
      await fetchContract();
    })();
  }, []);

  useEffect(() => {
    if (counterPartyKnown) {
      setValue("counter_party_name", "unknown");
    } else {
      setValue("counter_party_name", "");
    }
  }, [counterPartyKnown]);

  const onError = (err) => {
    console.log("err", err);
  };

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <h4 className="text-2xl font-medium">Edit Contract</h4>
        <div className="filter-form-holder mt-10">
          <div className="w-full grid grid-cols-[45%_50%] gap-[5%] ">
            <div className="">
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="project_name"
                >
                  Project Name
                </label>
                <input
                  placeholder="Project Name"
                  id="project_name"
                  {...register("project_name")}
                  className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.project_name?.message ? "border-red-500" : ""
                  }`}
                />
                <p className="text-red-500 text-xs italic">
                  {errors.project_name?.message}
                </p>
              </div>
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="additional_emails"
                >
                  Counter party
                </label>
                <input
                  placeholder="Counter Party"
                  readOnly={counterPartyKnown == 1}
                  {...register("counter_party_name")}
                  className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.counter_party_name?.message ? "border-red-500" : ""
                  }`}
                />
                <input
                  type="checkbox"
                  className="mt-4"
                  {...register("counter_party_known")}
                  id="unknown"
                />
                <label htmlFor="unknown" className="m-2">
                  unknown?
                </label>
                <p className="text-red-500 text-xs italic">
                  {errors.counter_party_name?.message}
                </p>
              </div>
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="additional_emails"
                >
                  Counter party email (Optional)
                </label>
                <SelectableControlled
                  name="counter_party_email"
                  control={control}
                />
              </div>
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="additional_emails"
                >
                  Additional Emails to CC (Optional)
                </label>
                <SelectableControlled name="cc" control={control} />
              </div>
              <div className="mb-6 mt-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-3"
                  htmlFor="delivery"
                >
                  Standard turnaround or Expedited?
                </label>

                <div className="flex items-center">
                  {turnaround.map((item, i) => (
                    <CheckBoxControlled
                      name="delivery"
                      control={control}
                      item={item}
                      key={i}
                    />
                  ))}
                </div>

                <p className="text-red-500 text-xs italic">
                  {errors.delivery?.message &&
                    "Delivery Type is required field"}
                </p>
              </div>
              {docTypes?.length ? (
                <div className="mb-6 mt-6 w-full pr-2 pl-2">
                  <label className="block text-gray-700 text-sm font-bold mb-3">
                    Select the type of document
                  </label>

                  <div className="flex items-center flex-wrap gap-3">
                    {docTypes?.map((item, i) => (
                      <CheckBoxControlled
                        name="doc_type_id"
                        control={control}
                        item={item}
                        key={item.id}
                      />
                    ))}
                  </div>

                  <p className="text-red-500 text-xs italic">
                    {errors.doc_type_id?.message &&
                      "Doc Type is a required field"}
                  </p>
                </div>
              ) : (
                ""
              )}

              {/* <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="date_updated"
                >
                  Date Updated
                </label>
                <p className="block text-gray-700 text-sm font-semibold mb-2">
                  DD/MM/YYYY
                </p>
                <DatePicker
                  value={date}
                  format="DD/MM/YYYY"
                  containerClassName="w-full"
                  onChange={setDate}
                  render={
                    <InputIcon
                      placeholder="Date Updated"
                      id="date_updated"
                      className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.date_updated?.message ? "border-red-500" : ""
                      }`}
                    />
                  }
                />
                <p className="text-red-500 text-xs italic">
                  {errors.date_updated?.message}
                </p>
              </div> */}
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
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
