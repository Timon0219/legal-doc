import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ViewAdminUserPage() {
  const [data, setData] = React.useState({});
  const location = useLocation();
  useEffect(() => {
    const { first_name, last_name, email, role, status } = location.state;
    setData({ first_name, last_name, email, role, status });
  }, [location]);
  return (
    <>
      <h4 className="text-2xl font-medium">View User</h4>
      <article className="p-5 bg-white shadow rounded mb-10 flex-col">
        <table class="table-auto w-full">
          <thead class="text-xs font-semibold uppercase text-gray-400">
            <tr>
              <th class="p-2">
                <div class="font-semibold text-left"></div>
              </th>
              <th class="p-2">
                <div class="font-semibold text-left"></div>
              </th>
            </tr>
          </thead>

          <tbody class="text-sm divide-y divide-gray-100">
            <tr>
              <td class="p-2">
                <div class="text-left">First Name</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["first_name"]}
                </div>
              </td>
            </tr>

            <tr>
              <td class="p-2">
                <div class="text-left">Last Name</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["last_name"]}
                </div>
              </td>
            </tr>

            <tr>
              <td class="p-2">
                <div class="text-left">Email</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["email"]}
                </div>
              </td>
            </tr>
            <tr>
              <td class="p-2">
                <div class="text-left">Role</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["role"]}
                </div>
              </td>
            </tr>
            <tr>
              <td class="p-2">
                <div class="text-left">Status</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["status"] ? "Active" : "Inactive"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </>
  );
}
