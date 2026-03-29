require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing environment variables.");
  console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedProfessors() {
  try {
    const filePath = path.join(__dirname, "data", "bau_professors.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const professors = JSON.parse(raw).map(p => {
  const { id, department_raw, ...rest } = p;
  return rest;
});

    const { data, error } = await supabase
      .from("professors")
      .upsert(professors, {
        onConflict: "full_name",
      })
      .select();

    if (error) {
      console.error("Seed error:", error);
      process.exit(1);
    }

    console.log(`Seeded ${data.length} professors successfully.`);
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

seedProfessors();