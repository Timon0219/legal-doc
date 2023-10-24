import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { tokenExpireError } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";

const contra_do_type = {
  doc: "document",
};

const AttorneyContractsDocumentUploadListPage = () => {
  const [document, setDocument] = useState("");
  const [contract, setContract] = useState();
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentReq, setDocumentReq] = useState(false);
  const [loading, setLoading] = useState(false);
  const schema = yup.object({});
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { id, doc } = useParams();
  console.log(doc);
  const navigate = useNavigate();
  let sdk = new MkdSDK();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = (data) => {
    setLoading(true);
    if (!document) {
      setDocumentReq(true);
      setLoading(false);
    } else {
      const formdata = new FormData();
      formdata.append("file", document);

      sdk
        .upload(formdata, "Post")
        .then((res) => {
          setDocumentReq(false);

          if (res.url) {
            let dataList;

            if (doc === "executed_doc") {
              dataList = {
                id,
                executed_document_id: res.id,
              };
            }
            // if (doc === "executed_doc1") {
            //   dataList = {
            //     id,
            //     executed_document_id1: res.id,
            //   };
            // }
            if (doc === "executed_doc2") {
              dataList = {
                id,
                executed_document_id2: res.id,
              };
            }
            if (doc === "executed_doc3") {
              dataList = {
                id,
                executed_document_id3: res.id,
              };
            }

            console.log(dataList);

            sdk.setTable("contract");
            sdk
              .callRestAPI(dataList, "PUT")
              .then((res) => {
                setLoading(false);
                if (!res.error) {
                  console.log(res);
                  showToast(globalDispatch, "Document Updated");
                  const activityData = {
                    contract_id: res.message,
                    // status: res.error,
                    date: new Date().toLocaleDateString("en-CA"),
                  };
                  sdk.setTable("activity_log");
                  sdk.callRestAPI(activityData, "POST").then((res) => res);
                }
                navigate(-1);
              })
              .catch((err) => {
                setLoading(false);
              });
          }
        })
        .catch((err) => {
          setLoading(false);
        });
    }
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

      const { list, total, limit, num_pages, page } = result;

      setContract(list[0]);
      // console.log(list);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  useEffect(() => {
    getData();
  }, [id]);

  // console.log(contract);

  const documentHandle = (e) => {
    setDocument(e.target.files[0]);
    const newUrl = URL.createObjectURL(e.target.files[0]);
    setDocumentUrl(newUrl);
  };
  return (
    <form
      className="p-5 bg-white shadow rounded mb-10"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h4 className="text-2xl font-medium">Document Upload </h4>
      <div className="filter-form-holder mt-10">
        <div className="w-full grid grid-cols-[45%_50%] gap-[5%] ">
          <div className="">
            <div className=" relative border  border-solid border-[#111] h-[300px] w-full cursor-pointer ">
              <input
                type="file"
                onChange={documentHandle}
                className=" absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer "
                accept="application/pdf, .doc,.docx"
                id="attorney-contracts"
              />
              <label htmlFor="attorney-contracts">
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
              </label>
              <label
                htmlFor="attorney-contracts"
                className=" absolute top-[70%] left-1/2 -translate-x-1/2 w-full text-center font-medium "
              >
                {document ? (
                  document.name
                ) : (
                  <>
                    <span className=" underline text-[#324bda] ">Upload</span>{" "}
                    Or Drag and Drop a document into this container
                  </>
                )}
              </label>
            </div>
            {documentReq && (
              <p className="text-red-500 text-xs italic">
                Docoment is required
              </p>
            )}
            {loading ? (
              <p className=" capitalize block ml-2 mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                loading...
              </p>
            ) : (
              <button
                type="submit"
                className=" capitalize block ml-2 mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Submit
              </button>
            )}
          </div>
          <div className="">
            {documentUrl ? (
              <embed
                src={documentUrl}
                className="h-auto w-full min-h-[500px] "
              />
            ) : contract ? (
              <embed
                src={contract[doc]}
                className="h-auto w-full min-h-[500px] "
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default AttorneyContractsDocumentUploadListPage;
