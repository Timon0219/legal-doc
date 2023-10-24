import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();

const LawFirmViewExecutedDocumentsListPage = () => {
  const [contracts, setContracts] = useState();

  const params = useParams();
  const { id } = params;
  console.log(id);
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
    console.log(list, " list ");
    setContracts(list[0]);
  };
  useEffect(() => {
    id && getData();
  }, [id]);

  console.log(contracts);
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
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/lawfirm/view_executed_document_update/${contracts.id}/executed_doc`}
            >
              Change
            </Link>
           
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
        {/* {contracts && contracts.executed_doc1 && (
          <div className="">
            <a
              href={contracts.executed_doc1}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_executed_document_update/${contracts.id}/executed_doc1`}
            >
              Change
            </Link>
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
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/lawfirm/view_executed_document_update/${contracts.id}/executed_doc2`}
            >
              Change
            </Link>
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
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/lawfirm/view_executed_document_update/${contracts.id}/executed_doc3`}
            >
              Change
            </Link>
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
        {contracts && (
          <div className="text-center">
            {contracts.executed_doc_url === null && (
              <Link
                to={`/lawfirm/view_executed_document_update/${contracts.id}/executed_doc`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add executed document
              </Link>
            )}
            {contracts.executed_doc_url &&
              contracts.executed_doc2_url === null && (
                <Link
                  to={`/lawfirm/view_executed_document_update/${contracts.id}/executed_doc2`}
                  className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
                >
                  Add executed document
                </Link>
              )}
            {contracts.executed_doc2_url &&
              contracts.executed_doc3_url === null && (
                <Link
                  to={`/lawfirm/view_executed_document_update/${contracts.id}/executed_doc3`}
                  className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
                >
                  Add executed document
                </Link>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LawFirmViewExecutedDocumentsListPage;
