/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock, 
} from 'lucide-react';
import { toast } from 'sonner';
import { getAttendanceTrends } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function AttendanceTrendsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAttendanceTrends(range);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch attendance trends:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load attendance trends');
    } finally {
      setLoading(false);
    }
  };

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Attendance data not available</p>
      </div>
    );
  }

  const summary = data.summary || {};
  const trends = data.trends || [];
 
  return (
    <div className="space-y-6">
      <Link
        href="/school/analytics"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Analytics
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Attendance Trends</h1>
          <p className="text-text-secondary">Daily attendance breakdown</p>
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {[
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
            { value: '90d', label: '90d' },
            { value: '1y', label: '1y' },
            { value: 'all', label: 'All' }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                range === opt.value
                  ? 'bg-akoma-green text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Records</p>
              <p className="text-2xl font-bold text-text">{summary.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Present</p>
              <p className="text-2xl font-bold text-green-600">{summary.present || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.late || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Absent</p>
              <p className="text-2xl font-bold text-red-600">{summary.absent || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Rate Banner */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-akoma-green" />
            <h2 className="text-lg font-semibold text-text">Overall Attendance Rate</h2>
          </div>
          <span className={`text-3xl font-bold ${getRateColor(summary.attendanceRate || 0)}`}>
            {summary.attendanceRate || 0}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(summary.attendanceRate || 0)} rounded-full transition-all`}
            style={{ width: `${summary.attendanceRate || 0}%` }}
          />
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <Calendar className="h-5 w-5 text-akoma-green" />
            Daily Breakdown
          </h2>
          <span className="text-xs text-text-secondary">
            {data.totalDays || 0} day{data.totalDays !== 1 ? 's' : ''} with data
          </span>
        </div>

        {trends.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No attendance data for this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trends.slice().reverse().map((day: any) => (
              <div key={day.date} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {day.total} record{day.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${getRateColor(day.rate)}`}>
                    {day.rate}%
                  </span>
                </div>

                {/* Stacked bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  {day.present > 0 && (
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${(day.present / day.total) * 100}%` }}
                      title={`Present: ${day.present}`}
                    />
                  )}
                  {day.late > 0 && (
                    <div
                      className="bg-yellow-500 h-full"
                      style={{ width: `${(day.late / day.total) * 100}%` }}
                      title={`Late: ${day.late}`}
                    />
                  )}
                  {day.absent > 0 && (
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${(day.absent / day.total) * 100}%` }}
                      title={`Absent: ${day.absent}`}
                    />
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-text-secondary">{day.present} present</span>
                  </span>
                  {day.late > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-text-secondary">{day.late} late</span>
                    </span>
                  )}
                  {day.absent > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-text-secondary">{day.absent} absent</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}