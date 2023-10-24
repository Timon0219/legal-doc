import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "../globalContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../authContext";
import PaginationBar from "../components/PaginationBar";

let sdk = new MkdSDK();

const EditAdminClientRatePage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [docTypeIds, setDocTypeIds] = React.useState([]);
  const [customDocType, setCustomDocType] = React.useState([]);
  const [customDocTypeRate, setCustomDocTypeRate] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const schema = yup.object({
    law_firm_id: yup.number().positive().integer(),
    attorney_id: yup.number().positive().integer(),
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const params = useParams();

  async function getData(pageNum, limitNum, data) {
    try {
      sdk.setTable("client_rate");
      const result = await sdk.getClientRates({
        where: [params.id ? `${`forkfirm_user.id = ${params.id}`}` : 1],
        page: pageNum,
        limit: limitNum,
      });

      const { list, total, limit, num_pages, page } = result;

      console.log(list);

      sdk.setTable("doc_type");
      const result2 = await sdk.callRestAPI(
        {
          payload: { ...data },
          page: pageNum,
          limit: limitNum,
        },
        "PAGINATE"
      );

      const { list: list2 } = result2;
      console.log(list2);
      setDocTypeIds(list2);
      sdk.setTable("client_rate");

      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(0, limit);
    })();
  }

  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize);
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize
      );
    })();
  }

  useEffect(function () {
    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  const onSubmit = async () => {
    try {
      data.forEach(async (docType) => {
        if (docType.rate !== null) {
          if (docType.client_rate_id == null) {
            sdk.setTable("client_rate");
            let doc_type_id;
            docTypeIds.forEach((val) => {
              if (val.name === docType.doc_name) {
                doc_type_id = val.id;
              }
            });
            const postResult = await sdk.callRestAPI(
              {
                client_id: parseInt(params.id),
                doc_type_id,
                rate: 0,
              },
              "POST"
            );

            console.log(postResult);
            sdk.setTable("client_rate");
            const result = await sdk.callRestAPI(
              {
                id: postResult.message,
                rate: docType.rate,
              },
              "CLIENTRATEPUT"
            );
            if (!result.error) {
              showToast(globalDispatch, "Updated");

              // navigate(-1);
              // navigate("/admin/client");
            } else {
              if (result.validation) {
                const keys = Object.keys(result.validation);
                for (let i = 0; i < keys.length; i++) {
                  const field = keys[i];
                }
              }
            }
            return;
          }

          sdk.setTable("client_rate");
          const result = await sdk.callRestAPI(
            {
              id: docType.client_rate_id,
              rate: docType.rate,
            },
            "CLIENTRATEPUT"
          );
          if (!result.error) {
            showToast(globalDispatch, "Client rate edited successfully");
            // navigate(-1);
            navigate(`/admin/view-client_rate/${params.id}`, {
              state: location.state,
            });
          } else {
            if (result.validation) {
              const keys = Object.keys(result.validation);
              for (let i = 0; i < keys.length; i++) {
                const field = keys[i];
              }
            }
          }
        }
      });
    } catch (error) {
      console.log("Error", error);
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "client",
      },
    });
  }, []);

  const addDocType = async () => {
    try {
      sdk.setTable("doc_type");
      const result = await sdk.callRestAPI(
        {
          name: customDocType,
          client_id: parseInt(params.id),
        },
        "POST"
      );

      if (!result.error) {
        setShowModal(false);
        getData(1, pageSize);
        showToast(globalDispatch, "Doc Type Added Successfully!");
        // TODO: remove every use of location.state in this component
        navigate(`/admin/view-client_rate/${params.id}`, {
          state: location.state,
        });
      }
    } catch (err) {
      tokenExpireError(dispatch, err.message);
      showToast(globalDispatch, err.message);
    }
  };

  return (
    <>
      <section className="flex justify-between">
        <h4 className="text-2xl font-medium">Edit Client's Rates</h4>
      </section>

      <section
        className="p-5 bg-white shadow rounded mb-10 mt-4"
        style={{ width: "50%" }}
      >
        <div className="flex font-bold justify-between mb-10">
          <h2>Client: </h2>
          <span>
            {location.state.first_name + " " + location.state.last_name}
          </span>
        </div>
        <section className="flex-col font-bold mt-4">
          <div className="flex justify-between">
            <span>Doc Types</span>
            <span>Price</span>
          </div>

          {data
            ? data.map((docType, index) => {
                if (docType.doc_name) {
                  return (
                    <div
                      className="flex justify-between mt-4 font-medium"
                      key={index}
                    >
                      <label htmlFor="">{docType.doc_name}</label>

                      <input
                        type="number"
                        value={docType.rate}
                        onChange={(e) => {
                          let cloneData = data;
                          cloneData[index].rate = parseInt(e.target.value);
                          setCurrentTableData([...cloneData]);
                        }}
                        className={`"shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
              }`}
                      />
                    </div>
                  );
                }
              })
            : ""}
        </section>
        <button
          type="button"
          onClick={onSubmit}
          className="mr-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Custom Doctype
        </button>
        {showModal ? (
          <>
            <div
              style={{ zIndex: "3" }}
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            >
              <div
                style={{ width: "50%" }}
                className="relative w-auto my-6 mx-auto max-w-3xl"
              >
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                    <h3 className="text-3xl font-semibold">
                      Add Custom Doctype
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      <span className="bg-transparent text-black opacity-100 h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>

                  {/*body*/}
                  <div className="relative p-6 flex-auto">
                    <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Doc Type
                      </label>
                      <input
                        placeholder=""
                        type="text"
                        name="doctype"
                        value={customDocType}
                        onChange={(e) => setCustomDocType(e.target.value)}
                        className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                          errors.id?.message ? "border-red-500" : ""
                        }`}
                      />
                      <p className="text-red-500 text-xs italic"></p>
                    </div>
                  </div>

                  <div className="flex items-center p-6 border-t border-solid border-slate-200 rounded-b">
                    <button
                      className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={addDocType}
                    >
                      Add
                    </button>
                    <button
                      className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mb-1 ease-linear transition-all duration-150 mr-4"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="opacity-25 fixed inset-0 z-2 bg-black"
              style={{ zIndex: "1" }}
            ></div>
          </>
        ) : null}
        <hr className="mt-4" />
        <PaginationBar
          currentPage={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          updatePageSize={updatePageSize}
          previousPage={previousPage}
          nextPage={nextPage}
        />
      </section>
    </>
  );
};

export default EditAdminClientRatePage;
