import "./Orders.css"
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets";

const orderStatuses = [
  "Pending Payment",
  "Confirmed",
  "Food Preparing",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const Orders = ({ url, token }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  const normalizeStatus = (status) => {
    return orderStatuses.includes(status) ? status : orderStatuses[1];
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(
        `${url}/api/order/status`,
        {
          orderId,
          status: newStatus
        },
        {
          headers: {
            token,
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success(`Order status updated to "${newStatus}"`);
      }
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`, {
        headers: {
          token,
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch {
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, [url, token]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "paid") return order.payment;
    if (filter === "active") return !["Delivered", "Cancelled"].includes(order.status);
    if (filter === "delivered") return order.status === "Delivered";
    if (filter === "cancelled") return order.status === "Cancelled";
    return true;
  });

  return (
    <div className="order panel-card">
      <div className="section-heading" style={{ marginBottom: "1rem" }}>
        <div>
          <p className="eyebrow">Fulfillment Queue</p>
          <h2>FeastDash Order Pipeline</h2>
        </div>
        <p className="section-note">Review live incoming orders, check payment status, and update kitchen progress.</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { key: "all", label: `All (${orders.length})` },
          { key: "active", label: `Active (${orders.filter(o => !["Delivered", "Cancelled"].includes(o.status)).length})` },
          { key: "paid", label: `Paid (${orders.filter(o => o.payment).length})` },
          { key: "delivered", label: `Delivered (${orders.filter(o => o.status === "Delivered").length})` },
          { key: "cancelled", label: `Cancelled (${orders.filter(o => o.status === "Cancelled").length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "20px",
              background: filter === tab.key ? "var(--primary-accent, #ff4c24)" : "rgba(255, 255, 255, 0.08)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="order-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">No orders match the selected filter.</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-item">
              <img src={assets.parcel_icon} alt="Parcel" />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: order.payment ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: order.payment ? "#10b981" : "#f59e0b",
                      border: `1px solid ${order.payment ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`
                    }}
                  >
                    {order.payment ? "✓ PAID" : "⏳ UNPAID"}
                  </span>
                  <small style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    {order.date ? new Date(order.date).toLocaleDateString() : ""}
                  </small>
                </div>

                <p className="order-item-food">
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return `${item.name} x ${item.quantity}`;
                    }
                    return `${item.name} x ${item.quantity}, `;
                  })}
                </p>
                <p className="order-item-name">
                  {order.address?.firstName || ""} {order.address?.lastName || ""}
                </p>
                <div className="order-item-address">
                  <p>
                    {[order.address?.street, order.address?.city, order.address?.state, order.address?.zipCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <p className="order-item-phone">📞 {order.address?.phone || "No phone provided"}</p>
              </div>

              <div>
                <p style={{ fontWeight: 600, fontSize: "1.1rem", color: "#fff" }}>₹{order.amount?.toFixed(2)}</p>
                <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>
                  {order.items?.length || 0} items
                </p>
              </div>

              <select
                className="order-status-select"
                onChange={(event) => statusHandler(event, order._id)}
                value={normalizeStatus(order.status)}
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
