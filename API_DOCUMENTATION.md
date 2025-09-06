# College Search API Documentation

A REST API for students to search colleges based on their 10th-grade marks and manage their academic profiles.

## Features

- **Student Authentication**: Register, login, and manage profiles
- **Mark Management**: Add and manage academic marks
- **College Search**: Search colleges based on marks and GPA
- **Recommendations**: Get personalized college recommendations
- **Course Preferences**: Manage preferred courses

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d
```

3. **Start MongoDB**
Make sure MongoDB is running on your system.

4. **Seed Sample Data**
```bash
node src/seedData.js
```

5. **Start the Server**
```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register Student
- **POST** `/api/users/register`
- **Body**:
```json
{
  "name": "John Doe",
  "email": "student@example.com",
  "phone": "+977-9841000000",
  "password": "password123",
  "totalMarks": 380,
  "gpa": 3.2
}
```

#### Login
- **POST** `/api/users/login`
- **Body**:
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

#### Logout
- **POST** `/api/users/logout`
- **Headers**: `Authorization: Bearer <token>`

### Student Profile

#### Get Current User
- **GET** `/api/users/current-user`
- **Headers**: `Authorization: Bearer <token>`

#### Update Profile
- **PATCH** `/api/users/update-profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Updated Name",
  "phone": "+977-9841111111",
  "totalMarks": 400,
  "gpa": 3.5
}
```

### Marks Management

#### Get My Marks
- **GET** `/api/marks/my-marks`
- **Headers**: `Authorization: Bearer <token>`

#### Add My Mark
- **POST** `/api/marks/add-my-mark`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "subject": "Physics",
  "grade": "B+",
  "gradePoint": 3.4
}
```

#### Update My Mark
- **PUT** `/api/marks/update-my-mark/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "subject": "Physics",
  "grade": "A-",
  "gradePoint": 3.6
}
```

#### Calculate GPA
- **GET** `/api/marks/calculate-gpa`
- **Headers**: `Authorization: Bearer <token>`

#### Get Analytics
- **GET** `/api/marks/analytics`
- **Headers**: `Authorization: Bearer <token>`

### College Search (Main Feature)

#### Search Colleges by Marks
- **GET** `/api/colleges/search/by-marks`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters** (optional):
  - `totalMarks`: Student's total marks
  - `gpa`: Student's GPA
  - `subjects`: JSON string of subject marks

**Example**: `/api/colleges/search/by-marks?totalMarks=380&gpa=3.2`

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "colleges": [
      {
        "_id": "collegeId",
        "name": "Trinity International College",
        "location": "Dillibazar, Kathmandu",
        "contact": {
          "phone": "+977-1-4444333",
          "email": "info@trinity.edu.np"
        },
        "eligibleCourses": [
          {
            "course": {
              "_id": "courseId",
              "name": "Science"
            },
            "minimumGPA": 3.2,
            "matchPercentage": 100
          }
        ],
        "matchPercentage": 100
      }
    ],
    "searchCriteria": {
      "totalMarks": 380,
      "gpa": 3.2,
      "subjectsCount": 5
    },
    "totalEligible": 3
  },
  "message": "Eligible colleges found successfully"
}
```

#### Get Personalized Recommendations
- **GET** `/api/colleges/recommendations`
- **Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "colleges": [
      {
        "name": "Kathmandu Model College",
        "location": "Bagbazar, Kathmandu",
        "eligibleCourses": [...],
        "recommendationScore": 85,
        "hasPreferredCourse": true,
        "isPreferredCollege": false
      }
    ],
    "studentProfile": {
      "gpa": 3.2,
      "totalMarks": 380,
      "preferredCourses": 2,
      "preferredColleges": 0
    }
  }
}
```

#### Get All Colleges
- **GET** `/api/colleges`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### Search by Location
- **GET** `/api/colleges/search/location?location=Kathmandu`

### Course Management

#### Get All Courses
- **GET** `/api/courses`

#### Add Course to Preferences
- **POST** `/api/courses/preferences/add`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "courseId": "courseObjectId"
}
```

#### Get Preferred Courses
- **GET** `/api/courses/preferences`
- **Headers**: `Authorization: Bearer <token>`

## Usage Examples

### 1. Student Registration and Login
```bash
# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "totalMarks": 420,
    "gpa": 3.8
  }'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

### 2. Search Colleges Based on Marks
```bash
# Using student's own marks (after login)
curl -X GET http://localhost:5000/api/colleges/search/by-marks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Using custom marks
curl -X GET "http://localhost:5000/api/colleges/search/by-marks?totalMarks=400&gpa=3.5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Recommendations
```bash
curl -X GET http://localhost:5000/api/colleges/recommendations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Sample Data

The seeder creates:
- **5 courses**: Science, Management, Humanities, Computer Science, Commerce
- **5 colleges**: Trinity International, Kathmandu Model, Global College International, National College, St. Xavier's
- **1 sample student**: 
  - Email: `student@example.com`
  - Password: `password123`
  - GPA: 3.2
  - Total Marks: 380

## How the Search Algorithm Works

1. **GPA Matching**: Compares student's GPA with college minimum requirements
2. **Subject Requirements**: Checks if student meets subject-specific grade requirements
3. **Match Percentage**: Calculates compatibility percentage based on GPA ratio
4. **Recommendations**: Uses preference-based scoring system:
   - 60% weight for academic match
   - 25% bonus for preferred courses
   - 15% bonus for preferred colleges

## Error Responses

All endpoints return errors in this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false
}
```

Common error codes:
- `400`: Bad Request (missing/invalid data)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## Testing

Use tools like Postman, Insomnia, or curl to test the endpoints. Start by:

1. Register a new student or use the sample student
2. Login to get an access token
3. Test the college search endpoints
4. Add marks and see how it affects recommendations

The main feature is the `/api/colleges/search/by-marks` endpoint which allows students to find colleges they're eligible for based on their 10th-grade marks and GPA.
