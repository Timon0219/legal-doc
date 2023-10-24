import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();

const ClientViewExecutedDocumentsListPage = () => {
  const [contracts, setContracts] = useState();
  const [docFiles, setDocFiles] = useState([]);

  const params = useParams();
  const { id } = params;
  console.log(id);
  const getData = async () => {
    const result2 = await sdk.callRawAPI(
      "/v2/api/forkfirm/admin/contract/doc",
      {
        where: [`forkfirm_contract.id=${id}`],
        page: 1,
        limit: 10,
      },
      "POST"
    );
    setContracts(result2.list[0]);
  };
  useEffect(() => {
    id && getData();
  }, [id]);

  // useEffect(() => {
  //   if (contracts?.executed_doc_url) {
  //     {
  //       window.open(contracts.executed_doc_url, "__blank");
  //     }
  //   }
  // }, [contracts]);

  console.log(contracts);
  console.log(docFiles, "image");
  return (
    <div className="bg-white shadow rounded p-8 ">
      <div className="grid grid-cols-2 gap-6 ">
        {contracts && contracts.executed_doc_url && (
          <div className="">
            <a
              href={contracts.executed_doc_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>
            {contracts.executed_doc_url.toLowerCase().endsWith(".docx") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc_url}`}
                width="100%"
                height="800"
              ></iframe>
            ) : contracts.executed_doc_url.toLowerCase().endsWith(".doc") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc_url}`}
                width="700"
                height="800"
              ></iframe>
            ) : (
              <embed
                src={contracts.executed_doc_url}
                className="h-auto w-full min-h-[500px] mt-4"
              />
            )}
          </div>
        )}

        {contracts && contracts.executed_doc1_url && (
          <div className="">
            <a
              href={contracts.executed_doc1_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>
            {contracts.executed_doc1_url.toLowerCase().endsWith(".docx") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc1_url}`}
                width="100%"
                height="800"
              ></iframe>
            ) : contracts.executed_doc1_url.toLowerCase().endsWith(".doc") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc1_url}`}
                width="700"
                height="800"
              ></iframe>
            ) : (
              <embed
                src={contracts.executed_doc1_url}
                className="h-auto w-full min-h-[500px] mt-4"
              />
            )}
          </div>
        )}
        {/* {contracts && contracts.executed_doc1 && (
          <div className="">
            <a
              href={contracts.executed_doc1}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>
            <embed
              src={contracts.executed_doc1}
              className="h-auto w-full min-h-[500px] mt-4 "
            />
          </div>
        )} */}
        {contracts && contracts.executed_doc2_url && (
          <div className="">
            <a
              href={contracts.executed_doc2_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>
            {contracts.executed_doc2_url.toLowerCase().endsWith(".docx") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc2_url}`}
                width="100%"
                height="800"
              ></iframe>
            ) : contracts.executed_doc2_url.toLowerCase().endsWith(".doc") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc2_url}`}
                width="700"
                height="800"
              ></iframe>
            ) : (
              <embed
                src={contracts.executed_doc2_url}
                className="h-auto w-full min-h-[500px] mt-4"
              />
            )}
          </div>
        )}
        {contracts && contracts.executed_doc3_url && (
          <div className="">
            <a
              href={contracts.executed_doc3_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>

            {contracts.executed_doc3_url.toLowerCase().endsWith(".docx") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc3_url}`}
                width="100%"
                height="800"
              ></iframe>
            ) : contracts.executed_doc3_url.toLowerCase().endsWith(".doc") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.executed_doc3_url}`}
                width="700"
                height="800"
              ></iframe>
            ) : (
              <embed
                src={contracts.executed_doc3_url}
                className="h-auto w-full min-h-[500px] mt-4"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientViewExecutedDocumentsListPage;
