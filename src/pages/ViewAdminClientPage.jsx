import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ViewAdminUserPage() {
  const [data, setData] = React.useState({});
  const location = useLocation();
  useEffect(() => {
    console.log(location);
    const { id, first_name, last_name, email, status, invited_by } =
      location.state;
    setData({
      id,
      name: first_name + " " + last_name,
      email,
      status,
      invited_by,
    });
  }, [location]);
  const navigate = useNavigate();
  return (
    <>
      <h4 className="text-2xl font-medium">View Clients</h4>
      <article className="p-5 bg-white shadow rounded mb-10 flex-col">
        <button
          onClick={() => navigate(-1)}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Back
        </button>
        <table className="table-auto w-full">
          <thead className="text-xs font-semibold uppercase text-gray-400">
            <tr>
              <th className="p-2">
                <div className="font-semibold text-left"></div>
              </th>
              <th className="p-2">
                <div className="font-semibold text-left"></div>
              </th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-gray-100">
            <tr>
              <td className="p-2">
                <div className="text-left">ID</div>
              </td>
              <td className="p-2">
                <div className="text-left font-medium text-green-500">
                  {data["id"]}
                </div>
              </td>
            </tr>

            <tr>
              <td className="p-2">
                <div className="text-left">Name</div>
              </td>
              <td className="p-2">
                <div className="text-left font-medium text-green-500">
                  {data["name"]}
                </div>
              </td>
            </tr>

            <tr>
              <td className="p-2">
                <div className="text-left">Email</div>
              </td>
              <td className="p-2">
                <div className="text-left font-medium text-green-500">
                  {data["email"]}
                </div>
              </td>
            </tr>

            <tr>
              <td className="p-2">
                <div className="text-left">Status</div>
              </td>
              <td className="p-2">
                <div className="text-left font-medium text-green-500">
                  {data["status"] ? "Active" : "Inactive"}
                </div>
              </td>
            </tr>
            <tr>
              <td className="p-2">
                <div className="text-left">Invited By</div>
              </td>
              <td className="p-2">
                <div className="text-left font-medium text-green-500">
                  {data["invited_by"]}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </>
  );
}
