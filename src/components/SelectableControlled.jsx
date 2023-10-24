import React from "react";
import { useController } from "react-hook-form";
import CreatableSelect from "react-select/creatable";

export default function SelectableControlled({ control, name }) {
  const { field, fieldState, formState } = useController({ control, name });
  return (
    <CreatableSelect
      options={field.value}
      value={field.value}
      isMulti
      onChange={field.onChange}
    />
  );
}
