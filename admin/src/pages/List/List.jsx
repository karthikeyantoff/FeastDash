import "./List.css"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const removeFood = async (foodId, foodName) => {
    if (!window.confirm(`Are you sure you want to delete "${foodName}" from FeastDash?`)) {
      return;
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        {
          headers: {
            token,
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setList((prev) => prev.filter((item) => item._id !== foodId));
        toast.success(response.data.message || "Food item removed successfully");
      } else {
        toast.error(response.data.message || "Failed to remove food");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove food");
    }
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to fetch menu list");
      }
    } catch {
      toast.error("Failed to fetch menu list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchList();
  }, [url]);

  const filteredList = list.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="list panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Manage FeastDash Menu</h2>
        </div>
        <p className="section-note">Review active items, check pricing, and clean up outdated catalog dishes.</p>
      </div>

      <div style={{ marginBottom: "1.2rem", display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Filter dishes by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#fff"
          }}
        />
      </div>

      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Status</b>
          <b>Action</b>
        </div>
        {loading ? (
          <div className="empty-state">Loading menu items...</div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state">No matching menu items found. Add dishes via "Add Items".</div>
        ) : (
          filteredList.map((item) => {
            return (
              <div className="list-table-format" key={item._id}>
                <img
                  src={item.image.startsWith("http") ? item.image : `${url}/images/${item.image}`}
                  alt={item.name}
                  className="list-image"
                />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>₹{item.price}</p>
                <p style={{ color: item.isAvailable !== false ? "#10b981" : "#ef4444", fontSize: "0.85rem" }}>
                  {item.isAvailable !== false ? "● Available" : "● Out of Stock"}
                </p>
                <button
                  onClick={() => removeFood(item._id, item.name)}
                  className="cursor"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    padding: "0.3rem 0.7rem",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                  title="Delete dish"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default List;
