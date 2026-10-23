import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            try {
                await axios.post(
                    url + "/api/cart/add",
                    { itemId, foodId: itemId },
                    {
                        headers: {
                            token,
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            } catch (error) {
                console.error("Failed to add cart item:", error);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            if (updated[itemId] > 1) {
                updated[itemId] -= 1;
            } else {
                delete updated[itemId];
            }
            return updated;
        });

        if (token) {
            try {
                await axios.post(
                    url + "/api/cart/remove",
                    { itemId, foodId: itemId },
                    {
                        headers: {
                            token,
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            } catch (error) {
                console.error("Failed to remove cart item:", error);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    };

    const loadData = async () => {
        try {
            const foodResponse = await axios.get(url + "/api/food/list");
            setFoodList(foodResponse.data.data || []);
        } catch (err) {
            console.error("Failed to fetch food list:", err);
        }

        const localToken = localStorage.getItem("token");
        if (localToken) {
            setToken(localToken);
            try {
                const cartResponse = await axios.post(
                    url + "/api/cart/get",
                    {},
                    {
                        headers: {
                            token: localToken,
                            Authorization: `Bearer ${localToken}`
                        }
                    }
                );
                setCartItems(cartResponse.data.cartData || {});
            } catch (error) {
                console.error("Failed to load cart:", error);
            }
        }
    };

    useEffect(() => {
        void loadData();
    }, [url]);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        loadData
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
