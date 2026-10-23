import { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../Context/storeContext";
import axios from "axios";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const { url, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying payment with Stripe...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.get(`${url}/api/order/verify`, {
          params: {
            success,
            orderId,
            session_id: sessionId
          }
        });

        if (response.data.success) {
          setMessage("Payment verified! Redirecting to your orders...");
          if (setCartItems) setCartItems({});
          setTimeout(() => navigate("/myorders"), 1500);
        } else {
          setMessage("Payment could not be verified. Returning to cart...");
          setTimeout(() => navigate("/cart"), 2000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setMessage("Error verifying order. Redirecting home...");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    if (!orderId) {
      navigate("/");
      return;
    }

    void verifyPayment();
  }, [navigate, orderId, success, sessionId, url, setCartItems]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p style={{ marginTop: "1.5rem", color: "#fff", fontWeight: 500, fontSize: "1.1rem" }}>
        {message}
      </p>
    </div>
  );
};

export default Verify;
