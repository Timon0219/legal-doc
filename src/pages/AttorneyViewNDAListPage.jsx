import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();

const AttorneyViewNDAListPage = () => {
  const [contracts, setContracts] = useState();
  const [docFiles, setDocFiles] = useState([]);

  const params = useParams();
  const { id } = params;
  console.log(id);
  const getData = async () => {
    try {
      sdk.setTable("attorney/project");
      const result = await sdk.callRestAPI(
        {
          where: { "forkfirm_project.id": id ? JSON.parse(id) : null },
          page: 1,
          limit: 10,
        },
        "PAGINATE"
      );
      console.log(result);
      const { list, total, limit, num_pages, page } = result;
      setContracts(list[0]);
    } catch (error) {
      console.log("ERROR", error);
      // tokenExpireError(dispatch, error.message);
    }
  };
  useEffect(() => {
    id && getData();
  }, [id]);

  console.log(contracts);
  return (
    <div className="bg-white shadow rounded p-8 ">
      <div className="grid grid-cols-2 gap-6 ">
        {contracts && contracts.nda_url && (
          <div className="">
            <a
              href={contracts.nda_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download NDA
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_nda_update/${contracts.id}/nda`}
            >
              Change
            </Link>
            
             {contracts.nda_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.nda_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.nda_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && contracts.nda1_url && (
          <div className="">
            <a
              href={contracts.nda1_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download NDA
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_nda_update/${contracts.id}/nda1`}
            >
              Change
            </Link>
            {contracts.nda1_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda1_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.nda1_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda1_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.nda1_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && contracts.nda2_url && (
          <div className="">
            <a
              href={contracts.nda2_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download NDA
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_nda_update/${contracts.id}/nda2`}
            >
              Change
            </Link>
            {contracts.nda2_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda2_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.nda2_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda2_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.nda2_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && contracts.nda3_url && (
          <div className="">
            <a
              href={contracts.nda3_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download NDA
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_nda_update/${contracts.id}/nda3`}
            >
              Change
            </Link>
            {contracts.nda3_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda3_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.nda3_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.nda3_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.nda3_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && (
          <div className="text-center">
            {contracts.nda_url === null && (
              <Link
                to={`/attorney/view_nda_update/${contracts.id}/nda`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add NDA
              </Link>
            )}
            {contracts.nda_url && contracts.nda2_url === null && (
              <Link
                to={`/attorney/view_nda_update/${contracts.id}/nda2`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add NDA
              </Link>
            )}
            {contracts.nda2_url && contracts.nda3_url === null && (
              <Link
                to={`/attorney/view_nda_update/${contracts.id}/nda3`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add NDA
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttorneyViewNDAListPage;
