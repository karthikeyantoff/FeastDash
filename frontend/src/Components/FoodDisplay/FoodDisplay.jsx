import { useContext, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../Context/storeContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFoods = (food_list || []).filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="food-display" id="food-display">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h2 className="food-display-title" style={{ margin: 0 }}>
            Top Dishes <span className="gradient-text">Near You</span>
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "0.4rem", fontSize: "0.95rem" }}>
            Freshly prepared by top kitchens and delivered straight to your door.
          </p>
        </div>

        {/* Live Search Bar */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <input
            type="text"
            placeholder="🔍 Search dishes or ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.7rem 1.2rem",
              borderRadius: "24px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              outline: "none",
              fontSize: "0.9rem"
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "16px" }}>
          <span style={{ fontSize: "2.5rem" }}>🍽️</span>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", marginTop: "1rem", fontSize: "1.1rem" }}>
            No dishes found matching your selection.
          </p>
          <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.85rem", marginTop: "0.3rem" }}>
            Try adjusting your search query or selecting a different category above.
          </p>
        </div>
      ) : (
        <div className="food-display-grid">
          {filteredFoods.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              description={item.description}
              image={item.image}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FoodDisplay;
