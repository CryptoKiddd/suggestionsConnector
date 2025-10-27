// seedUsers.js - MongoDB Seed Script for SmartConnect AI
// Run this file to add 50 sample users to your database

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartconnect';

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  bio: String,
  enrichedBio: String,
  skills: [String],
  enrichedSkills: [String],
  interests: [String],
  linkedinURL: String,
  industry: String,
  location: String,
  embedding: [Number],
  collaborationTargets: [String],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Sample Users Data - 50 Diverse Professionals
const sampleUsers = [
 
  {
    name: "Hassan Ahmed",
    email: "hassan.a@telecom.com",
    bio: "Telecommunications engineer specializing in 5G networks and wireless communication systems.",
    skills: ["Telecommunications", "5G", "Network Engineering", "Wireless Systems", "RF Engineering"],
    interests: ["5G Technology", "Telecommunications", "Network Infrastructure", "Wireless"],
    industry: "Telecommunications",
    location: "San Jose, CA"
  },
  {
    name: "Grace Liu",
    email: "grace.liu@musictech.com",
    bio: "Music technology entrepreneur building platforms for artists and producers. Expert in audio engineering and music production.",
    skills: ["Music Production", "Audio Engineering", "Product Management", "Music Technology", "Signal Processing"],
    interests: ["Music Technology", "Audio", "Music Production", "Artist Tools"],
    industry: "Music Technology",
    location: "Nashville, TN"
  },
  {
    name: "Patrick Murphy",
    email: "patrick.m@insurance.com",
    bio: "Insurance technology analyst modernizing claims processing and underwriting through AI and automation.",
    skills: ["Insurance", "Data Analysis", "Risk Assessment", "AI", "Process Automation"],
    interests: ["InsurTech", "AI", "Risk Management", "Insurance Innovation"],
    industry: "Insurance Technology",
    location: "Hartford, CT"
  },
  {
    name: "Zara Khan",
    email: "zara.khan@aerospace.com",
    bio: "Aerospace engineer working on satellite systems and space exploration technology.",
    skills: ["Aerospace Engineering", "Systems Engineering", "MATLAB", "CAD", "Project Management"],
    interests: ["Space Technology", "Satellites", "Aerospace", "Space Exploration"],
    industry: "Aerospace",
    location: "Seattle, WA"
  },
  {
    name: "Lucas Silva",
    email: "lucas.silva@agriculture.com",
    bio: "Agricultural technology specialist implementing precision farming and IoT solutions for modern farms.",
    skills: ["Agriculture Technology", "IoT", "Data Analysis", "Precision Farming", "Sustainability"],
    interests: ["AgTech", "Precision Agriculture", "Sustainability", "Food Technology"],
    industry: "Agriculture Technology",
    location: "Des Moines, IA"
  },
  {
    name: "Victoria Chang",
    email: "victoria.c@realestatetech.com",
    bio: "Real estate technology product manager building platforms for property management and real estate investment.",
    skills: ["Real Estate Technology", "Product Management", "PropTech", "Analytics", "CRM"],
    interests: ["PropTech", "Real Estate", "Property Management", "Investment Technology"],
    industry: "Real Estate Technology",
    location: "Los Angeles, CA"
  },
  {
    name: "Benjamin Wright",
    email: "ben.wright@energy.com",
    bio: "Energy analyst focused on renewable energy systems and grid optimization. Expert in solar and wind power.",
    skills: ["Renewable Energy", "Energy Analysis", "Solar Power", "Wind Energy", "Grid Systems"],
    interests: ["Clean Energy", "Renewable Energy", "Energy Storage", "Grid Modernization"],
    industry: "Energy",
    location: "Denver, CO"
  },
  {
    name: "Maya Patel",
    email: "maya.patel@pharma.com",
    bio: "Pharmaceutical data scientist accelerating drug discovery through machine learning and computational chemistry.",
    skills: ["Pharmaceutical", "Machine Learning", "Data Science", "Chemistry", "Drug Discovery"],
    interests: ["Pharmaceutical Technology", "Drug Discovery", "Computational Biology", "Healthcare"],
    industry: "Pharmaceutical",
    location: "Boston, MA"
  },
  {
    name: "Jordan Lee",
    email: "jordan.lee@sports.com",
    bio: "Sports analytics manager using data to optimize team performance and player development strategies.",
    skills: ["Sports Analytics", "Data Analysis", "Statistics", "Performance Analysis", "Python"],
    interests: ["Sports Technology", "Analytics", "Performance Optimization", "Sports Science"],
    industry: "Sports",
    location: "Phoenix, AZ"
  },
  {
    name: "Elena Volkov",
    email: "elena.volkov@translation.com",
    bio: "Language technology specialist building AI-powered translation and localization platforms.",
    skills: ["NLP", "Machine Translation", "Localization", "Python", "Linguistics"],
    interests: ["Language Technology", "AI", "Translation", "Localization"],
    industry: "Language Technology",
    location: "San Francisco, CA"
  },
  {
    name: "Tyler Anderson",
    email: "tyler.a@retail.com",
    bio: "Retail technology consultant implementing omnichannel solutions and inventory management systems.",
    skills: ["Retail Technology", "Omnichannel", "Inventory Management", "POS Systems", "Analytics"],
    interests: ["Retail Innovation", "E-commerce", "Omnichannel", "Customer Experience"],
    industry: "Retail",
    location: "Minneapolis, MN"
  },
  {
    name: "Fatima Hassan",
    email: "fatima.h@logistics.com",
    bio: "Logistics technology director optimizing supply chain operations through AI and predictive analytics.",
    skills: ["Logistics", "Supply Chain", "AI", "Predictive Analytics", "Operations"],
    interests: ["Supply Chain Technology", "Logistics", "AI", "Operations Optimization"],
    industry: "Logistics",
    location: "Memphis, TN"
  },
  {
    name: "Nathan Cooper",
    email: "nathan.c@media.com",
    bio: "Media technology producer creating immersive experiences with AR/VR. Expert in 360 video and spatial audio.",
    skills: ["AR/VR", "Video Production", "3D Modeling", "Unity", "Spatial Audio"],
    interests: ["Virtual Reality", "Augmented Reality", "Immersive Media", "3D Content"],
    industry: "Media Technology",
    location: "Los Angeles, CA"
  },
  {
    name: "Samantha Brooks",
    email: "sam.brooks@travel.com",
    bio: "Travel technology entrepreneur building personalized trip planning platforms powered by AI recommendations.",
    skills: ["Travel Technology", "Product Management", "AI", "Mobile Development", "UX Design"],
    interests: ["Travel Tech", "AI", "Personalization", "Mobile Apps"],
    industry: "Travel Technology",
    location: "Miami, FL"
  },
  {
    name: "Diego Martinez",
    email: "diego.m@manufacturing.com",
    bio: "Manufacturing engineer implementing Industry 4.0 solutions and smart factory technologies.",
    skills: ["Manufacturing", "Industry 4.0", "IoT", "Automation", "Lean Manufacturing"],
    interests: ["Smart Manufacturing", "Industry 4.0", "Automation", "Industrial IoT"],
    industry: "Manufacturing",
    location: "Milwaukee, WI"
  },
  {
    name: "Hannah Cohen",
    email: "hannah.c@publishing.com",
    bio: "Digital publishing specialist transforming traditional media with interactive content and digital distribution.",
    skills: ["Digital Publishing", "Content Management", "Editorial", "Digital Media", "SEO"],
    interests: ["Digital Media", "Publishing", "Content Strategy", "Interactive Content"],
    industry: "Publishing",
    location: "New York, NY"
  },
  {
    name: "Omar Ibrahim",
    email: "omar.ibrahim@foodtech.com",
    bio: "Food technology innovator developing sustainable food production and delivery systems.",
    skills: ["Food Technology", "Operations", "Supply Chain", "Sustainability", "Product Development"],
    interests: ["Food Tech", "Sustainability", "Food Delivery", "Food Innovation"],
    industry: "Food Technology",
    location: "San Francisco, CA"
  },
  {
    name: "Claire Martin",
    email: "claire.m@eventtech.com",
    bio: "Event technology manager creating virtual and hybrid event platforms. Expert in livestreaming and engagement tools.",
    skills: ["Event Technology", "Virtual Events", "Livestreaming", "Event Management", "Platform Development"],
    interests: ["Event Tech", "Virtual Events", "Hybrid Events", "Event Innovation"],
    industry: "Event Technology",
    location: "Las Vegas, NV"
  },
  {
    name: "Wei Zhang",
    email: "wei.zhang@semiconductor.com",
    bio: "Semiconductor engineer designing next-generation chips for AI and edge computing applications.",
    skills: ["Semiconductor", "Chip Design", "VLSI", "Hardware Engineering", "AI Hardware"],
    interests: ["Semiconductor Technology", "AI Chips", "Hardware", "Edge Computing"],
    industry: "Semiconductor",
    location: "San Jose, CA"
  },
  {
    name: "Leah Johnson",
    email: "leah.j@wellness.com",
    bio: "Wellness technology founder building mental health and meditation apps. Certified therapist and UX designer.",
    skills: ["Mental Health", "UX Design", "Mobile Development", "Product Management", "Psychology"],
    interests: ["Mental Health Tech", "Wellness", "Meditation", "Health Apps"],
    industry: "Wellness Technology",
    location: "Portland, OR"
  },
  {
    name: "Andre Dubois",
    email: "andre.d@photography.com",
    bio: "Photography technology specialist developing AI-powered editing tools and camera systems.",
    skills: ["Photography", "Computer Vision", "Image Processing", "AI", "Product Development"],
    interests: ["Photography Technology", "AI", "Image Processing", "Camera Tech"],
    industry: "Photography",
    location: "New York, NY"
  },
  {
    name: "Jasmine Williams",
    email: "jasmine.w@beauty.com",
    bio: "Beauty tech entrepreneur creating AR-powered virtual try-on experiences and personalized skincare solutions.",
    skills: ["Beauty Technology", "AR", "Product Management", "E-commerce", "Marketing"],
    interests: ["Beauty Tech", "AR", "Personalization", "Skincare Innovation"],
    industry: "Beauty Technology",
    location: "Los Angeles, CA"
  },
  {
    name: "Sebastian Torres",
    email: "sebastian.t@maritime.com",
    bio: "Maritime technology engineer developing autonomous shipping and port optimization systems.",
    skills: ["Maritime Technology", "Autonomous Systems", "Logistics", "IoT", "Engineering"],
    interests: ["Maritime Tech", "Autonomous Shipping", "Port Technology", "Logistics"],
    industry: "Maritime",
    location: "Seattle, WA"
  },
  {
    name: "Nora Fitzgerald",
    email: "nora.f@pettech.com",
    bio: "Pet technology innovator building smart pet care products and veterinary telemedicine platforms.",
    skills: ["Pet Technology", "IoT", "Product Management", "Mobile Development", "Healthcare"],
    interests: ["Pet Tech", "Animal Welfare", "IoT", "Veterinary Technology"],
    industry: "Pet Technology",
    location: "Austin, TX"
  }
];

// Function to generate random embedding (3072 dimensions)
function generateRandomEmbedding() {
  const embedding = [];
  for (let i = 0; i < 3072; i++) {
    embedding.push(Math.random() * 2 - 1); // Random values between -1 and 1
  }
  return embedding;
}

// Function to create enriched versions
function enrichData(user) {
  return {
    ...user,
    password: 'password123', // Will be hashed
    enrichedBio: user.bio + ' Committed to continuous learning and collaboration.',
    enrichedSkills: [...user.skills, 'Leadership', 'Communication', 'Problem Solving'],
    linkedinURL: `https://linkedin.com/in/${user.name.toLowerCase().replace(' ', '')}`,
    embedding: generateRandomEmbedding()
  };
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    // Hash password for all users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Prepare users with enriched data
    console.log('📝 Preparing user data...');
    const usersToInsert = sampleUsers.map(user => {
      const enriched = enrichData(user);
      return {
        ...enriched,
        password: hashedPassword,
        email: enriched.email.toLowerCase()
      };
    });

    // Insert users
    console.log('💾 Inserting 50 sample users...');
    await User.insertMany(usersToInsert);
    
    console.log('✅ Successfully inserted 50 users!');
    console.log('\n📊 Sample User Credentials:');
    console.log('   Email: sarah.chen@techcorp.com');
    console.log('   Password: password123');
    console.log('\n   Email: m.rodriguez@fintech.io');
    console.log('   Password: password123');
    console.log('\n   (All users have password: password123)');
    console.log('\n🎉 Database seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit();
  }
}

// Run the seed function
seedDatabase();