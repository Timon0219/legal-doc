import React from "react";
import { useController } from "react-hook-form";

export default function CheckBoxControlled({ control, item, name }) {
  const {
    field,
    fieldState: { error },
    formState,
  } = useController({ control, name });

  return (
    <div className="mr-5 flex items-center">
      <input
        id={item.id + name}
        type="radio"
        className={`focus:outline-none focus:shadow-outline  h-5 w-5 ${
          error?.message ? "border-red-500" : ""
        }`}
        value={item.id}
        checked={item.id == field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
      <label
        className="block text-sm font-bold ml-2 text-[#353535] "
        htmlFor={item.id + name}
      >
        {item.name}
      </label>
    </div>
  );
}
