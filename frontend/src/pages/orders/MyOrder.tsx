/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useGetOrdersCurrentUserQuery } from "../../redux/api/orderApiSlice";
import momment from "moment";

export default function MyOrder() {
  const { data: userOrders, isLoading } = useGetOrdersCurrentUserQuery();
  console.log(userOrders);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log(userOrders?.data);
  return (
    <>
      <div className="container ">
        <table className="mx-auto text-sm divide-y-2 divide-gray-200">
          <thead className="">
            <tr>
              <th className="px-0 py-2 font-medium text-gray-50 whitespace-nowrap">
                #
              </th>
              <th className="px-0 py-2 font-medium text-gray-50 whitespace-nowrap">
                ID
              </th>
              <th className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                DATE
              </th>
              <th className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                ITEMS
              </th>
              <th className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                TOTAL
              </th>
              <th className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                PAID
              </th>
              <th className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                DELIVERED
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userOrders?.data?.map((item: any, index: number) => (
              <tr className="text-center" key={index}>
                <td className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                  {item._id}
                </td>
                <td className="px-4 py-2 font-medium text-gray-50 whitespace-nowrap">
                  {momment(item.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                </td>
                <td className="px-4 py-2 text-gray-50 whitespace-nowrap">
                  {item.orderItems?.length}
                </td>
                <td className="px-4 py-2 text-gray-50 whitespace-nowrap">
                  ${item.totalPrice}
                </td>
                <td className="px-4 py-2 text-gray-50 whitespace-nowrap">
                  {item.isPaid ? (
                    <>
                      <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-100 bg-green-600 rounded-full">
                        Complated
                      </div>
                    </>
                  ) : (
                    <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-yellow-300 rounded-full">
                      Pending
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                  {item.isDelivered ? (
                    <>
                      <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-100 bg-green-600 rounded-full">
                        Complated
                      </div>
                    </>
                  ) : (
                    <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-yellow-300 rounded-full">
                      Pending
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                  <Link
                    to={`/order/${item._id}`}
                    className="block px-4 py-2 font-bold text-white rounded bg-primary hover:bg-secondry"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
