import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();

const AdminViewExecutedDocumentsListPage = () => {
  const [contracts, setContracts] = useState();
  const params = useParams();
  const { id } = params;
  const getData = async () => {
    const result = await sdk.callRawAPI(
      "/v2/api/forkfirm/admin/contract/doc",
      {
        where: [`forkfirm_contract.id=${id}`],
        page: 1,
        limit: 10,
      },
      "POST"
    );

    const { list, total, limit, num_pages, page } = result;
    if (Array.isArray(list) && list.length > 0) {
      console.log("here");
      setContracts(list[0]);
    }
  };
  useEffect(() => {
    id && getData();
  }, [id]);

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

export default AdminViewExecutedDocumentsListPage;
