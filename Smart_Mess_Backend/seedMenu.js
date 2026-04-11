const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// --- Schemas (inline to avoid TS import issues) ---
const messSchema = new mongoose.Schema({
  messName: { type: String, required: true },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
});

const foodItemSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Image: { type: String },
  Calories: { type: Number },
  Category: { type: Number, required: true },
});

const menuTableSchema = new mongoose.Schema({
  Day: { type: String, required: true },
  MealType: { type: String, required: true },
  Meal_Items: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "FoodItem",
    required: true,
  },
  Mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mess",
    required: true,
  },
});

const userSchema = new mongoose.Schema({}, { strict: false });

const Mess = mongoose.models.Mess || mongoose.model("Mess", messSchema);
const FoodItem = mongoose.models.FoodItem || mongoose.model("FoodItem", foodItemSchema);
const MenuTable = mongoose.models.MenuTable || mongoose.model("MenuTable", menuTableSchema);
const User = mongoose.models.user || mongoose.model("user", userSchema);

// --- MENU DATA from "revised mess menu.pdf" ---
const menuData = {
  Monday: {
    Breakfast: [
      "Poha", "Sev Namkeen", "Boiled Sweet Corn", "Omelette",
      "Banana / Corn Flakes", "BBJ / Milk", "Coffee / Elaichi Tea / Bournvita"
    ],
    Lunch: [
      "Fried Rice", "Plain Rice", "Dal Tadka", "Mix Sprouts Dry",
      "Manchurian Gravy", "Chapathi / Fulka", "Lemon Juice",
      "Curd", "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices"
    ],
    Snacks: [
      "Pasta / Noodles", "Ketchup", "Banana",
      "BBJ / Ginger Tea / Coffee"
    ],
    Dinner: [
      "Onion Masala Rice", "Plain Rice", "Paneer Kolhapuri",
      "Dal Kolhapuri", "Sambar", "Chapathi / Fulka",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices", "Jalebi"
    ],
  },
  Tuesday: {
    Breakfast: [
      "Methi Paratha", "Veg Kurma", "Black Chana Sprouts",
      "Green Moong Sprouts", "Banana / Corn Flakes", "BBJ / Milk",
      "Coffee / Elaichi Tea / Bournvita"
    ],
    Lunch: [
      "Puliyogra Rice", "Plain Rice", "Dal Fry", "Sambar",
      "Soya Chilli", "Aloo Chole Masala", "Chapathi / Fulka",
      "Lassi", "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices"
    ],
    Snacks: [
      "Samosa", "Green and Red Chutney", "Banana",
      "BBJ / Ginger Tea / Coffee"
    ],
    Dinner: [
      "Lemon Rice", "Plain Rice", "Black Chana Dry",
      "Veg Kolhapuri", "Mix Dal", "Chapathi / Fulka",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices",
      "Curd", "Ice Cream"
    ],
  },
  Wednesday: {
    Breakfast: [
      "Uttapam", "Sambar", "Chutney", "Egg Bhurji",
      "Banana / Corn Flakes", "BBJ / Milk",
      "Coffee / Elaichi Tea / Bournvita"
    ],
    Lunch: [
      "Curd Rice", "Plain Rice", "Dal Methi",
      "Beans Carrot Mutter Dry", "Kadhi Pakoda", "Chapathi / Fulka",
      "Rasna", "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices"
    ],
    Snacks: [
      "Panipuri", "Pani / Aloo Masala", "Banana",
      "BBJ / Ginger Tea / Coffee"
    ],
    Dinner: [
      "Plain Rice", "Shahi Paneer", "Egg Curry",
      "Chana Dal", "Chapathi / Fulka",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices",
      "Shevai Kheer"
    ],
  },
  Thursday: {
    Breakfast: [
      "Idli Vada", "Sambar / Chutney", "Boiled Peanuts", "Boiled Egg",
      "Banana / Corn Flakes", "BBJ / Milk",
      "Coffee / Elaichi Tea / Bournvita"
    ],
    Lunch: [
      "Jeera Dhaniya Rice", "Plain Rice", "Dal Fry", "Sambar",
      "Paneer Butter Masala", "Chapathi / Fulka",
      "Buttermilk", "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices"
    ],
    Snacks: [
      "Vadapav", "Pudi Chutney / Green Chutney", "Seasonal Fruits",
      "BBJ / Ginger Tea / Coffee"
    ],
    Dinner: [
      "Kichidi / Bisibelebath", "Plain Rice", "Chole Dry",
      "Soya Gravy", "Dal Pancharatan", "Chapathi / Fulka",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices",
      "Curd", "Motichoor Ladoo"
    ],
  },
  Friday: {
    Breakfast: [
      "Vermicelli / Upma", "Chutney", "Black Chana Sprouts",
      "Banana / Corn Flakes", "BBJ / Milk",
      "Coffee / Elaichi Tea / Bournvita"
    ],
    Lunch: [
      "Veg Biryani", "Egg Biryani", "Mix Veg Raita",
      "Whole Masoor Semigravy", "Chapathi / Fulka",
      "Lemon Juice", "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices"
    ],
    Snacks: [
      "Bhel Puri / Mix Veg Pakoda", "Green & Red Chutney", "Banana",
      "BBJ / Ginger Tea / Coffee"
    ],
    Dinner: [
      "Fried Rice", "Plain Rice", "Aloo Tamater Rassa",
      "Methi Masoor", "Sambar", "Chapathi / Fulka",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices",
      "Curd", "Gulab Jamun"
    ],
  },
  Saturday: {
    Breakfast: [
      "Sheera Masala Dosa", "Sambar / Chutney", "Matki Sprouts",
      "Boiled Egg", "Banana / Corn Flakes", "BBJ / Milk",
      "Coffee / Elaichi Tea / Bournvita"
    ],
    Lunch: [
      "Schezwan Rice", "Plain Rice", "Dal Palak",
      "Aloo Jeera", "Chole Masala", "Til Poori",
      "Rasna", "Curd", "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices"
    ],
    Snacks: [
      "Misal Pav", "Sev Onion Lemon", "Banana",
      "BBJ / Ginger Tea / Coffee"
    ],
    Dinner: [
      "Curd Rice", "Plain Rice", "Aloo Palak",
      "Rajma Masala", "Dal Tadka", "Chapathi / Fulka",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices",
      "Ice Cream / Kulfi"
    ],
  },
  Sunday: {
    Breakfast: [
      "Aloo Paratha / Aloo Gobi Paratha", "Curd / Pickle",
      "Green Moong Sprouts", "Banana / Chocos", "BBJ / Milk",
      "Coffee / Elaichi Tea / Bournvita"
    ],
    Lunch: [
      "Plain Rice", "Dal Palak", "Paneer Bhurji",
      "Egg Curry", "Chapathi / Fulka", "Cold Badam Milk",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices"
    ],
    Snacks: [
      "Masala Idli", "Coconut Chutney", "Seasonal Fruits",
      "BBJ / Ginger Tea / Coffee"
    ],
    Dinner: [
      "Veg Biryani", "Plain Rice", "Brinjal Masala",
      "Chana Dal", "Raita", "Chapathi / Fulka",
      "Salad", "Papad / Pickle", "Green Chilly / Lemon Slices",
      "Coconut Barfi"
    ],
  },
};

// --- SEED FUNCTION ---
async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Step 1: Clear existing menu data
    console.log("\n--- Clearing old menu data ---");
    await MenuTable.deleteMany({});
    await FoodItem.deleteMany({});
    await Mess.deleteMany({});
    console.log("Old data cleared.");

    // Step 2: Create a Mess
    console.log("\n--- Creating Mess ---");
    const mess = await Mess.create({
      messName: "IIT Dharwad Main Mess",
      capacity: 500,
      location: "IIT Dharwad Campus",
      rating: 4,
    });
    console.log(`Mess created: ${mess.messName} (${mess._id})`);

    // Step 3: Create all unique food items
    console.log("\n--- Creating Food Items ---");
    const foodItemCache = {};
    let totalItems = 0;

    for (const day of Object.keys(menuData)) {
      for (const mealType of Object.keys(menuData[day])) {
        for (const itemName of menuData[day][mealType]) {
          if (!foodItemCache[itemName]) {
            const foodItem = await FoodItem.create({
              Name: itemName,
              Category: 1, // 1 = General
            });
            foodItemCache[itemName] = foodItem._id;
            totalItems++;
          }
        }
      }
    }
    console.log(`Created ${totalItems} unique food items.`);

    // Step 4: Create MenuTable entries
    console.log("\n--- Creating Menu Table Entries ---");
    let menuEntries = 0;

    for (const day of Object.keys(menuData)) {
      for (const mealType of Object.keys(menuData[day])) {
        const itemIds = menuData[day][mealType].map(
          (name) => foodItemCache[name]
        );
        await MenuTable.create({
          Day: day,
          MealType: mealType,
          Meal_Items: itemIds,
          Mess: mess._id,
        });
        menuEntries++;
        console.log(`  ✅ ${day} - ${mealType} (${itemIds.length} items)`);
      }
    }
    console.log(`\nCreated ${menuEntries} menu table entries.`);

    // Step 5: Assign this mess to all users
    console.log("\n--- Assigning Mess to Users ---");
    const updateResult = await User.updateMany(
      {},
      { $set: { Eating_Mess: mess._id } }
    );
    console.log(
      `Updated ${updateResult.modifiedCount} users with Eating_Mess.`
    );

    console.log("\n🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log(`   Mess: ${mess.messName}`);
    console.log(`   Food Items: ${totalItems}`);
    console.log(`   Menu Entries: ${menuEntries} (7 days x 4 meals)`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

seedDatabase();
