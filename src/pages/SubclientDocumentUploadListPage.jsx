import React, { useState } from "react";
import { AuthContext, tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { useForm } from "react-hook-form";
import { json, useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue, shorten } from "../utils/utils";
import CreatableSelect from "react-select/creatable";
import CheckBox from "../components/CheckBox";

let sdk = new MkdSDK();

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

const getValueHandle = (emails) => {
  return emails.map((item) => item.value);
};

const SubclientDocumentUploadListPage = () => {
  const [loading, setLoading] = useState(false);
  const [counterEmail, setCounterEmail] = useState([]);
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [counterParty, setCounterParty] = useState("");
  const [counterEmailReq, setCounterEmailReq] = useState(false);
  const [AdditionalEmailReq, setAdditionalEmailReq] = useState(false);
  const [document, setDocument] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [subclient, setSubclient] = useState([]);
  const [originator, setOriginator] = useState("");
  const [documentReq, setDocumentReq] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [docType, setDocType] = useState([]);
  const { dispatch } = React.useContext(AuthContext);
  const user_id = parseInt(localStorage.getItem("user"));
  // const counterPartyRef = React.useRef();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const schema = yup.object({
    project_name: yup.string().required("Project name is required"),
    standard_turnaround: yup.string().required(),
    type_of_document: yup.string().required(),
  });
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  let sdk = new MkdSDK();

  const onSubmit = (data) => {
    // show an error if there's no doc type
    if (isNaN(Number(data.type_of_document))) {
      showToast(
        globalDispatch,
        "You cannot upload a contract without a doc type"
      );
      return;
    }
    setLoading(true);
    console.log(data);
    if (document.length === 0) {
      setDocumentReq(true);
      setLoading(false);
    } else {
      if (subclient.length > 0 && subclient[0].client_id) {
        const allCounterEmail = getValueHandle(counterEmail);
        const allAdditionalEmails = getValueHandle(additionalEmails);
        const formData = new FormData();
        document.forEach((val) => formData.append("files", val));

        sdk
          .uploads(formData, "Post")
          .then((res) => {
            setDocumentReq(false);
            console.log(res);
            if (res.success) {
              const user_id = JSON.parse(localStorage.getItem("user"));
              const dataList = {
                counter_party_known: isChecked ? 0 : 1,
                project_name: data.project_name,
                counter_party_email: JSON.stringify(allCounterEmail),
                counter_party_name: counterParty,
                cc: JSON.stringify(allAdditionalEmails),
                doc_type_id: data.type_of_document
                  ? JSON.parse(data.type_of_document)
                  : null,
                document_id: res.attachments[0]?.id,
                document_id2: res.attachments[1]?.id,
                document_id3: res.attachments[3]?.id,
                client_id: subclient[0].client_id,
                originator: user_id,
                originator_name: originator,
                delivery: JSON.parse(data.standard_turnaround),
              };
              console.log(dataList);
              sdk.setTable("contract");
              sdk
                .callRestAPI(dataList, "POST")
                .then((res) => {
                  setLoading(false);
                  if (!res.error) {
                    showToast(globalDispatch, "Contracts uploaded");
                    reset();
                    setDocument("");
                    setCounterEmail([]);
                    setAdditionalEmails([]);
                    setDocumentUrl("");
                    setIsChecked(false);
                    const activityData = {
                      contract_id: res.message,
                      status: 0,
                      date: new Date().toISOString().split("T")[0],
                    };
                    sdk.setTable("activity_log");
                    sdk.callRestAPI(activityData, "POST").then((res) => res);
                    navigate("/subclient/pending_contracts", { replace: true });
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  console.log(err);
                });
            }
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      }
    }
  };

  const getDocType = async () => {
    if (subclient.length > 0) {
      try {
        sdk.setTable("client_rate");

        const clientResult = await sdk.getClientRates({
          where: [
            subclient[0].client_id
              ? `${`forkfirm_user.id = ${subclient[0].client_id}`}`
              : 1,
          ],
          page: 1,
          limit: 10,
        });

        const { list, total, limit, num_pages, page } = clientResult;
        conosle.log(clientResult);
        // let clientDocTypes = list.map((val) => val.rate && val.doc_name);
        let clientDocTypes = list.map((val) => val.doc_name);

        sdk.setTable("doc_type");
        const result = await sdk.callRestAPI("", "GETALL");
        console.log(result);
        let finalDocTypes = result.list.filter(
          (val) => clientDocTypes.indexOf(val.name) !== -1
        );
        setDocType(finalDocTypes);
        if (!finalDocTypes.length > 0) {
          alert(
            "Please request Admin to add your document rates prior to uploading a document."
          );
        }
      } catch (error) {
        console.log("ERROR", error);
        tokenExpireError(dispatch, error.message);
      }
    }
  };

  async function getSubclient() {
    try {
      const result = await sdk.callRawAPI(
        `/v2/api/forkfirm/admin/subclient/subclient`,
        {
          where: [],
          page: 1,
          limit: 10,
        },
        "POST"
      );

      const { list } = result;

      setSubclient(list.filter((item) => item.id === user_id));
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    getSubclient();
  }, [user_id]);
  React.useEffect(() => {
    getDocType();
  }, [subclient]);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "document_upload",
      },
    });

    (async function () {
      const result = await sdk.getProfile();
      console.log(result);

      setOriginator(
        (result.first_name ? result.first_name : "") +
          " " +
          (result.last_name ? result.last_name : "")
      );
    })();
  }, [user_id]);

  const counterPartyEmailsHandle = (e) => {
    setCounterEmail(e);
  };
  const additionalEmailsHandle = (e) => {
    setAdditionalEmails(e);
  };

  const documentHandle = (e) => {
    e.target.files[0] && setDocument([...document, e.target.files[0]]);
  };

  const previewGenerate = (val) => {
    const newUrl = URL.createObjectURL(val);
    setDocumentUrl(newUrl);
  };

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Document Upload </h4>
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
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="additional_emails"
                >
                  Counter party
                </label>
                <input
                  placeholder="Counter Party"
                  readOnly={isChecked}
                  id="counter_party"
                  required
                  value={counterParty}
                  onChange={(e) => setCounterParty(e.target.value)}
                  className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.counter_party?.message ? "border-red-500" : ""
                  }`}
                />
                <input
                  type="checkbox"
                  value={isChecked}
                  id="unknown"
                  className="mt-4"
                  onChange={() => {
                    if (!isChecked) {
                      setCounterParty("unknown");
                    } else {
                      setCounterParty("");
                    }
                    setIsChecked(!isChecked);
                  }}
                />
                <label htmlFor="unknown" className="m-2">
                  Unknown?
                </label>
                <p className="text-red-500 text-xs italic">
                  {errors.counter_party?.message}
                </p>
              </div>
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="additional_emails"
                >
                  Counter party email (Optional)
                </label>
                <CreatableSelect
                  options={counterEmail}
                  value={counterEmail}
                  isMulti
                  onChange={counterPartyEmailsHandle}
                />
                {counterEmailReq && (
                  <p className="text-red-500 text-xs italic">
                    Counter party email Required
                  </p>
                )}
              </div>
              <div className="mb-6 w-full pr-2 pl-2">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="additional_emails"
                >
                  Additional Emails to CC (Optional)
                </label>
                <CreatableSelect
                  options={additionalEmails}
                  value={additionalEmails}
                  isMulti
                  onChange={additionalEmailsHandle}
                />
                {AdditionalEmailReq && (
                  <p className="text-red-500 text-xs italic">
                    Additional email Required
                  </p>
                )}
              </div>
              <div className="mb-6 mt-6 w-full pr-2 pl-2">
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
                  {errors.standard_turnaround?.message &&
                    "Delivery Type is required field"}
                </p>
              </div>
              {docType?.length ? (
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
                    {errors.type_of_document?.message &&
                      "Doc Type is a required field"}
                  </p>
                </div>
              ) : (
                ""
              )}

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
                  id="client-contracts"
                  onChange={documentHandle}
                  className=" absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-[9] "
                  accept="application/pdf, .doc, .docx"
                />
                <label htmlFor="client-contracts block text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto "
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
                        {/* <button
                          onClick={() => previewGenerate(item)}
                          type="button"
                          className=" capitalize text-xs px-2 ml-2 bg-blue-500 hover:bg-blue-700 text-white  rounded focus:outline-none focus:shadow-outline"
                        >
                          Preview
                        </button> */}
                      </div>
                    ))}

                  {document.length > 0 ? (
                    <>
                      <br />
                      <label
                        htmlFor="client-contracts"
                        className=" underline text-[#324bda] "
                      >
                        Click here to upload another document
                      </label>
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
    </>
  );
};

export default SubclientDocumentUploadListPage;
