import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();

const ClientViewDocumentsListPage = () => {
  const [contracts, setContracts] = useState();

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

  console.log(contracts);
  return (
    <div className="bg-white shadow rounded p-8 ">
      <div className="grid grid-cols-2 gap-6 ">
        {contracts && contracts.doc_url && (
          <div className="">
            <a
              href={contracts.doc_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>
            <>
              {contracts.doc_url.toLowerCase().endsWith(".docx") ? (
                      <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.doc_url}`}
                      width="100%"
                      height="800"
                    ></iframe>
              ) : contracts.doc_url.toLowerCase().endsWith(".doc") ? (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.doc_url}`}
                  width="700"
                  height="800"
                ></iframe>
              ) : (
          
              <embed
              src={contracts.doc_url}
              className="h-auto w-full min-h-[500px] mt-4"
            />
              )}
            </>
          </div>
        )}
        {/* {contracts && contracts.doc1_url && (
          <div className="">
            <a
              href={contracts.doc1_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download Document
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/client/contracts_document_update/${contracts.id}/doc1`}
            >
              Change
            </Link>
            <embed
              src={contracts.doc1_url}
              className="h-auto w-full min-h-[500px] mt-4 "
            />
          </div>
        )} */}
        {contracts && contracts.doc2_url && (
          <div className="">
            <a
              href={contracts.doc2_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
                   Download Document
            </a>
            {/* <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/client/contracts_document_update/${contracts.id}/doc2`}
            >
              Change
            </Link> */}
            {contracts.doc2_url.toLowerCase().endsWith(".docx") ? (
               
                <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.doc2_url}`}
                width="100%"
                height="800"
              ></iframe>
              ) : contracts.doc2_url.toLowerCase().endsWith(".doc") ? (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.doc2_url}`}
                  width="700"
                  height="800"
                ></iframe>
              ) : (
                <embed
                src={contracts.doc2_url}
                className="h-auto w-full min-h-[500px] mt-4"
              />
              )}
          </div>
        )}
        {contracts && contracts.doc3_url && (
          <div className="">
            <a
              href={contracts.doc3_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
                 Download Document
            </a>
            {/* <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/client/contracts_document_update/${contracts.id}/doc3`}
            >
              Change
            </Link> */}
             {contracts.doc3_url.toLowerCase().endsWith(".docx") ? (
               
                <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.doc3_url}`}
                width="100%"
                height="800"
              ></iframe>
              ) : contracts.doc3_url.toLowerCase().endsWith(".doc") ? (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.doc3_url}`}
                  width="700"
                  height="800"
                ></iframe>
              ) : (
                <embed
                  src={contracts.doc3_url}
                  className="h-auto w-full min-h-[500px] mt-4"
                />
              )}
          </div>
        )}
        {/* <iframe src='https://docs.google.com/document/d/152biQCrl6BI_NkQDRy7-xv3AAz-XoCAU2Wku4d0RJZM/edit' width='1366px' height='623px' frameborder='0'>This is an embedded <a target='_blank' href='http://office.com'>Microsoft Office</a> document, powered by <a target='_blank' href='http://office.com/webapps'>Office Online</a>.</iframe> */}

        {/* {contracts && (
          <div className="text-center">
            {contracts.doc_url === null && (
              <Link
                to={`/client/contracts_document_update/${contracts.id}/doc`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add document
              </Link>
            )}
            {contracts.doc_url && contracts.doc2_url === null && (
              <Link
                to={`/client/contracts_document_update/${contracts.id}/doc2`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add document
              </Link>
            )}
            {contracts.doc2_url && contracts.doc3_url === null && (
              <Link
                to={`/client/contracts_document_update/${contracts.id}/doc3`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add document
              </Link>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ClientViewDocumentsListPage;
