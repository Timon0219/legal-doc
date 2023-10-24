import React, { useState } from "react";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CheckBox from "../components/CheckBox";
import { AuthContext, tokenExpireError } from "../authContext";
import DurationComponents from "../components/DurationComponents";
import { dateHandle } from "../utils/utils";
import { useEffect } from "react";
import CheckBoxControlled from "../components/CheckBoxControlled";

let sdk = new MkdSDK();

const AttorneyEditDocumentListPage = () => {
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [contractTag, setContractTag] = useState([]);
  const [collectDuration, setCollectDuration] = useState([]);

  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup.object({});
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    contractTag.map(async (item, i) => {
      console.log(item, "item", i);
      const newDuLIst = {
        id: item.id,
        input_type: JSON.parse(data[item.name + "_type"]),
        input_duration: data[item.name],
      };
      console.log(newDuLIst, "old");
      sdk.setTable("contract_tag");
      try {
        const result = await sdk.callRestAPI(newDuLIst, "PUT");
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    });

    const dataList = {
      id: id,
      executed_doc_type_id: data.doc_type_id,
    };
    console.log(dataList);
    sdk.setTable("contract");
    sdk
      .callRestAPI(dataList, "PUT")
      .then((res) => {
        console.log(res);
        setLoading(false);
        if (!res.error) {
          showToast(globalDispatch, "Contracts updated");
          const activityData = {
            contract_id: res.message,
            status: 2,
            date: dateHandle(),
          };
          sdk.setTable("activity_log");
          sdk.callRestAPI(activityData, "POST").then((res) => console.log(res));
          // navigate("/attorney/executed_contracts");
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  async function fetchDocTypes(client_id) {
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

  async function getData() {
    try {
      sdk.setTable("contract"); //;
      const result = await sdk.callRestAPI(
        {
          where: [`forkfirm_contract.id=${id}`],
          page: 1,
          limit: 10,
        },
        "PAGINATE"
      );

      if (Array.isArray(result.list) && result.list.length > 0) {
        setContract(result.list[0]);
        setValue("doc_type_id", result.list[0].executed_doc_type_id);
        fetchDocTypes(result.list[0].client_id);
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
        path: "executed_contracts",
      },
    });
  }, []);

  React.useEffect(() => {
    getData();
  }, [id]);

  const handleDurationAdd = (id, status) => {
    console.log(id, status);
    let newCollection;
    if (status) {
      newCollection = [...collectDuration, id];
    } else {
      newCollection = collectDuration.filter((val) => val != id);
    }
    setCollectDuration(newCollection);
  };

  const getAllClientTags = async () => {
    const result = await sdk.callRawAPI(
      "/v2/api/forkfirm/admin/contract/tag",
      {
        where: [`contract_id=${id}`],
        page: 1,
        limit: 10,
      },
      "POST"
    );
    if (Array.isArray(result.list)) {
      setContractTag(result.list);
      result.list.forEach((item) => setValue(item.name, item.input_duration));
    }
  };

  useEffect(() => {
    if (!contract.id) return;
    if (contractTag.length == 0) getAllClientTags();
  }, [contract.id]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="p-5 bg-white shadow rounded mb-10">
        <h3 className=" text-2xl text-[#111] font-semibold ">
          Edit Executed Document{" "}
        </h3>
        <div className="w-full mt-7 grid grid-cols-[45%_50%] gap-[5%] ">
          <div className="">
            <div className="mb-6 w-full pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="project_name"
              >
                Client
              </label>
              <input
                value={
                  contract &&
                  `${
                    contract.client_first_name
                      ? contract.client_first_name
                      : "N/A"
                  } ${
                    contract.client_last_name ? contract.client_last_name : " "
                  }`
                }
                className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                readOnly
              />
            </div>

            <div className="mb-6 w-full pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="project_name"
              >
                Originator
              </label>
              <input
                value={
                  contract.originator_name ? contract.originator_name : "N/A"
                }
                className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                readOnly
              />
            </div>

            <div className="mb-6 w-full pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="project_name"
              >
                Project Name
              </label>
              <input
                value={contract ? contract.project_name : "N/A"}
                className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                readOnly
              />
            </div>
            <div className="mb-6 w-full pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="project_name"
              >
                Counter Party
              </label>
              <input
                value={contract ? contract.counter_party_name : "N/A"}
                className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                readOnly
              />
            </div>
            <div className="flex items-center my-2 flex-wrap pr-2 pl-2 ">
              <span className="block text-gray-700 text-sm font-bold mb-2 mr-4 ">
                Counter Party Emails:{" "}
              </span>{" "}
              <div className=" mt-2 border border-solid border-[#dbdbdb] p-3 flex flex-wrap w-full justify-start  ">
                {contract && contract.counter_party_email?.length > 0 ? (
                  contract.counter_party_email.map((item, i) => (
                    <span className=" mr-4 " key={i}>
                      <a href="mailto:ap@mga.com" className="underline">
                        {item}
                      </a>
                      ,
                    </span>
                  ))
                ) : (
                  <p>N/A</p>
                )}
              </div>
            </div>

            <div className="mb-6 mt-6 w-full pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-3"
                htmlFor="Joinder"
              >
                Select the type of document
              </label>

              <div className="flex items-center flex-wrap gap-3 ">
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
                {errors.doc_type_id?.message}
              </p>
            </div>

            <div className="my-4 mb-8">
              {contractTag.length > 0 &&
                contractTag.map((item, i) => (
                  <DurationComponents
                    key={i}
                    item={item}
                    handleDurationAdd={handleDurationAdd}
                    register={register}
                    setValue={setValue}
                  />
                ))}
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
          </div>
          <div className="text-center">
            <Link
              to={`/attorney/view_executed_document/${contract.id}`}
              className="capitalize block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline underline mt-10 "
            >
              View and edit executed document
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AttorneyEditDocumentListPage;
