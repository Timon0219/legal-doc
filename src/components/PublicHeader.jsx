import React, { useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../authContext";

export const PublicHeader = () => {
  const { state, dispatch } = React.useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return <div>
    
  </div>;
};

export default PublicHeader;
