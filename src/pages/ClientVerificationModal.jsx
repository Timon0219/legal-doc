import React, { useState } from "react";
import { useLocation } from "react-router";

const ClientVerificationModal = () => {
  //  


  localStorage.removeItem("token");
  const message = JSON.parse(localStorage.getItem("message"));
  return (
    <div className="w-full">
      <div className=" shadow-md rounded px-8 pt-6 bg-white pb-8 mb-4 mt-8 w-1/2 mx-auto  ">
        <h3 className="text-2xl capitalize leading-[150%] ">
          {message && message}
        </h3>
      </div>
    </div>
  );
};

export default ClientVerificationModal;
