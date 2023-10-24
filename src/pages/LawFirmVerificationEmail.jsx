import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../authContext";
import MkdSDK from "../utils/MkdSDK";
let sdk = new MkdSDK();
const LawFirmVerificationEmail = () => {
  const { dispatch } = React.useContext(AuthContext);
//   const location = useLocation();
  const navigate = useNavigate();
//   const token = location.search.split("=")[1];
  localStorage.removeItem("message");
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const emailVerified = async () => {
    try {
      const result = await sdk.emailVerify(token);

      if (!result.error) {
        navigate(`/lawfirm/login`, { replace: true });
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    emailVerified();
  }, [token]);

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 "></div>
    </div>
  );
};

export default LawFirmVerificationEmail;
