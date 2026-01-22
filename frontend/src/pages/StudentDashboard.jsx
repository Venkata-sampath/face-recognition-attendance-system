import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { AttendanceStats } from '../components/AttendanceStats';
import { attendanceAPI } from '../api/api';
import { toast } from 'react-toastify';

export const StudentDashboard = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, today, week, month

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const data = await attendanceAPI.getMyAttendance();
      setRecords(data.attendance || []);
      filterRecords(data.attendance || [], 'all');
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = (allRecords, type) => {
    const today = new Date();
    let filtered = allRecords;

    switch (type) {
      case 'today':
        const todayStr = today.getFullYear() + '-' +
                        String(today.getMonth() + 1).padStart(2, '0') + '-' +
                        String(today.getDate()).padStart(2, '0');
        console.log('Filtering for today:', todayStr, 'Records:', allRecords);
        filtered = allRecords.filter(r => r.date === todayStr);
        console.log('Filtered records:', filtered);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = allRecords.filter(r => new Date(r.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = allRecords.filter(r => new Date(r.date) >= monthAgo);
        break;
      default:
        filtered = allRecords;
    }

    setFilteredRecords(filtered);
    setFilterType(type);
  };

  const getStatusBadge = (status) => {
    return status === 'present' ? (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ Present
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✗ Absent
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your attendance and view detailed records</p>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <AttendanceStats />
        </div>

        {/* Records Section */}
        <div className="bg-white rounded-lg shadow">
          {/* Filter Buttons */}
          <div className="border-b px-6 py-4 flex flex-wrap gap-2">
            <button
              onClick={() => filterRecords(records, 'all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => filterRecords(records, 'today')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => filterRecords(records, 'week')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => filterRecords(records, 'month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Records List */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecords.map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">{record.date}</p>
                      </div>
                    </div>
                    <div>{getStatusBadge(record.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
