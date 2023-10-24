import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();
const AdminLoginPage2FAWithToken = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  let role = searchParams.get("role");
  let token = searchParams.get("token");
  //   const location = useLocation();
  //   const token = location.search.split("=")[1];
  localStorage.removeItem("message");

  const emailVerified = async () => {
    try {
      const result = await sdk.loginTwoFa(token, "1234");
      console.log(result);
      if (!result.error) {
        switch (result.role) {
          case "attorney":
            sdk.setTable("attorney");
            const result2 = await sdk.getAllAttorney(
              {
                where: [`forkfirm_user.id=${result.user_id}`],
                page: 1,
                limit: 10,
              },
              result.token
            );

            const { list, total, limit, num_pages, page } = result2;
            console.log(list[0]);
            if (!list[0].attorney_license) {
              navigate("/attorney/license", { state: result });
              localStorage.setItem("token", result.token);
            } else {
              dispatch({
                type: "LOGIN",
                payload: result,
              });
              navigate("/attorney");
            }

            break;
          default:
            dispatch({
              type: "LOGIN",
              payload: result,
            });
            navigate(`/${role}`, { replace: true });
            break;
        }
      }
      if (result.error) {
        showToast(globalDispatch, result.message);
        navigate(`/${role}/login`, { replace: true });
      }
    } catch (error) {
      console.log("Error", error);
      showToast(globalDispatch, error.message);
      navigate(`/${role}/login`, { replace: true });
    }
  };

  useEffect(() => {
    emailVerified();
  }, [token]);

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 opacity-0 "></div>
    </div>
  );
};

export default AdminLoginPage2FAWithToken;
