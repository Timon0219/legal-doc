import React from "react";
import { NavLink } from "react-router-dom";
const DownloadButton = ({ handleClick }) => {
  return (
    <>
      <div className="w-7 h-7 text-center center-svg text-white font-bold flex" style={{cursor: "pointer"}} onClick={handleClick}>
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 485 485" style={{enableBackground:"0 0 485 485"}} xmlSpace="preserve">
<g>
	<polygon points="380.926,115.57 321.93,115.57 321.93,0 163.07,0 163.07,115.57 104.074,115.57 242.5,267.252 	"/>
	<path d="M0,310v175h485V310H0z M330,412.5c-8.284,0-15-6.716-15-15s6.716-15,15-15c8.284,0,15,6.716,15,15S338.284,412.5,330,412.5
		z M400,412.5c-8.284,0-15-6.716-15-15s6.716-15,15-15c8.284,0,15,6.716,15,15S408.284,412.5,400,412.5z"/>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>
      </div>
    </>
  );
};

export default DownloadButton;
