import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();

const AttorneyViewPlaybookListPage = () => {
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
        {contracts && contracts.playbook_url && (
          <div className="">
            <a
              href={contracts.playbook_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download playbook
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_playbook_update/${contracts.id}/playbook`}
            >
              Change
            </Link>
           
             {contracts.playbook_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.playbook_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.playbook_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && contracts.playbook1_url && (
          <div className="">
            <a
              href={contracts.playbook1_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download playbook
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_playbook_update/${contracts.id}/playbook1`}
            >
              Change
            </Link>
            {contracts.playbook1_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook1_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.playbook1_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook1_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.playbook1_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && contracts.playbook2_url && (
          <div className="">
            <a
              href={contracts.playbook2_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download playbook
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_playbook_update/${contracts.id}/playbook2`}
            >
              Change
            </Link>
            {contracts.playbook2_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook2_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.playbook2_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook2_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.playbook2_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && contracts.playbook3_url && (
          <div className="">
            <a
              href={contracts.playbook3_url}
              className="text-lg text-[#4a5fe6] underline capitalize "
              target="blank"
            >
              Download playbook
            </a>
            <Link
              className="text-lg text-[#4a5fe6] underline capitalize ml-6 "
              to={`/attorney/view_playbook_update/${contracts.id}/playbook3`}
            >
              Change
            </Link>
            {contracts.playbook3_url.toLowerCase().endsWith(".docx") ? (
               
               <iframe
               src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook3_url}`}
               width="100%"
               height="800"
             ></iframe>
             ) : contracts.playbook3_url.toLowerCase().endsWith(".doc") ? (
               <iframe
                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${contracts.playbook3_url}`}
                 width="700"
                 height="800"
               ></iframe>
             ) : (
               <embed
                 src={contracts.playbook3_url}
                 className="h-auto w-full min-h-[500px] mt-4"
               />
             )}
          </div>
        )}
        {contracts && (
          <div className="text-center">
            {contracts.playbook_url === null && (
              <Link
                to={`/attorney/view_playbook_update/${contracts.id}/playbook`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add Playbook
              </Link>
            )}
            {contracts.playbook_url && contracts.playbook2_url === null && (
              <Link
                to={`/attorney/view_playbook_update/${contracts.id}/playbook2`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add Playbook
              </Link>
            )}
            {contracts.playbook2_url && contracts.playbook3_url === null && (
              <Link
                to={`/attorney/view_playbook_update/${contracts.id}/playbook3`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add Playbook
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttorneyViewPlaybookListPage;
