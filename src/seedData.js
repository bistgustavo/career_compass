import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "./models/course.model.js";
import College from "./models/college.model.js";
import User from "./models/user.model.js";
import Mark from "./models/mark.model.js";
import { DB_NAME } from "./constants.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME
    });
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    console.log(`Database: ${connectionInstance.connection.db.databaseName}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

const sampleCourses = [
  {
    name: "Science",
    description: "Science stream with Physics, Chemistry, Biology/Mathematics",
    durationYears: 2,
  },
  {
    name: "Management",
    description: "Management and Business Studies",
    durationYears: 2,
  },
  {
    name: "Humanities",
    description: "Arts and Humanities with Social Sciences",
    durationYears: 2,
  },
  {
    name: "Computer Science",
    description: "Computer Science and Information Technology",
    durationYears: 2,
  },
  {
    name: "Commerce",
    description: "Commerce and Accounting",
    durationYears: 2,
  },
];

const seedCourses = async () => {
  try {
    await Course.deleteMany({});
    const courses = await Course.insertMany(sampleCourses);
    console.log("Sample courses created:", courses.length);
    return courses;
  } catch (error) {
    console.error("Error seeding courses:", error);
    return [];
  }
};

const seedColleges = async (courses) => {
  try {
    const sampleColleges = [
      {
        name: "Trinity International College",
        location: "Dillibazar, Kathmandu",
        contact: {
          phone: "+977-1-4444333",
          email: "info@trinity.edu.np",
        },
        offeredCourses: [
          {
            course: courses[0]._id, // Science
            minimumGPA: 3.2,
            subjectRequirements: [
              {
                subject: "Mathematics",
                minGrade: "B",
                minGradePoint: 3.0,
              },
              {
                subject: "Science",
                minGrade: "B",
                minGradePoint: 3.0,
              },
              {
                subject: "English",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
            ],
          },
          {
            course: courses[1]._id, // Management
            minimumGPA: 2.8,
            subjectRequirements: [
              {
                subject: "Mathematics",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
              {
                subject: "English",
                minGrade: "B",
                minGradePoint: 3.0,
              },
            ],
          },
        ],
      },
      {
        name: "Kathmandu Model College",
        location: "Bagbazar, Kathmandu",
        contact: {
          phone: "+977-1-4444555",
          email: "info@kmc.edu.np",
        },
        offeredCourses: [
          {
            course: courses[0]._id, // Science
            minimumGPA: 3.0,
            subjectRequirements: [
              {
                subject: "Mathematics",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
              {
                subject: "Science",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
            ],
          },
          {
            course: courses[1]._id, // Management
            minimumGPA: 2.5,
            subjectRequirements: [
              {
                subject: "English",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
            ],
          },
          {
            course: courses[3]._id, // Computer Science
            minimumGPA: 3.0,
            subjectRequirements: [
              {
                subject: "Mathematics",
                minGrade: "B",
                minGradePoint: 3.0,
              },
              {
                subject: "Science",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
            ],
          },
        ],
      },
      {
        name: "Global College International",
        location: "Kalanki, Kathmandu",
        contact: {
          phone: "+977-1-4444777",
          email: "info@gci.edu.np",
        },
        offeredCourses: [
          {
            course: courses[1]._id, // Management
            minimumGPA: 3.0,
            subjectRequirements: [
              {
                subject: "English",
                minGrade: "B",
                minGradePoint: 3.0,
              },
              {
                subject: "Mathematics",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
            ],
          },
          {
            course: courses[4]._id, // Commerce
            minimumGPA: 2.8,
            subjectRequirements: [
              {
                subject: "Mathematics",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
            ],
          },
        ],
      },
      {
        name: "National College",
        location: "Lagankhel, Lalitpur",
        contact: {
          phone: "+977-1-5544333",
          email: "info@nationalcollege.edu.np",
        },
        offeredCourses: [
          {
            course: courses[2]._id, // Humanities
            minimumGPA: 2.5,
            subjectRequirements: [
              {
                subject: "English",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
              {
                subject: "Social Studies",
                minGrade: "C",
                minGradePoint: 2.0,
              },
            ],
          },
          {
            course: courses[1]._id, // Management
            minimumGPA: 2.8,
            subjectRequirements: [
              {
                subject: "English",
                minGrade: "C+",
                minGradePoint: 2.4,
              },
            ],
          },
        ],
      },
      {
        name: "St. Xavier's College",
        location: "Maitighar, Kathmandu",
        contact: {
          phone: "+977-1-4444222",
          email: "info@sxc.edu.np",
        },
        offeredCourses: [
          {
            course: courses[0]._id, // Science
            minimumGPA: 3.5,
            subjectRequirements: [
              {
                subject: "Mathematics",
                minGrade: "B+",
                minGradePoint: 3.4,
              },
              {
                subject: "Science",
                minGrade: "B+",
                minGradePoint: 3.4,
              },
              {
                subject: "English",
                minGrade: "B",
                minGradePoint: 3.0,
              },
            ],
          },
          {
            course: courses[1]._id, // Management
            minimumGPA: 3.2,
            subjectRequirements: [
              {
                subject: "Mathematics",
                minGrade: "B",
                minGradePoint: 3.0,
              },
              {
                subject: "English",
                minGrade: "B+",
                minGradePoint: 3.4,
              },
            ],
          },
        ],
      },
    ];

    await College.deleteMany({});
    const colleges = await College.insertMany(sampleColleges);
    console.log("Sample colleges created:", colleges.length);
    return colleges;
  } catch (error) {
    console.error("Error seeding colleges:", error);
    return [];
  }
};

const seedSampleStudent = async (courses) => {
  try {
    // Create a sample student
    await User.deleteMany({ email: "student@example.com" });
    
    const student = await User.create({
      name: "John Doe",
      email: "student@example.com",
      phone: "+977-9841000000",
      password: "password123",
      totalMarks: 380,
      gpa: 3.2,
      role: "student",
    });

    // Create sample marks for the student
    const sampleMarks = [
      {
        student: student._id,
        subject: "Mathematics",
        grade: "B",
        gradePoint: 3.0,
      },
      {
        student: student._id,
        subject: "Science",
        grade: "B+",
        gradePoint: 3.4,
      },
      {
        student: student._id,
        subject: "English",
        grade: "A-",
        gradePoint: 3.6,
      },
      {
        student: student._id,
        subject: "Social Studies",
        grade: "B-",
        gradePoint: 2.8,
      },
      {
        student: student._id,
        subject: "Nepali",
        grade: "B+",
        gradePoint: 3.4,
      },
    ];

    const marks = await Mark.insertMany(sampleMarks);
    
    // Update student with marks
    student.marks = marks.map(mark => mark._id);
    student.preferences.courses = [courses[0]._id, courses[3]._id]; // Science and Computer Science
    await student.save();

    console.log("Sample student created with marks");
    console.log("Email: student@example.com");
    console.log("Password: password123");
    
  } catch (error) {
    console.error("Error seeding sample student:", error);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    console.log("🌱 Starting to seed data...");
    
    const courses = await seedCourses();
    if (courses.length === 0) {
      console.error("Failed to seed courses. Exiting...");
      process.exit(1);
    }
    
    await seedColleges(courses);
    await seedSampleStudent(courses);
    
    console.log("✅ All sample data seeded successfully!");
    console.log("\n🎓 You can now test the college search functionality!");
    console.log("\n📚 Available endpoints:");
    console.log("- POST /api/users/login (Email: student@example.com, Password: password123)");
    console.log("- GET /api/colleges/search/by-marks (requires authentication)");
    console.log("- GET /api/colleges/recommendations (requires authentication)");
    console.log("- GET /api/colleges (public - view all colleges)");
    console.log("- GET /api/marks/my-marks (requires authentication)");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

// Always run seeding when this file is executed
seedData();

export { seedData };
