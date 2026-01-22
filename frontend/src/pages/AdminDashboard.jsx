import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Navbar } from '../components/Navbar';
import { StudentRegistrationModal } from '../components/StudentRegistrationModal';
import { UserDetailsModal } from '../components/UserDetailsModal';
import { attendanceAPI, userAPI } from '../api/api';
import { toast } from 'react-toastify';

export const AdminDashboard = () => {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0
  });
  const [allUsers, setAllUsers] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, attendance, registered
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both users and attendance data
      const [attendanceResponse, usersResponse] = await Promise.all([
        attendanceAPI.getAllAttendance(),
        userAPI.getAllUsers()
      ]);
      
      const records = attendanceResponse.attendance || [];
      const users = usersResponse.users || [];
      
      setAllAttendance(records);
      setAllUsers(users);
      processData(records, users);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processData = (records, users) => {
    // Create user map with attendance data
    const userMap = {};
    
    // Get today's date in local timezone (YYYY-MM-DD)
    const todayDate = new Date();
    const today = todayDate.getFullYear() + '-' + 
                  String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(todayDate.getDate()).padStart(2, '0');

    // Initialize with user data
    users.forEach(user => {
      userMap[user.user_id] = {
        ...user,
        totalDays: 0,
        presentDays: 0
      };
    });

    // Process attendance records
    records.forEach(record => {
      if (userMap[record.user_id]) {
        userMap[record.user_id].totalDays++;
        if (record.status === 'present') {
          userMap[record.user_id].presentDays++;
        }
      }
    });

    const usersList = Object.values(userMap).map(user => ({
      ...user,
      attendance: user.totalDays > 0 
        ? Math.round((user.presentDays / user.totalDays) * 100)
        : 0
    }));

    // Calculate today's stats - filter by today's date
    const todayRecords = records.filter(r => r.date === today);
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    // Absent today = total students - present students (not just records that exist)
    const absentToday = usersList.length - presentToday;

    console.log('Today:', today, 'Records for today:', todayRecords.length, 'Present:', presentToday, 'Absent:', absentToday);

    setStats({
      totalStudents: usersList.length,
      presentToday,
      absentToday
    });

    // Process chart data (last 30 days)
    const dateMap = {};
    records.forEach(record => {
      if (!dateMap[record.date]) {
        dateMap[record.date] = { present: 0, absent: 0, rawDate: record.date };
      }
      if (record.status === 'present') {
        dateMap[record.date].present++;
      } else {
        dateMap[record.date].absent++;
      }
    });

    const chartArray = Object.entries(dateMap)
      .map(([date, { present, absent, rawDate }]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present,
        absent,
        rawDate
      }))
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
      .slice(-30)
      .map(({ rawDate, ...rest }) => rest);

    setChartData(chartArray);
    filterAndSortStudents(usersList, searchTerm, sortBy);
  };

  const filterAndSortStudents = (students, search, sort) => {
    let filtered = students;

    if (search.trim()) {
      filtered = students.filter(s =>
        s.user_id.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    let sorted = filtered;
    if (sort === 'name') {
      sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'attendance') {
      sorted = [...filtered].sort((a, b) => b.attendance - a.attendance);
    } else if (sort === 'registered') {
      sorted = [...filtered].sort((a, b) => {
        const aReg = a.face_registered_at ? 1 : 0;
        const bReg = b.face_registered_at ? 1 : 0;
        return bReg - aReg;
      });
    }

    setFilteredUsers(sorted);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterAndSortStudents(allUsers, value, sortBy);
  };

  const handleSort = (value) => {
    setSortBy(value);
    filterAndSortStudents(allUsers, searchTerm, value);
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getAttendanceBadge = (percentage) => {
    if (percentage >= 80) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Good</span>;
    } else if (percentage >= 60) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⚠ Average</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">✗ Poor</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">View attendance analytics and manage students</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              title="Refresh dashboard"
            >
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => {
                console.log('Register button clicked');
                setShowRegistrationModal(true);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              👤 Register Student
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-gray-500 text-sm font-medium">Total Students</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-gray-500 text-sm font-medium">Present Today</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.presentToday}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-gray-500 text-sm font-medium">Absent Today</div>
            <div className="text-3xl font-bold text-red-600 mt-2">{stats.absentToday}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Trend (Last 30 Days)</h3>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Attendance Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Distribution (Today)</h3>
            {stats.totalStudents === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">No students registered yet</div>
            ) : stats.presentToday === 0 && stats.absentToday === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">No attendance records for today</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: stats.presentToday },
                      { name: 'Absent', value: stats.absentToday }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Student Details Overview</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, ID, or email..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="attendance">Sort by Attendance %</option>
                <option value="registered">Sort by Face Registration</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="divide-y">
            {loading ? (
              <div className="p-6 animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            ) : (
              filteredUsers.map((student, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">ID: {student.user_id} | {student.department}</p>
                    <p className="text-xs text-gray-400">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {student.face_registered_at ? (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                        <p className="text-sm text-gray-600">
                          {student.totalDays > 0 
                            ? `${student.presentDays}/${student.totalDays} days` 
                            : 'No attendance'}
                        </p>
                      </div>
                      <p className="text-lg font-bold" style={{ color: getAttendanceColor(student.attendance) }}>
                        {student.attendance}%
                      </p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${student.attendance}%`,
                            backgroundColor: getAttendanceColor(student.attendance)
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAttendanceBadge(student.attendance)}
                      <button
                        onClick={() => {
                          setSelectedUser(student);
                          setShowUserDetails(true);
                        }}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      <StudentRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={fetchData}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        user={selectedUser}
        onClose={() => setShowUserDetails(false)}
      />
    </div>
  );
};
