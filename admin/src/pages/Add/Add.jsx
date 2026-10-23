import { assets } from "../../assets/assets"
import "./Add.css"
import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  })

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please upload an image for the food item");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("adminToken");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("image", image);

      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: {
          token,
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad"
        });
        setImage(false);
        toast.success(response.data.message || "Food item added successfully!");
      } else {
        toast.error(response.data.message || "Failed to add food item");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add food item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add panel-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Add menu item</h2>
        </div>
        <p className="section-note">Upload a strong image, describe the dish, and publish it to the storefront.</p>
      </div>

      <form className="flex-col add-form" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="Upload Image" />
          </label>
          <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" accept="image/*" hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder="Enter product name" required /> 
        </div>
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder="Write description here" required></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product Category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Desserts">Desserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price (₹)</p>
            <input onChange={onChangeHandler} value={data.price} type="number" name="price" placeholder="20" min="1" required />
          </div>
        </div>
        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? "Publishing to Cloudinary..." : "Add Product"}
        </button>
      </form>
    </div>
  )
}

export default Add