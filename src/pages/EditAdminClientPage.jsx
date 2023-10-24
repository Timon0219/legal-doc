import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import Select from "react-select";

let sdk = new MkdSDK();

const EditAdminLawFirmClientPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({
      name: yup.string().required(),
      email: yup.string().required(),
      invited_by: yup.string().required(),
      status: yup.object().optional(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const statusRef = React.useRef(null);
  const selectStatus = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];
  const [tags, setTags] = React.useState([]);
  const tagRef = React.useRef(null);

  const [id, setId] = useState(0);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [initialClientTags, setInitialClientTags] = useState([]);

  const params = useParams();
  const location = useLocation();

  useEffect(function () {
    (async function () {
      try {
        sdk.setTable("user");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {
          setValue(
            "name",
            (result.model.first_name ? result.model.first_name : "") +
              " " +
              (result.model.last_name ? result.model.last_name : "")
          );
          setValue("email", result.model.email ? result.model.email : "N/A");
          setValue(
            "invited_by",
            location.state.invited_by ? location.state.invited_by : "N/A"
          );
          statusRef.current.setValue(selectStatus[result.model.status]);
          setId(result.model.id);
          (async (pageNum, limitNum) => {
            sdk.setTable("tag");

            const tagResult = await sdk.callRestAPI(
              {
                page: pageNum,
                limit: limitNum,
              },
              "PAGINATE"
            );

            const { list } = tagResult;

            let arr = [];
            list.forEach((val) => {
              arr.push({ label: val.name, value: val.id });
            });

            if (!arr[0].project_id) {
              setTags(arr);
            }

            sdk.setTable("client_tag");
            const clientTagResult = await sdk.callRestAPI(
              {
                customWhere: params
                  ? `
                          ${
                            params.id
                              ? `forkfirm_client_tag.client_id = ${params.id}`
                              : "1"
                          } 
                        `
                  : 1,
              },
              "GETALL"
            );
            let tagIDArr = clientTagResult.list.map((val) => val.tag_id);

            setInitialClientTags(clientTagResult.list);

            let itemsArr = [];
            tagIDArr.forEach((val2) => {
              let ind = arr.find((val) => val.value === val2);
              let item = arr[arr.indexOf(ind)];
              itemsArr.push(item);
            });

            tagRef.current.setValue(itemsArr);
          })(1, 10);
        }
      } catch (error) {
        console.log("error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    const currentTags = tagRef.current.getValue();
    let durationTag = currentTags.find((tag) => tag.value === 27);
    if (!durationTag) {
      showToast(globalDispatch, "Please add the Duration tag");
      return;
    }
    const tagsToDelete = initialClientTags
      .filter((tag) => !currentTags.some((t) => tag.tag_id == t.value))
      .map((v) => v.id);

    const tagsToCreate = currentTags.filter(
      (t) => !initialClientTags.some((tag) => tag.tag_id == t.value)
    );

    console.log("log", tagsToCreate, tagsToDelete);

    try {
      let status, client_name;
      if (statusRef.current.getValue().length) {
        status = parseInt(statusRef.current.getValue()[0].value);
      }

      if (data.name) {
        client_name = data.name.split(" ");
      }
      sdk.setTable("user");
      const result = await sdk.callRestAPI(
        {
          id,
          first_name: client_name[0],
          last_name: client_name[1],
          email: data.email,
          status,
          verify: 1,
        },
        "PUT"
      );

      if (!result.error) {
        console.log(result);
        sdk.setTable("profile");
        const result2 = await sdk.callRestAPI(
          {
            set: {
              invited_by: data.invited_by,
            },
            where: {
              user_id: result.message,
            },
          },
          "PUTWHERE"
        );

        console.log(result2);

        sdk.setTable("client_tag");
        await Promise.all(
          tagsToDelete.map((id) => sdk.callRestAPI({ id }, "DELETE"))
        );

        await Promise.all(
          tagsToCreate.map((tag) =>
            sdk.callRestAPI({ tag_id: tag.value, client_id: id }, "POST")
          )
        );

        showToast(globalDispatch, "Updated");
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
    } catch (error) {
      setError("law_firm_id", {
        type: "manual",
        message: error.message,
      });
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client",
      },
    });
  }, []);

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <div className="flex justify-between">
        <h4 className="text-2xl font-medium">Edit Client</h4>
      </div>

      <form className="mt-4 w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            placeholder=""
            {...register("name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.name?.message}</p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            placeholder=""
            type="email"
            {...register("email")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.email?.message}</p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="invited_by"
          >
            Invited By
          </label>
          <input
            placeholder=""
            type="email"
            {...register("invited_by")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.invited_by?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">
            {errors.invited_by?.message}
          </p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="office"
          >
            Tags
          </label>
          <Select options={tags} ref={tagRef} isMulti />

          <p className="text-red-500 text-xs italic">
            {errors.law_firm?.message}
          </p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <Select options={selectStatus} ref={statusRef} />

          <p className="text-red-500 text-xs italic">
            {errors.status?.message}
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

export default EditAdminLawFirmClientPage;
