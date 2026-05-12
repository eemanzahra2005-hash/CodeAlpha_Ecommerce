const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in backend/.env. Get these from Supabase project Settings > API.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const defaultProducts = [
    { name: "Shoes", price: 50.0 },
    { name: "Watch", price: 70.0 },
    { name: "Phone", price: 300.0 }
];

async function setup() {
    try {
        console.log("Connected to Supabase.");

        // Note: Table creation via JS client is limited. Please ensure the 'products' table exists
        // in your Supabase database with columns: id (bigint, primary key), name (text), price (numeric)
        console.log("Please ensure the 'products' table exists in your Supabase database.");

        // Check if products exist
        const { data: existingProducts, error: selectError } = await supabase
            .from("products")
            .select("*");

        if (selectError) {
            console.error("Error checking products:", selectError.message);
            console.log("Make sure the 'products' table exists in your Supabase database.");
            return;
        }

        if (!existingProducts || existingProducts.length === 0) {
            const { error: insertError } = await supabase
                .from("products")
                .insert(defaultProducts);

            if (insertError) {
                console.error("Error seeding products:", insertError.message);
            } else {
                console.log("Seeded default products into Supabase.");
            }
        } else {
            console.log(`Products table already contains ${existingProducts.length} rows.`);
        }

    } catch (error) {
        console.error("Setup failed:", error.message);
    }
}

setup().then(() => {
    console.log("Setup complete.");
    process.exit(0);
}).catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
});
