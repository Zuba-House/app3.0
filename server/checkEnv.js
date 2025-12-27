import "dotenv/config";

console.log("Cloudinary ENV variables:");
console.log("cloud_name:", process.env.cloudinary_Config_Cloud_Name);
console.log("api_key:", process.env.cloudinary_Config_api_key);
console.log("api_secret:", process.env.cloudinary_Config_api_secret ? "✔️ Loaded" : "❌ Missing");
