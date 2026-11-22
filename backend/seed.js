// Sample leads so the app is not empty on first run: `npm run seed`
require("dotenv").config();
const mongoose = require("mongoose");
const { Lead } = require("./src/models/Lead");

const SAMPLES = [
  { name: "Priya Sharma", email: "priya@shopexample.in", phone: "+91 98765 43210", company: "ShopExample", source: "Website", status: "New" },
  { name: "Rahul Verma", email: "rahul@techstart.io", phone: "+91 91234 56780", company: "TechStart", source: "Referral", status: "Contacted" },
  { name: "Anita Gupta", email: "anita@freshmart.co", phone: "+91 99887 76655", company: "FreshMart", source: "Social Media", status: "Qualified" },
  { name: "Vikram Singh", email: "vikram@logipoint.com", phone: "+91 98111 22334", company: "LogiPoint", source: "Cold Call", status: "New" },
  { name: "Neha Patel", email: "neha@healthplus.org", phone: "+91 90000 11122", company: "HealthPlus", source: "Advertisement", status: "Lost" },
];

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lead-manager";
  await mongoose.connect(uri);
  await Lead.deleteMany({});
  await Lead.insertMany(SAMPLES);
  console.log(`Seeded ${SAMPLES.length} sample leads.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
