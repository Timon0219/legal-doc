import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";

const sdk = new MkdSDK();

const AddAdminLawFirmPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup.object({}).required();

  const { dispatch } = React.useContext(GlobalContext);

  const navigate = useNavigate();
  const lawFirmRef = React.useRef(null);
  const [law_firms, setLawFirms] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);

  const params = useParams();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function getData(pageNum, limitNum, data) {
    try {
      sdk.setTable("user");
      const clientResult = await sdk.callRestAPI(
        { id: Number(params?.id) },
        "GET"
      );
      setValue("client", clientResult.model.email);
      sdk.setTable("lawfirm");
      const result = await sdk.callRestAPI(
        {
          payload: { ...data },

          page: 1,
          limit: 1000000,
        },
        "PAGINATE"
      );
      if (!result.error) {
        let dataArr = [];
        result.list.forEach((lawFirm) => {
          dataArr.push({
            value: lawFirm.id,
            label: (lawFirm.first_name ?? "") + " " + (lawFirm.last_name ?? ""),
          });
        });
        setLawFirms(dataArr);
      }
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = async () => {
    let lawFirms;
    if (lawFirmRef.current.getValue().length) {
      lawFirms = lawFirmRef.current.getValue();
    }

    let result;
    console.log(lawFirms);
    sdk.setTable("law_firm_client");
    for (let i of lawFirms) {
      try {
        result = await sdk.callRestAPI(
          {
            client_id: params.id,
            law_firm_id: i.value,
          },
          "POST"
        );

        console.log(result);
      } catch (error) {
        console.log("Error", error);
        setError("law_firm_id", {
          type: "manual",
          message: error.message,
        });
        tokenExpireError(dispatch, error.message);
        break;
      }
    }

    if (!result.error) {
      showToast(globalDispatch, "Added");
      navigate("/admin/client");
    } else {
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
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Assign Law Firm</h4>
      <form className="mt-4 w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="office"
          >
            Law Firm
          </label>
          <Select options={law_firms} ref={lawFirmRef} isMulti />

          <p className="text-red-500 text-xs italic">
            {errors.law_firm?.message}
          </p>
        </div>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Client
          </label>
          <input
            placeholder=""
            readOnly
            {...register("client")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.client?.message ? "border-red-500" : ""
            }`}
          />

          <p className="text-red-500 text-xs italic">
            {errors.client?.message}
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddAdminLawFirmPage;
