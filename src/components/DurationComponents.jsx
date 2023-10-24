import React, { useState } from "react";

const DurationComponents = ({ item, register, setValue }) => {
  const [isChecked, setIsChecked] = useState(
    item.input_type == 3
      ? !item.input_duration
        ? true
        : false
      : item.input_duration == 0 && item.id !== 27
      ? true
      : false
  );

  return (
    item.name && (
      <div className="pr-2 pl-2 mb-4 ">
        <label
          className="block text-gray-700 text-sm font-bold capitalize"
          htmlFor="add_duration"
        >
          {/* Add Duration for */}
          {item.name}
        </label>
        {item.input_type === 3 && (
          <div className="mb-5 mt-4 ">
            <div className="flex items-center mr-4">
              <input
                type="checkbox"
                value={isChecked}
                checked={isChecked}
                id={`unknown${item.id}`}
                className=""
                onChange={() => {
                  if (!isChecked) {
                    setValue(item.name, null);
                  } else {
                    setValue(item.name, "1");
                  }
                  setIsChecked(!isChecked);
                }}
              />
              <label htmlFor={`unknown${item.id}`} className="m-2">
                N/A
              </label>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <input
                  id="default-radio-1"
                  type="radio"
                  defaultValue={item.input_duration ? item.input_duration : "0"}
                  {...register(item.name)}
                  value="1"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 "
                />
                <label
                  htmlFor="default-radio-1"
                  className="ml-2 text-sm font-medium text-gray-900 uppercase"
                >
                  yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-2"
                  type="radio"
                  defaultValue={item.input_duration ? item.input_duration : "0"}
                  {...register(item.name)}
                  value="0"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 "
                />
                <label
                  htmlFor="default-radio-2"
                  className="ml-2 text-sm font-medium text-gray-900 uppercase"
                >
                  no
                </label>
              </div>
              <input
                type="hidden"
                value={item.input_type}
                {...register(item.name + "_type")}
              />
            </div>
          </div>
        )}

        {item.input_type === 2 && (
          <div className="mb-5 mt-4 ">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <input
                  type="checkbox"
                  value={isChecked}
                  checked={isChecked}
                  id={`unknown${item.id}`}
                  className=""
                  onChange={() => {
                    if (!isChecked) {
                      setValue(item.name, "0");
                    } else {
                      setValue(item.name, "0");
                    }
                    setIsChecked(!isChecked);
                  }}
                />
                <label htmlFor={`unknown${item.id}`} className="m-2">
                  N/A
                </label>
              </div>
              <div className="">
                <div className=" grid grid-cols-[70%_30%] gap-[3%] ">
                  <input
                    defaultValue={
                      item.input_duration ? item.input_duration : "0"
                    }
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                    {...register(item.name)}
                    readOnly={isChecked}
                  />
                </div>
              </div>
              <input
                type="hidden"
                value={item.input_type}
                {...register(item.name + "_type")}
              />
            </div>
          </div>
        )}

        {(item.input_type === 1 || item.input_type === 0) && (
          <>
            <div className=" my-1 ">
              <input
                type="checkbox"
                value={isChecked}
                checked={isChecked}
                id={`unknown${item.id}`}
                className=""
                onChange={() => {
                  if (!isChecked) {
                    setValue(item.name, "0");
                  } else {
                    setValue(item.name, "0");
                  }
                  setIsChecked(!isChecked);
                }}
              />
              <label htmlFor={`unknown${item.id}`} className="m-2">
                N/A
              </label>
            </div>
            <div className="">
              <div className=" grid grid-cols-[70%_30%] gap-[3%] ">
                <input
                  defaultValue={item.input_duration ? item.input_duration : "0"}
                  type="number"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                  {...register(item.name)}
                  readOnly={isChecked}
                />
                <select
                  defaultValue={item.input_type}
                  {...register(item.name + "_type")}
                  className="bg-white cursor-pointer shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pointer-events-none "
                >
                  <option value="0">month</option>
                  <option value="1">year</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    )
  );
};

export default DurationComponents;
