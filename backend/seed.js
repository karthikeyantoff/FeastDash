import "dotenv/config";
import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";

const dishes = [
  // Cake
  {
    name: "Chocolate Truffle Cake",
    description: "Rich dark chocolate ganache layered between moist chocolate sponge",
    price: 350,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Butterscotch Crunch Cake",
    description: "Caramel butterscotch sponge infused with praline crunch",
    price: 320,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Red Velvet Pastry Slice",
    description: "Velvety cocoa sponge with rich cream cheese frosting",
    price: 180,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Strawberry Cupcake",
    description: "Fluffy vanilla cupcake topped with fresh strawberry swirls",
    price: 90,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },

  // Salad
  {
    name: "Greek Garden Salad",
    description: "Crisp cucumber, cherry tomatoes, kalamata olives, and fresh feta",
    price: 150,
    category: "Salad",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Mediterranean Veg Salad",
    description: "Fresh tossed greens with bell peppers, sweet corn, and vinaigrette",
    price: 130,
    category: "Salad",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },

  // Rolls
  {
    name: "Paneer Tikka Roll",
    description: "Char-grilled cottage cheese wrapped in flaky paratha with mint chutney",
    price: 170,
    category: "Rolls",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Crispy Veg Spring Rolls",
    description: "Golden fried rolls filled with seasoned shredded vegetables",
    price: 140,
    category: "Rolls",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },

  // Desserts
  {
    name: "Belgian Chocolate Waffle",
    description: "Warm crispy waffle smothered in warm melted Belgian chocolate",
    price: 190,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Gulab Jamun with Ice Cream",
    description: "Classic hot milk dumplings paired with vanilla bean ice cream",
    price: 120,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },

  // Sandwich
  {
    name: "Grilled Cheese & Corn Sandwich",
    description: "Toasted golden sourdough loaded with melted cheddar and sweet corn",
    price: 130,
    category: "Sandwich",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Avocado Veg Club Sandwich",
    description: "Multi-grain triple decker with creamy avocado, tomato, and lettuce",
    price: 180,
    category: "Sandwich",
    image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },

  // Pure Veg
  {
    name: "Paneer Butter Masala",
    description: "Succulent paneer cubes simmered in a creamy buttery tomato gravy",
    price: 240,
    category: "Pure Veg",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils in butter and cream with aromatic spices",
    price: 200,
    category: "Pure Veg",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },

  // Pasta
  {
    name: "Creamy Alfredo Penne",
    description: "Penne pasta tossed in rich parmesan garlic white cream sauce",
    price: 210,
    category: "Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281093?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Spicy Red Sauce Arrabbiata",
    description: "Penne in zesty herb tomato sauce with black olives and chili flakes",
    price: 190,
    category: "Pasta",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },

  // Noodles
  {
    name: "Veg Hakka Noodles",
    description: "Wok-tossed noodles with crunchy bell peppers, carrots, and scallions",
    price: 160,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Schezwan Chili Noodles",
    description: "Fiery spicy noodles tossed in homemade Schezwan sauce with veggies",
    price: 180,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80",
    isAvailable: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas for seeding...");

    // Remove existing items and insert initial menu items
    await foodModel.deleteMany({});
    const inserted = await foodModel.insertMany(dishes);
    console.log(`Successfully seeded ${inserted.length} dishes across all 8 categories!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDB();
