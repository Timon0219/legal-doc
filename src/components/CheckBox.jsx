import React from "react";

const CheckBox = ({ register, errors, item, name, defaultValue }) => {
  return (
    <div className="mr-5 flex items-center">
      <input
        id={item.id + name}
        type="radio"
        {...register(name, { required: true })}
        className={`focus:outline-none focus:shadow-outline  h-5 w-5 ${
          errors[name]?.message ? "border-red-500" : ""
        }`}
        value={item.id}
        defaultChecked={defaultValue && item.id === defaultValue}
        d
      />
      <label
        className="block text-sm font-bold ml-2 text-[#353535] "
        htmlFor={item.id + name}
      >
        {item.name}
      </label>
    </div>
  );
};

export default CheckBox;
