import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DocIcon from "../components/svcIcon/DocIcon";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";
import { Navigate, useLocation, useNavigate } from "react-router";
import { dateHandle } from "../utils/utils";
import moment from "moment/moment";
let sdk = new MkdSDK();

const AttorneyLicenseListPage = () => {
  const schema = yup
    .object({
      expiry_date: yup.date(),
    })
    .required();

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch, state } = React.useContext(AuthContext);
  const [loading, setLoading] = React.useState(false);
  const [document, setDocument] = useState("");
  const [documentReq, setDocumentReq] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    if (!document) {
      setLoading(false);
      setDocumentReq(true);
      return;
    }
    let formData = new FormData();
    formData.append("file", document);

    const fileUpload = await sdk.upload(formData, "POST");
    if (fileUpload.id && data.expiry_date) {
      sdk.setTable("profile");
      try {
        const result = await sdk.callRestAPI(
          {
            set: {
              attorney_expiry_date: moment(data.expiry_date).format(
                "yyyy-MM-DD"
              ),
              attorney_license: fileUpload.id,
            },
            where: {
              user_id: state.user,
            },
          },
          "PUTWHERE"
        );
        if (result.error) throw new Error(result.message);

        showToast(globalDispatch, "Details Updated", 2000);
        navigate("/attorney/profile");
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("Error", error);
        tokenExpireError(dispatch, error.message);
      }
    }
  };

  const documentHandle = (e) => {
    setDocument(e.target.files[0]);
  };

  return (
    <div className=" fixed top-0 left-0 z-[999] bg-white w-full h-full p-14 ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 w-1/2 mx-auto "
      >
        <div className="mb-6">
          <label
            htmlFor="Update_License"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            License
          </label>

          <div
            className={
              "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline relative h-[150px] cursor-pointer  "
            }
          >
            <input
              onChange={documentHandle}
              className="absolute top-0 left-0 w-full h-full opacity-0  cursor-pointer "
              id="Update_License"
              type="file"
            />
            <DocIcon />
            <label
              htmlFor="Update_License"
              className=" absolute top-3/4 left-10 text-[#294ef3] underline "
            >
              {document ? document.name : <>Add License</>}
            </label>
          </div>

          <p className="text-red-500 text-xs italic">
            {documentReq ? "Document Required" : ""}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Expiry Date
          </label>
          <input
            {...register("expiry_date")}
            className={
              "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            }
            id="expiry_date"
            type="date"
          />
          <p className="text-red-500 text-xs italic">
            {errors.expiry_date?.message}
          </p>
        </div>
        <div className="flex items-center justify-between">
          {loading ? (
            <p className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline opacity-60 ">
              Loading...
            </p>
          ) : (
            <>
              <input
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                value="Submit"
              />
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AttorneyLicenseListPage;
