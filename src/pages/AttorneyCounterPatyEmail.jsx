import React, { useState } from "react";
import { AuthContext } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "../utils/utils";
import CreatableSelect from "react-select/creatable";
import CheckBox from "../components/CheckBox";

let sdk = new MkdSDK();
const getValueHandle = (emails) => {
  let allEmail = [];
  emails.length > 0 && emails.map((item) => allEmail.push(item.value));
  return allEmail;
};
const AttorneyCounterPatyEmail = () => {
  const [conterEmail, setConterEmail] = useState([]);

  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [contracts, setContracts] = useState();
  const [docType, setDocType] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const schema = yup.object({});
  const { id: contract_id } = useParams();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = (data) => {
    console.log(data);
    try {
      const allCouterEmail = getValueHandle(conterEmail);
      const alladditionalEmails = getValueHandle(additionalEmails);
      const dataList = {
        id: contract_id,
        counter_party_email: JSON.stringify(allCouterEmail),
        cc: JSON.stringify(alladditionalEmails),
      };
      sdk.setTable("contract");
      sdk
        .callRestAPI(dataList, "PUT")
        .then((res) => {
          console.log(res);
          setLoading(false);
          if (!res.error) {
            showToast(globalDispatch, "Emails Are Edited");

            const activityData = {
              contract_id: res.message,
              // status: res.error,
              date: new Date().toLocaleDateString("en-CA"),
            };
            sdk.setTable("activity_log");
            sdk.callRestAPI(activityData, "POST").then((res) => res);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  const getData = async () => {
    sdk.setTable("contract"); //;
    const result = await sdk.callRestAPI(
      {
        where: [`forkfirm_contract.id=${contract_id}`],
        page: 1,
        limit: 10,
      },
      "PAGINATE"
    );

    const { list, total, limit, num_pages, page } = result;
    console.log(list, " list ");
    setContracts(list[0]);
    setValue("project_name", list.length > 0 && list[0].project_name);
    let couterPartyEmail = [];
    list &&
      list.length > 0 &&
      list[0].counter_party_email.map((item) =>
        couterPartyEmail.push({ label: item, value: item })
      );
    setConterEmail(couterPartyEmail);
    let additionalEmail = [];
    list &&
      list.length > 0 &&
      list[0].cc.map((item) =>
        additionalEmail.push({ label: item, value: item })
      );
    console.log(additionalEmail);
    setAdditionalEmails(additionalEmail);
  };
  const getDocType = async () => {
    try {
      sdk.setTable("doc_type");
      const result = await sdk.callRestAPI("", "GETALL");
      console.log(result);
      setDocType(result.list);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };
  React.useEffect(() => {
    getDocType();
  }, []);
  React.useEffect(() => {
    contract_id && getData();
  }, [contract_id]);

  const counterPartyEmailsHandle = (e) => {
    setConterEmail(e);
  };
  const additionalEmailsHandle = (e) => {
    setAdditionalEmails(e);
  };
  const documentHandle = (e) => {
    setDocumentName(e.target.files[0]);
  };

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium capitalize">
          Edit counter Party Email{" "}
        </h4>
        <div className="filter-form-holder mt-10">
          <div className="w-full grid grid-cols-[45%_50%] gap-[5%] ">
            <div className="">
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                  htmlFor="project_name"
                >
                  Project Name
                </label>
                <input
                  readOnly
                  placeholder="Project Name"
                  id="project_name"
                  {...register("project_name", { required: true })}
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
                  className="block text-gray-700 text-sm font-bold mb-2 capitalize"
                  htmlFor="additional_emails"
                >
                  Counter party email
                </label>
                <CreatableSelect
                  options={conterEmail}
                  value={conterEmail}
                  isMulti
                  onChange={counterPartyEmailsHandle}
                />
              </div>
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="additional_emails capitalize"
                >
                  Additional Emails to CC
                </label>
                <CreatableSelect
                  options={additionalEmails}
                  value={additionalEmails}
                  isMulti
                  onChange={additionalEmailsHandle}
                />
              </div>
              {/* <div className="mb-6 mt-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-3"
                  htmlFor="standard_turnaround"
                >
                  Standard turnaround or Expedited?
                </label>

                <div className="flex items-center">
                  {turnaround?.map((item, i) => (
                    <CheckBox
                      name="standard_turnaround"
                      register={register}
                      errors={errors}
                      item={item}
                      key={i}
                    />
                  ))}
                </div>

                <p className="text-red-500 text-xs italic">
                  {errors.standard_turnaround?.message}
                </p>
              </div>
              <div className="mb-6 mt-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-3"
                  htmlFor="Joinder"
                >
                  Select the type of document
                </label>

                <div className="flex items-center flex-wrap gap-3">
                  {docType?.map((item, i) => (
                    <CheckBox
                      name="type_of_document"
                      register={register}
                      errors={errors}
                      item={item}
                      key={i}
                    />
                  ))}
                </div>

                <p className="text-red-500 text-xs italic">
                  {errors.type_of_document?.message}
                </p> 
              </div>*/}
              {loading ? (
                <p className=" capitalize block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Loading...
                </p>
              ) : (
                <button
                  type="submit"
                  className=" capitalize block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Update
                </button>
              )}
            </div>
            <div className="">
              {/* <div className=" relative border  border-solid border-[#111] h-[300px] w-full cursor-pointer ">
                <input
                  type="file"
                  onChange={documentHandle}
                  className=" absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer "
                  // {...register("docoment", { required: true })}
                  accept="application/pdf"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p className=" absolute top-[70%] left-1/2 -translate-x-1/2 w-full text-center font-medium  ">
                  <span className=" underline text-[#324bda] ">Upload</span> Or
                  Drag and Drop a document into this container
                </p>
                <p className=" absolute top-[75%] left-1/2 -translate-x-1/2 w-full text-center font-medium  ">
                  {documentName && documentName}
                </p>
              </div>
              <p className="text-red-500 text-xs italic">
                {errors.docoment?.message}
              </p> */}
              {contracts && (
                <embed
                  src={contracts.document}
                  className="h-auto w-full min-h-[500px] mt-4 "
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AttorneyCounterPatyEmail;
