import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";
import { shorten } from "../utils/utils";
let sdk = new MkdSDK();
const LawfirmClientUpdatePlaybookListPage = () => {
  const [loading, setLoading] = useState(false);
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [document, setDocument] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  async function getClient(pageNum, limitNum, data) {
    try {
      sdk.setTable("attorney/client");
      const result = await sdk.callRestAPI(
        {
          where: {
            "client.name": null,
            "client.first_name": null,
            "client.last_name": null,
            "client.email": null,
            "attorney.id": null,
            "client.id": data.user_id ? data.user_id : null,
          },
          page: pageNum,
          limit: limitNum,
        },
        "PAGINATE"
      );

      const { list, total, limit, num_pages, page } = result;
      console.log(list[0].playbook);
      setDocumentUrl(list[0].playbook);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (document) {
      console.log(document);
      try {
        const formdata = new FormData();
        document.forEach((val) => formdata.append("files", val));
        const fileResult = await sdk.uploads(formdata, "Post");
        console.log(fileResult);
        console.log(fileResult.attachments[0]);
        if (fileResult.success) {
          sdk.setTable("profile");
          const result = await sdk.callRestAPI(
            {
              set: {
                playbook: fileResult.attachments[0]
                  ? fileResult.attachments[0].id
                  : null,
              },
              where: {
                user_id: JSON.parse(id),
              },
            },

            "PUTWHERE"
          );
          console.log(result);
          if (!result.error) {
            setLoading(false);
            showToast(globalDispatch, "Playbook updated");
            navigate(-1);
          }
        }
      } catch (error) {
        setLoading(false);
        console.log("ERROR", error);
        // tokenExpireError(dispatch, error.message);
      }
    } else {
      setLoading(false);
      showToast(globalDispatch, "Select A Document");
    }
  };
  const documentHandle = (e) => {
    console.log(e.target.files[0]);
    let files = Array.from(e.target.files);
    e.target.files[0] && setDocument([e.target.files[0]]);
  };
  const previewGenaret = (val) => {
    const newUrl = URL.createObjectURL(val);
    setDocumentUrl(newUrl);
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "project",
      },
    });
  }, []);
  React.useEffect(() => {
    getClient(1, 10, { user_id: JSON.parse(id) });
  }, []);

  return (
    <form className="p-5 bg-white shadow rounded mb-10" onSubmit={handleSubmit}>
      <h4 className="text-2xl font-medium">Update Playbook</h4>
      <div className="filter-form-holder mt-10">
        <div className="w-full grid grid-cols-[45%_50%] gap-[5%] ">
          <div className="">
            <div className=" relative border  border-solid border-[#111] min-h-[300px] h-auto py-8 pt-[6rem] w-full cursor-pointer  ">
              <input
                type="file"
                multiple
                id="client-contracts"
                onChange={documentHandle}
                className=" absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-[9] "
                // {...register("docoment", { required: true })}
                accept="application/pdf"
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
                      <button
                        onClick={() => previewGenaret(item)}
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
                    <label
                      htmlFor="client-contracts"
                      className=" underline text-[#324bda] "
                    >
                      Click here to upload another document
                    </label>
                  </>
                ) : (
                  <label htmlFor="client-contracts">
                    <span className=" underline text-[#324bda] ">
                      Update a Playbook
                    </span>{" "}
                    Or Drag and Drop a document into this container
                  </label>
                )}
              </div>
            </div>
            {/* <p className="text-red-500 text-xs italic">
          {errors.docoment?.message}
        </p> */}

            <div className="mt-10">
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
          </div>
          <div className="">
            {documentUrl && (
              <a
                href={documentUrl}
                className="text-lg text-[#4a5fe6] underline capitalize "
                target="blank"
              >
                Download playbook
              </a>
            )}
            <embed src={documentUrl} className="h-auto w-full min-h-[500px] " />
          </div>
        </div>
      </div>
    </form>
  );
};

export default LawfirmClientUpdatePlaybookListPage;
