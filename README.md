
# 📚 LibraryIntelligence

<div align="center">

![Library Management System](https://img.shields.io/badge/Library-Management%20System-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express-4.18+-000000?style=for-the-badge&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3.0+-003B57?style=for-the-badge&logo=sqlite)

*A comprehensive digital library management solution designed for modern libraries and educational institutions*

[🚀 Live Demo](#-getting-started) • [📖 Documentation](#-features) • [🛠️ Installation](#-installation) • [💡 Contributing](#-contributing)

</div>

---

## ✨ Overview

LibraryIntelligence is a full-stack library management system that streamlines the entire library ecosystem. From book cataloging to member management, from borrowing analytics to membership applications - it's your all-in-one solution for modern library administration.

### 🎯 Why LibraryIntelligence?

- **🔄 Real-time Synchronization**: Seamless data sync between local storage and database
- **📊 Advanced Analytics**: Comprehensive dashboards with borrowing trends and statistics
- **🌙 Modern UI/UX**: Beautiful dark/light mode with responsive design
- **🖥️ Multi-Platform**: Web application with Electron desktop support
- **📱 Mobile Friendly**: Fully responsive design for all devices
- **🔒 Secure**: Built-in data validation and backup systems

---

## 🚀 Features

### 📖 Book Management
- **Comprehensive Catalog**: Add, edit, and organize books with detailed metadata
- **Smart Search**: Advanced filtering by genre, author, publisher, and availability
- **Cover Management**: Upload and manage book cover images
- **Inventory Tracking**: Real-time availability and copy management
- **Bulk Import**: CSV import functionality for large collections

### 👥 Member Management
- **Member Profiles**: Detailed borrower information and categorization
- **Membership Applications**: Streamlined application and approval process
- **Activity Tracking**: Complete borrowing history and member analytics
- **Church Integration**: Special fields for religious institution members

### 📊 Analytics & Reporting
- **Interactive Dashboards**: Beautiful charts and statistics
- **Borrowing Trends**: Track popular books and reading patterns
- **Export Capabilities**: PDF and CSV export for reports
- **Real-time Metrics**: Live statistics and performance indicators

### 👨‍💼 Staff Management
- **Librarian Profiles**: Manage library staff information
- **Role-based Access**: Different permission levels for staff
- **Shift Management**: Track work schedules and departments
- **Activity Logs**: Complete audit trail of staff actions

### 🔄 Borrowing System
- **Easy Check-in/out**: Streamlined borrowing process
- **Due Date Management**: Automatic due date calculations
- **Return Tracking**: Complete borrowing lifecycle management
- **Overdue Notifications**: Automated reminder system

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful component library
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **TypeScript** - Full-stack type safety

### Desktop
- **Electron** - Cross-platform desktop apps
- **Native Integration** - OS-specific features

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Parallel script execution

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/LibraryIntelligence.git
   cd LibraryIntelligence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Web App: [http://localhost:5173](http://localhost:5173)
   - API Server: [http://localhost:5001](http://localhost:5001)

### 🖥️ Desktop Application

To run the desktop version:

```bash
npm run electron-dev
```

### 🏗️ Production Build

```bash
npm run build
```

---

## 📊 Project Structure

```
LibraryIntelligence/
├── 📁 client/                 # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 pages/          # Application pages
│   │   ├── 📁 lib/            # Utilities and helpers
│   │   └── 📁 assets/         # Static assets
├── 📁 server/                 # Express backend
│   ├── 📁 routes/             # API routes
│   ├── 📁 db/                 # Database configuration
│   └── 📁 utils/              # Server utilities
├── 📁 electron/               # Desktop app configuration
├── 📁 shared/                 # Shared types and schemas
└── 📄 README.md              # You are here!
```

---

## 🎨 Screenshots

<div align="center">

### 📊 Dashboard
*Beautiful analytics and real-time statistics*

### 📚 Book Management
*Comprehensive book catalog with advanced search*

### 👥 Member Management
*Complete member profiles and activity tracking*

### 📱 Mobile Responsive
*Fully optimized for mobile devices*

</div>

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=./library.db

# Server
PORT=5001
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:5001
```

### Database Setup
The application automatically creates and migrates the SQLite database on first run. Sample data is included for development.

---

## 📈 Performance Features

- **⚡ Fast Loading**: Optimized bundle splitting and lazy loading
- **💾 Offline Support**: Local storage fallback for network issues
- **🔄 Auto Backup**: Hourly automated database backups
- **📱 PWA Ready**: Progressive Web App capabilities
- **🗜️ Optimized Assets**: Compressed images and efficient caching

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
- Use the GitHub issue tracker
- Include detailed reproduction steps
- Provide system information

### ✨ Feature Requests
- Describe the feature clearly
- Explain the use case
- Consider backward compatibility

### 🔧 Development
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### 📝 Code Style
- Follow TypeScript best practices
- Use meaningful variable names
- Add comments for complex logic
- Ensure responsive design

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

Need help? We're here for you!

- **📚 Documentation**: Check our [wiki](../../wiki)
- **💬 Discussions**: Join our [community discussions](../../discussions)
- **🐛 Issues**: Report bugs in our [issue tracker](../../issues)
---

## 🙏 Acknowledgments

- Built with ❤️ for libraries and educational institutions
- Thanks to all contributors and the open-source community
- Special thanks to [Shadcn](https://ui.shadcn.com/) for the amazing component library
- Icons by [Lucide](https://lucide.dev/)

---

<div align="center">

**Made with ❤️ by [minarob23](https://github.com/minarob23)**

⭐ **Star this repo if you found it helpful!** ⭐

</div>
