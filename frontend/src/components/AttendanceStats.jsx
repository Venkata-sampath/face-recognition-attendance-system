import React, { useEffect, useState } from 'react';
import { attendanceAPI } from '../api/api';

export const AttendanceStats = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await attendanceAPI.getMySummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch attendance summary:', err);
      setError('Failed to load attendance summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (!summary) {
    return <div className="text-gray-600 text-center py-4">No data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Days */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="text-gray-500 text-sm font-medium">Total Days</div>
        <div className="text-3xl font-bold text-gray-900 mt-2">{summary.total_days}</div>
        <p className="text-gray-600 text-xs mt-2">Current month</p>
      </div>

      {/* Present */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="text-gray-500 text-sm font-medium">Present</div>
        <div className="text-3xl font-bold text-green-600 mt-2">{summary.present_days}</div>
        <p className="text-gray-600 text-xs mt-2">Days present</p>
      </div>

      {/* Absent */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="text-gray-500 text-sm font-medium">Absent</div>
        <div className="text-3xl font-bold text-red-600 mt-2">{summary.absent_days}</div>
        <p className="text-gray-600 text-xs mt-2">Days absent</p>
      </div>

      {/* Percentage */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <div className="text-gray-500 text-sm font-medium">Attendance %</div>
        <div className="text-3xl font-bold text-purple-600 mt-2">{summary.attendance_percentage}%</div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${summary.attendance_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
