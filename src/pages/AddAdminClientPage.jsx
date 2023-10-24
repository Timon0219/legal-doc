import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import Select from "react-select";

const sdk = new MkdSDK();

const AddAdminLawFirmClientPage = () => {
  const [tags, setTags] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      name: yup.string().required(),
      email: yup.string().required(),
      invited_by: yup.string().required(),
      password: yup.string().required(),
    })
    .required();
  const selectStatus = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
  ];
  const statusRef = React.useRef(null);
  const tagRef = React.useRef(null);

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
    let tags = tagRef.current.getValue();
    let durationTag = tags.find((tag) => tag.value === 27);
    if (!durationTag) {
      showToast(globalDispatch, "Please add the Duration tag");
      return;
    }
    let sdk = new MkdSDK();
    sdk.setTable("client");

    let status, client_name;
    if (statusRef.current.getValue().length) {
      status = parseInt(statusRef.current.getValue()[0].value);
    }

    if (data.name) {
      client_name = data.name.split(" ");
    }

    try {
      const result = await sdk.callRestAPI(
        {
          role: "client",
          first_name: client_name[0],
          last_name: client_name[1],
          email: data.email,
          password: data.password,
          status,
          verify: 1,
        },
        "ADDUSER"
      );
      console.log("CLIENT ADDED!!!");
      if (!result.error) {
        sdk.setTable("profile");
        let result2;
        if (data.invited_by) {
          result2 = await sdk.callRestAPI(
            {
              invited_by: data.invited_by,
              user_id: result.user_id,
            },
            "CLIENTPOST"
          );
        }

        if (!result2.error) {
          let tags;
          if (tagRef.current.getValue().length) {
            tags = tagRef.current.getValue();
          }
          sdk.setTable("client_tag");
          for (let i of tags) {
            const result3 = await sdk.callRestAPI(
              {
                client_id: result.user_id,
                tag_id: i.value,
              },
              "POST"
            );
            console.log(result3);
          }
          showToast(globalDispatch, "Added");
          navigate("/admin/client");
        }
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
      console.log("Error", error);
      setError("law_firm_id", {
        type: "manual",
        message: error.message,
      });
      tokenExpireError(dispatch, error.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client",
      },
    });

    sdk.setTable("tag");

    (async (pageNum, limitNum) => {
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

      if (!arr[0].configuration) {
        setTags(arr);
      }

      console.log(list);
    })(1, pageSize);

    statusRef.current.setValue(selectStatus[1]);
  }, []);

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Client</h4>
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
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            placeholder=""
            type="password"
            {...register("password")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.password?.message ? "border-red-500" : ""
            }`}
          />

          <p className="text-red-500 text-xs italic">
            {errors.password?.message}
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

export default AddAdminLawFirmClientPage;
