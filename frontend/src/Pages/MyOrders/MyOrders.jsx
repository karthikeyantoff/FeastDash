import { useContext, useEffect, useState, useCallback } from "react"
import "./MyOrders.css"
import { StoreContext } from "../../Context/storeContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const pipelineStages = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];

const getStageIndex = (status) => {
  if (status === "Food Preparing") return 1;
  const idx = pipelineStages.indexOf(status);
  return idx === -1 ? 0 : idx;
};

const MyOrders = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(url + "/api/order/userorders", {
              headers: {
                token,
                Authorization: `Bearer ${token}`
              }
            });
            setData(response.data.data || []);
        } catch {
            // fallback to POST
            try {
              const res = await axios.post(url + "/api/order/userorders", {}, {
                headers: { token, Authorization: `Bearer ${token}` }
              });
              setData(res.data.data || []);
            } catch {
              setData([]);
            }
        } finally {
            setLoading(false);
        }
    }, [url, token]);

    useEffect(() => {
        if (token) {
            void fetchOrders();
        } else {
            navigate("/cart");
        }
    }, [token, fetchOrders, navigate]);

  return (
    <div className="my-orders">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>My Orders</h2>
        <button
          onClick={fetchOrders}
          className="btn-gradient"
          style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}
        >
          {loading ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </div>

      <div className="container">
        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "16px" }}>
            <span style={{ fontSize: "3rem" }}>🍱</span>
            <h3 style={{ marginTop: "1rem", color: "#fff" }}>No orders placed yet</h3>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "0.5rem" }}>
              Explore the FeastDash menu and order delicious food delivered fresh!
            </p>
            <button
              className="btn-gradient"
              onClick={() => navigate("/")}
              style={{ marginTop: "1.5rem", padding: "0.6rem 1.4rem" }}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          data.map((order, index) => {
            const currentStage = getStageIndex(order.status);
            const isCancelled = order.status === "Cancelled";

            return (
                <div key={order._id || index} className="my-orders-order" style={{ flexDirection: "column", alignItems: "stretch", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <img src={assets.parcel_icon} alt="Parcel" />
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
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
                            {order.payment ? "✓ Paid" : "⏳ Payment Pending"}
                          </span>
                          <small style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                            {order.date ? new Date(order.date).toLocaleDateString() : ""}
                          </small>
                        </div>
                        <p style={{ fontWeight: 600, color: "#fff" }}>
                          {order.items.map((item, idx) => (
                            idx === order.items.length - 1 ? `${item.name} x ${item.quantity}` : `${item.name} x ${item.quantity}, `
                          ))}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary-accent, #ff6b4a)" }}>
                        ₹{order.amount.toFixed(2)}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>
                        {order.items.length} items
                      </p>
                    </div>
                  </div>

                  {/* Status Progress Stepper */}
                  {!isCancelled ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.8rem 1rem",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "10px",
                      marginTop: "0.5rem"
                    }}>
                      {pipelineStages.map((stage, sIdx) => {
                        const isDone = sIdx <= currentStage;
                        const isCurrent = sIdx === currentStage;
                        return (
                          <div key={stage} style={{ display: "flex", alignItems: "center", gap: "0.4rem", opacity: isDone ? 1 : 0.4 }}>
                            <span style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: isCurrent ? "#ff6b4a" : (isDone ? "#10b981" : "rgba(255,255,255,0.2)"),
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              color: "#fff"
                            }}>
                              {isDone && !isCurrent ? "✓" : sIdx + 1}
                            </span>
                            <span style={{ fontSize: "0.8rem", color: isCurrent ? "#ff6b4a" : "#fff", fontWeight: isCurrent ? 600 : 400 }}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: "0.5rem 1rem", background: "rgba(239, 68, 68, 0.15)", borderRadius: "8px", color: "#ef4444", fontSize: "0.85rem" }}>
                      ✕ Order was cancelled
                    </div>
                  )}
                </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MyOrders
