# RESTful API Project
 
A modern TypeScript-based backend project designed for scalable web application development. It emphasizes environment-specific configurations, testing, and process management.​

---
Key Features
Written in TypeScript with support for multiple environments (development, testing, production).

Unit testing enabled via Jest.

Process management using PM2 with a dedicated ecosystem.config.js file.

Environment-specific configuration files (.env, .env_dev, .env_prod, .env_test).

Organized project structure with src for source code and public/uploads for static assets.​

---
Prerequisites
Node.js (version 14 or higher)

npm​

---
Installation & Running
Clone the repository:​
GitHub

bash
Copy
Edit
git clone https://github.com/hod25/Internet-Project.git
cd Internet-Project
Install dependencies:​

bash
Copy
Edit
npm install
Set up the appropriate environment configuration file (.env_dev, .env_prod, etc.) as needed.​

To start the development server:​

bash
Copy
Edit
npm run dev
To run tests:​
GitHub

bash
Copy
Edit
npm test
To run the project in production using PM2:​

bash
Copy
Edit
pm2 start ecosystem.config.js

----
Project Structure
bash
Copy
Edit
Internet-Project/
├── .env*                 # Environment configuration files
├── ecosystem.config.js   # PM2 configuration
├── jest.config.ts        # Jest configuration
├── package.json          # Project metadata and scripts
├── src/                  # Source code
├── public/uploads/       # Static files
└── README.md             # Project documentation

---
Contributing
Contributions, bug fixes, and enhancements are welcome. Please open an issue or submit a pull request with your proposed changes.​
GitHub

