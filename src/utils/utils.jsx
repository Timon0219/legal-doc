import MkdSDK from "./MkdSDK";
import { saveAs } from "file-saver";
import Payment from "payment";

let sdk = new MkdSDK();

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const getNonNullValue = (value) => {
  if (value != "") {
    return value;
  } else {
    return undefined;
  }
};

export function filterEmptyFields(object) {
  Object.keys(object).forEach((key) => {
    if (empty(object[key])) {
      delete object[key];
    }
  });
  return object;
}

export function empty(value) {
  return (
    value === "" ||
    value === null ||
    value === undefined ||
    value === "undefined"
  );
}

export const dateHandle = (date) => {
  const newDate = date
    ? new Date(date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  return newDate;
};

export const dateHandle2 = (date) => {
  const newDate = new Date(date);
  let year = newDate.getFullYear();
  let month = (1 + newDate.getMonth()).toString().padStart(2, "0");
  let day = newDate.getDate().toString().padStart(2, "0");

  return month + "/" + day + "/" + year;
};

export const shorten = (str, n) => {
  let strSplit = str.split("");

  if (strSplit.length > n) {
    return strSplit.slice(0, n).join("") + "....";
  } else {
    return str;
  }
};

export const checkingDate = (date) => {
  let today = new Date();
  const newDate = new Date(date);
  const oneMonth = new Date().setDate(today.getDate() + 30);
  const twoMonth = new Date().setDate(today.getDate() + 60);
  // console.log(newDate, oneMonth, twoMonth);
  if (today <= newDate) {
    if (oneMonth >= newDate) {
      // console.log("day30");
      return "bg-red-500 text-white";
    } else if (twoMonth >= newDate && oneMonth < newDate) {
      // console.log("day60");
      return "bg-[#d5ce00] text-white";
    } else {
      return "okay";
    }
  } else {
    return "bg-red-500 text-white";
  }
};

export const handleGetUserRole = (email) => {
  let role;
  sdk.handleGetUserRole(email);
  return role;
};

export const csvFileMake = (data) => {
  const filename = "export.csv";
  let csvContent = "";
  for (let row = 0; row < data.length; row++) {
    let keysAmount = Object.keys(data[row]).length;
    let keysCounter = 0;

    // If this is the first row, generate the headings
    if (row === 0) {
      // Loop each property of the object
      let newKeyLiene = "";
      let newValueLne = "";
      for (let key in data[row]) {
        // This is to not add a comma at the last cell
        // The '\n' adds a new line
        newKeyLiene += key + (keysCounter + 1 < keysAmount ? "," : "\r\n");
        newValueLne +=
          data[row][key] + (keysCounter + 1 < keysAmount ? "," : "\r\n");
        keysCounter++;
      }
      csvContent += newKeyLiene;
      csvContent += newValueLne;
    } else {
      for (let key in data[row]) {
        csvContent +=
          data[row][key] + (keysCounter + 1 < keysAmount ? "," : "\r\n");
        keysCounter++;
      }
    }

    keysCounter = 0;
  }
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Download the file
  saveAs(blob, filename);
};

function clearNumber(value = "") {
  return value.replace(/\D+/g, "");
}

export function formatCreditCardNumber(value) {
  if (!value) {
    return value;
  }

  const issuer = Payment.fns.cardType(value);
  const clearValue = clearNumber(value);
  let nextValue;

  switch (issuer) {
    case "amex":
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10
      )} ${clearValue.slice(10, 15)}`;
      break;
    case "dinersclub":
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        10
      )} ${clearValue.slice(10, 14)}`;
      break;
    default:
      nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
        4,
        8
      )} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 19)}`;
      break;
  }

  return nextValue.trim();
}

export function formatCVC(value, prevValue, allValues = {}) {
  const clearValue = clearNumber(value);
  let maxLength = 4;

  if (allValues.number) {
    const issuer = Payment.fns.cardType(allValues.number);
    maxLength = issuer === "amex" ? 4 : 3;
  }

  return clearValue.slice(0, maxLength);
}

export function formatExpirationDate(value) {
  const clearValue = clearNumber(value);

  if (clearValue.length >= 3) {
    return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
  }

  return clearValue;
}

export function formatFormData(data) {
  return Object.keys(data).map((d) => `${d}: ${data[d]}`);
}

export function numberLimited(value, prevValue, allValues = {}) {
  const clearValue = clearNumber(value);
  let maxLength = 6;
  return clearValue.slice(0, maxLength);
}

export function parseJsonSafely(json, failReturn) {
  if (typeof json === "object" || Array.isArray(json)) return json;
  if (typeof json !== "string") return failReturn;
  try {
    const res = JSON.parse(json);
    return res;
  } catch (err) {
    return failReturn;
  }
}
