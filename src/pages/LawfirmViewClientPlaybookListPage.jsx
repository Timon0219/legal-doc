import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();

const LawfirmViewClientPlaybookListPage = () => {
  const [contracts, setContracts] = useState();
  const [docFiles, setDocFiles] = useState([]);

  const params = useParams();
  const { id } = params;
  console.log(id);
  const getData = async () => {
    try {
      const result = await sdk.callRawAPI(
        "/v2/api/forkfirm/admin/client/view-law-firms",
        {
          // where: {
          //   "client.name": null,
          //   "client.first_name": data.client_name ? data.client_name : null,
          //   // "client.last_name": data.last_name ? data.last_name : null,
          //   "client.email": data.primary_email ? data.primary_email : null,
          //   // "attorney.id": data.user_id ? data.user_id : null,
          //   "client.id": null,
          // },

          // where: [`forkfirm_law_firm_client.law_firm_id=71 and forkfirm_user.last_name and forkfirm_user.email and forkfirm_user.first_name`],.
          where: [],
          page: 1,
          limit: 10,
        },
        "post"
      );
      console.log(result);
      const { list, total, limit, num_pages, page } = result;
      setContracts(list.filter((item) => item.id == id)[0]);
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
              to={`/lawfirm/view_client_playbook_update/${contracts.id}/playbook`}
            >
              Change
            </Link>
            <embed
              src={contracts.playbook_url}
              className="h-auto w-full min-h-[500px] mt-4 "
            />
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
              to={`/lawfirm/view_client_playbook_update/${contracts.id}/playbook1`}
            >
              Change
            </Link>
            <embed
              src={contracts.playbook1_url}
              className="h-auto w-full min-h-[500px] mt-4 "
            />
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
              to={`/lawfirm/view_client_playbook_update/${contracts.id}/playbook2`}
            >
              Change
            </Link>
            <embed
              src={contracts.playbook2_url}
              className="h-auto w-full min-h-[500px] mt-4 "
            />
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
              to={`/lawfirm/view_client_playbook_update/${contracts.id}/playbook3`}
            >
              Change
            </Link>
            <embed
              src={contracts.playbook3_url}
              className="h-auto w-full min-h-[500px] mt-4 "
            />
          </div>
        )}
        {contracts && (
          <div className="text-center">
            {contracts.playbook_url === null && (
              <Link
                to={`/lawfirm/view_client_playbook_update/${contracts.id}/playbook`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add Playbook
              </Link>
            )}
            {contracts.playbook_url && contracts.playbook2_url === null && (
              <Link
                to={`/lawfirm/view_client_playbook_update/${contracts.id}/playbook2`}
                className="text-lg bg-[#4a5fe6] py-1 px-4 rounded-sm text-white capitalize"
              >
                Add Playbook
              </Link>
            )}
            {contracts.playbook2_url && contracts.playbook3_url === null && (
              <Link
                to={`/lawfirm/view_client_playbook_update/${contracts.id}/playbook3`}
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

export default LawfirmViewClientPlaybookListPage;
