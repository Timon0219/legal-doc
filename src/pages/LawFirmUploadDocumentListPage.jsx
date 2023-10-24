import React, { useEffect, useState, useRef } from "react";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CheckBox from "../components/CheckBox";
import { AuthContext, tokenExpireError } from "../authContext";
import DurationComponents from "../components/DurationComponents";
import { dateHandle, shorten } from "../utils/utils";
import { CURRENT_ACTIVITY_STATUS } from "../utils/constants";

let sdk = new MkdSDK();

const LawFirmUploadDocumentListPage = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState({});
  const [docType, setDocType] = useState([]);
  const [document, setDocument] = useState("");
  const [documentReq, setDocumentReq] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log("SUBMITTING DATA", data);
    // console.log("submitting", data, contractTag);

    // return;
    if (Number(data.Duration) === 0) {
      showToast(globalDispatch, "Please fill the duration field");
      return;
    }
    try {
      setLoading(true);
      if (!document) {
        setDocumentReq(true);
        setLoading(false);
        return;
      }

      sdk.setTable("contract_tag");
      await Promise.all(
        contractTag
          .filter((item) => item.id)
          .map((item) => {
            return sdk.callRestAPI(
              {
                contract_id: JSON.parse(id),
                tag_id: JSON.parse(item.id),
                input_type: JSON.parse(data[item.name + "_type"]),
                input_duration:
                  data[item.name] === "N/A" ? null : data[item.name],
                // input_duration:
                //   data[item.name] === "N/A"
                //     ? null
                //     : typeof data[item.name] === "string"
                //     ? data[item.name]
                //     : Number(data[item.name]),
              },
              "POST"
            );
          })
      );

      var form = formRef.current;
      var formData = new FormData(form);
      document.forEach((val) => formData.append("files", val));

      const res = await sdk.uploads(formData, "Post");
      setDocumentReq(false);
      if (!res.attachments) return;
      const dataList = {
        id: id,
        executed_doc_type_id: data.type_of_document,
        status: 1,
        executed_at: dateHandle(),
        executed_document_id: res.attachments[0]?.id,
        executed_document_id2: res.attachments[1]?.id,
        executed_document_id3: res.attachments[2]?.id,
        terminated_at: new Date(new Date().setMonth(13))
          .toISOString()
          .split("T")[0],
      };

      sdk.setTable("contract");
      await sdk.callRestAPI(dataList, "PUT");
      setLoading(false);
      if (!res.error) {
        showToast(globalDispatch, "Contracts uploaded");
      }
      const activityData = {
        contract_id: res.message,
        status: CURRENT_ACTIVITY_STATUS.EXECUTED,
        date: new Date().toISOString().split("T")[0],
      };
      sdk.setTable("activity_log");
      await sdk.callRestAPI(activityData, "POST");
      navigate("/lawfirm/executed_contracts");
    } catch (err) {
      showToast(globalDispatch, "ERROR:" + err.message, 4000);
    }
    setLoading(false);
  };

  async function getData(pageNum, limitNum, data) {
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
      console.log(result);
      const { list, total, limit, num_pages, page } = result;
      setContract(list[0]);

      console.log("contract", list[0]);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "upload_excuted_document",
      },
    });
  }, []);

  React.useEffect(() => {
    getData();
  }, [id]);

  const getDocType = async () => {
    try {
      sdk.setTable("client_rate");
      const clientResult = await sdk.getClientRates({
        where: [
          contract.client_id
            ? `${`forkfirm_user.id = ${contract.client_id}`}`
            : 1,
        ],
        page: 1,
        limit: 10,
      });

      const { list, total, limit, num_pages, page } = clientResult;

      let clientDocTypes = list.map((val) => val.rate && val.doc_name);

      sdk.setTable("doc_type");
      const result = await sdk.callRestAPI("", "GETALL");
      let finalDocTypes = await result.list.filter(
        (val) => clientDocTypes.indexOf(val.name) !== -1
      );
      setDocType(finalDocTypes);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  };

  const documentHandle = (e) => {
    console.log(e.target.files[0]);
    let files = Array.from(e.target.files);
    e.target.files[0] && setDocument([...document, e.target.files[0]]);
  };

  const handleDurationAdd = (id, status) => {
    let newCollection;
    if (status) {
      newCollection = [...collectDuration, id];
    } else {
      newCollection = collectDuration.filter((val) => val != id);
    }

    setCollectDuration(newCollection);
  };

  const previewGenerate = (val) => {
    const newUrl = URL.createObjectURL(val);
    setDocumentUrl(newUrl);
  };

  const getAllClientTags = () => {
    const newtags = contract?.client_tag.split(",");

    let newTagsAll = [];
    let allId = [];

    newtags.map((item) => {
      const newtags2 = item.split("|");
      allId.push(JSON.parse(newtags2[1]));
      newTagsAll.push({
        id: JSON.parse(newtags2[1]),
        name: newtags2[0],
        input_type: JSON.parse(newtags2[2]),
        input_duration: 0,
      });
    });
    setCollectDuration(allId);
    setContractTag(newTagsAll);
    console.log("TAGS", newTagsAll);
  };
  useEffect(() => {
    contract?.client_tag && getAllClientTags();
    contract?.client_id && getDocType();
  }, [contract]);

  useEffect(() => {
    if (docType.length > 0) {
      console.log("setting value", contract?.doc_type_id);
      setValue("type_of_document", contract?.doc_type_id);
    }
  }, [docType]);

  useEffect(() => {
    console.log("CONTRACT", contract, docType);
  }, [contract, docType]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <div className="p-5 bg-white shadow rounded mb-10">
        <h3 className=" text-2xl text-[#111] font-semibold ">
          Upload Executed Document{" "}
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
                value={`${contract?.client_first_name ?? "N/A"} ${
                  contract?.client_last_name ?? " "
                }`}
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
                value={contract?.originator_name ?? "N/A"}
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
                value={contract?.project_name ?? "N/A"}
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
                value={contract?.counter_party_name ?? "N/A"}
                className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                readOnly
              />
            </div>
            <div className="flex items-center my-2 flex-wrap pr-2 pl-2">
              <span className=" block text-gray-700 text-sm font-bold mb-2 mr-4 ">
                Counter Party Emails:{" "}
              </span>{" "}
              <div className=" mt-2 border border-solid border-[#dbdbdb] p-3 flex flex-wrap w-full justify-start  ">
                {contract && contract?.counter_party_email?.length > 0 ? (
                  contract?.counter_party_email &&
                  JSON.parse(contract.counter_party_email).map((item, i) => (
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
            {/* <div className="mb-6 mt-6 w-full pr-2 pl-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-3"
                htmlFor="Joinder"
              >
                Select the type of document
              </label>
              <div className="flex items-center flex-wrap gap-3 ">
                {docType.map((item, i) => (
                  <>
                    <CheckBox
                      name="type_of_document"
                      register={register}
                      errors={errors}
                      item={item}
                      key={i}
                      defaultValue={contract?.doc_type_id}
                    />
                    {item.id === contract?.doc_type_id ? true : false}
                  </>
                ))}
              </div>
              {/* 4 */}
            {/* <p className="text-red-500 text-xs italic">
                {errors.type_of_document?.message}
              </p> */}
            {/* </div> */}

            <div className="my-4 mb-8">
              {contractTag.map((item, i) => (
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
          <div className="">
            <div className=" relative border  border-solid border-[#111] min-h-[300px] h-auto py-8 pt-[6rem] w-full cursor-pointer  ">
              <input
                type="file"
                multiple
                disabled={document.length >= 3 ? true : false}
                id="client-contracts"
                onChange={documentHandle}
                className=" absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-[9] "
                accept="application/pdf,application/msword, .doc, .docx"
              />
              <label htmlFor="client-contracts block text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 mx-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </label>
              <div className="  w-full text-center font-medium capitalize ">
                {document.length > 0 &&
                  document.map((item, i) => (
                    <div key={i} className=" relative z-[999] ">
                      {shorten(item.name, 30)}{" "}
                      <button
                        onClick={() => previewGenerate(item)}
                        type="button"
                        className=" capitalize text-xs px-2 ml-2 bg-blue-500 hover:bg-blue-700 text-white  rounded focus:outline-none focus:shadow-outline"
                      >
                        Preview
                      </button>
                    </div>
                  ))}

                {document.length > 0 ? (
                  <>
                    <br />
                    {document.length >= 3 ? (
                      <label
                        htmlFor="client-contracts"
                        className=" underline text-[#303030] "
                      >
                        You can't add more
                      </label>
                    ) : (
                      <label
                        htmlFor="client-contracts"
                        className=" underline text-[#324bda] "
                      >
                        Click here to upload another document
                      </label>
                    )}
                  </>
                ) : (
                  <label htmlFor="client-contracts">
                    <span className=" underline text-[#324bda] ">Upload</span>{" "}
                    Or Drag and Drop a document into this container
                  </label>
                )}
              </div>
            </div>

            {documentReq && (
              <p className="text-red-500 text-xs italic">
                Document is required
              </p>
            )}

            {documentUrl && (
              <embed
                src={documentUrl}
                className="h-auto w-full min-h-[500px] mt-4 "
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default LawFirmUploadDocumentListPage;
