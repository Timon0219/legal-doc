import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ViewAdminUserPage() {
  const [data, setData] = React.useState({});
  const location = useLocation();
  useEffect(() => {
    console.log(location);
    const { id, email, generated_at, payout_amount, fork_fee, status } =
      location.state;
    setData({ id, email, generated_at, payout_amount, fork_fee, status });
  }, [location]);
  return (
    <>
      <h4 className="text-2xl font-medium">View Invoice</h4>
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
                <div class="text-left">ID</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["id"]}
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
                <div class="text-left">Generated At</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["generated_at"]}
                </div>
              </td>
            </tr>
            <tr>
              <td class="p-2">
                <div class="text-left">Payout Amount</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["payout_amount"]}
                </div>
              </td>
            </tr>
            <tr>
              <td class="p-2">
                <div class="text-left">Status</div>
              </td>
              <td class="p-2">
                <div class="text-left font-medium text-green-500">
                  {data["status"] ? "Paid" : "Unpaid"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </>
  );
}
