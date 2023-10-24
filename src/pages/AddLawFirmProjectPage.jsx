import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";
import { shorten } from "../utils/utils";
import moment from "moment/moment";
let sdk = new MkdSDK();

const AddLawFirmProjectPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState();
  const [documentUrl, setDocumentUrl] = useState("");
  const [nda, setNda] = useState([]);
  const [playbook, setPlaybook] = useState([]);
  const user_id = JSON.parse(localStorage.getItem("user"));
  const schema = yup
    .object({
      name: yup.string().required(),
      launch_date: yup
        .date()
        .required()
        .typeError("Date must be of format: MM/DD/YYYY"),
      no_of_parties_outreach: yup
        .number()
        .required()
        .positive()
        .integer()
        .typeError("Please enter a valid number"),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    if (!client) {
      setLoading(false);
      showToast(globalDispatch, "select a client");
    } else if (playbook.length === 0) {
      setLoading(false);
      showToast(globalDispatch, "Upload a playbook");
    } else {
      try {
        const formData = new FormData();
        nda.forEach((val) => formData.append("files", val));
        const formData2 = new FormData();
        playbook.forEach((val) => formData2.append("files", val));
        const ndaRes = await sdk.uploads(formData, "Post");
        const playbookRes = await sdk.uploads(formData2, "Post");

        if ((ndaRes.attachments, playbookRes.attachments)) {
          sdk.setTable("project");
          const newRow = {
            name: data.name,
            client_id: client.value,
            launch_date: moment(data.launch_date).format("yyyy-MM-DD"),
            no_of_parties_outreach: data.no_of_parties_outreach,
            nda: ndaRes.attachments[0]?.id,
            nda2: ndaRes.attachments[1]?.id,
            nda3: ndaRes.attachments[2]?.id,
            playbook: playbookRes.attachments[0]?.id,
            playbook2: playbookRes.attachments[1]?.id,
            playbook3: playbookRes.attachments[3]?.id,
            law_firm_id: user_id,
          };
          const result = await sdk.callRestAPI(newRow, "POST");
          if (!result.error) {
            showToast(globalDispatch, "Added");
            setLoading(false);
            navigate("/lawfirm/projects");
          } else {
            setLoading(false);
            if (result.validation) {
              const keys = Object.keys(result.validation);
              for (let i = 0; i < keys.length; i++) {
                const field = keys[i];
                setError(field, {
                  type: "manual",
                  message: result.validation[field],
                });
              }
            }
          }
        }
      } catch (error) {
        setLoading(false);
        console.log("Error", error);
        setError("name", {
          type: "manual",
          message: error.message,
        });
        tokenExpireError(dispatch, error.message);
      }
    }
  };
  const getData = async (data) => {
    try {
      const result = await sdk.callRestAPI(
        {
          where: [
            data
              ? ` ${
                  data.user_id
                    ? `forkfirm_law_firm_client.law_firm_id=${user_id}`
                    : "1"
                } `
              : "1",
          ],
          page: 1,
          limit: 999999,
        },
        "VIEWCLIENTLAWFIRMS"
      );
      const { list: clientList } = result;
      console.log(result);
      let newListOfArray = [];
      clientList.forEach((val) =>
        newListOfArray.push({
          label: `${val.first_name} ${val.last_name ? val.last_name : ""}`,
          value: val.id,
        })
      );
      setClients(newListOfArray);
    } catch (error) {
      console.log("Error", error);
      tokenExpireError(dispatch, error.message);
    }
  };
  React.useEffect(() => {
    if (user_id) {
      getData({ user_id });
    }
  }, [user_id]);
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "project",
      },
    });
  }, []);
  const previewGenerate = (val) => {
    const newUrl = URL.createObjectURL(val);
    setDocumentUrl(newUrl);
  };
  const ndaHandle = (e) => {
    console.log(e.target.files[0]);
    e.target.files[0] && setNda([...nda, e.target.files[0]]);
  };
  const playbookHandle = (e) => {
    console.log(e.target.files[0]);
    e.target.files[0] && setPlaybook([...playbook, e.target.files[0]]);
  };

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Project</h4>
      <div className=" md:grid grid-cols-[45%_50%] gap-[5%]">
        <form className=" w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              placeholder="name"
              {...register("name")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.name?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.name?.message}
            </p>
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="client_id"
            >
              Client
            </label>
            <Select
              options={clients}
              onChange={(e) => setClient(e)}
              // ref={clientRef}
            />
            {/* <input
            placeholder="Client"
            {...register("client_id")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.client_id?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.client_id?.message}
          </p> */}
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="launch_date"
            >
              Launch Date
            </label>
            <input
              type="date"
              placeholder="launch_date"
              {...register("launch_date")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.launch_date?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.launch_date?.message}
            </p>
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="no_of_parties_outreach"
            >
              # Of Parties Outreach
            </label>
            <input
              placeholder="# Of Parties OutReach"
              {...register("no_of_parties_outreach")}
              className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.no_of_parties_outreach?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-red-500 text-xs italic">
              {errors.no_of_parties_outreach?.message}
            </p>
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="no_of_parties_outreach"
            >
              Upload NDA
            </label>
            <div className=" relative border  border-solid border-[#111] min-h-[300px] h-auto py-8 pt-[6rem] w-full cursor-pointer  ">
              <input
                type="file"
                multiple
                id="client-contracts"
                onChange={ndaHandle}
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
                {nda.length > 0 &&
                  nda.map((item, i) => (
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

                {nda.length > 0 ? (
                  <>
                    <br />
                    <label
                      htmlFor="client-contracts"
                      className=" underline text-[#324bda] "
                    >
                      Click here to upload another NDA
                    </label>
                  </>
                ) : (
                  <label htmlFor="client-contracts">
                    <span className=" underline text-[#324bda] ">Upload</span>{" "}
                    Or Drag and Drop a NDA into this container
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 ">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="no_of_parties_outreach"
            >
              Upload Playbook
            </label>
            <div className=" relative border  border-solid border-[#111] min-h-[300px] h-auto py-8 pt-[6rem] w-full cursor-pointer  ">
              <input
                type="file"
                multiple
                id="client-contracts"
                onChange={playbookHandle}
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
                {playbook.length > 0 &&
                  playbook.map((item, i) => (
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

                {playbook.length > 0 ? (
                  <>
                    <br />
                    <label
                      htmlFor="client-contracts"
                      className=" underline text-[#324bda] "
                    >
                      Click here to upload another Playbook
                    </label>
                  </>
                ) : (
                  <label htmlFor="client-contracts">
                    <span className=" underline text-[#324bda] ">Upload</span>{" "}
                    Or Drag and Drop a Playbook into this container
                  </label>
                )}
              </div>
            </div>
          </div>

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
        </form>
        <div className=" ">
          {documentUrl && (
            <embed
              src={documentUrl}
              className="h-auto w-full min-h-[500px] mt-4 sticky top-[10%] left-0 "
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLawFirmProjectPage;
