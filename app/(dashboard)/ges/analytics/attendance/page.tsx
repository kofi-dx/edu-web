/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getNationalAttendanceTrends, type AttendanceTrend } from '@/lib/services/gesService';
import { Button } from '@/components/ui/button';

// ============================================
// COMPONENT
// ============================================

export default function NationalAttendancePage() {
  const [data, setData] = useState<AttendanceTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getNationalAttendanceTrends(range);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch attendance trends:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load attendance data');
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

  // Max rate for chart scaling
  const maxRate = data?.trends && data.trends.length > 0
    ? Math.max(...data.trends.map(t => t.rate))
    : 100;

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
        <TrendingUp className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Attendance data not available</p>
        <Link href="/ges">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const summary = data.summary || {};
  const trends = data.trends || [];

  return (
    <div className="space-y-6">
      <Link
        href="/ges"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">National Attendance Trends</h1>
          <p className="text-text-secondary">
            Attendance across all schools in Ghana
          </p>
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {[
            { value: '7d', label: '7 days' },
            { value: '30d', label: '30 days' },
            { value: '90d', label: '90 days' },
            { value: '1y', label: '1 year' },
            { value: 'all', label: 'All time' }
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

      {/* ============================================
          SUMMARY CARDS
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-akoma-green" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{summary.total?.toLocaleString() || 0}</p>
          <p className="text-xs text-text-secondary">Total Records</p>
          <p className="text-xs text-text-secondary mt-1">
            {data.totalDays} day{data.totalDays !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {summary.present?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-secondary">Present</p>
          <p className="text-xs text-text-secondary mt-1">
            {summary.total > 0
              ? `${Math.round((summary.present / summary.total) * 100)}%`
              : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {summary.late?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-secondary">Late</p>
          <p className="text-xs text-text-secondary mt-1">
            {summary.total > 0
              ? `${Math.round((summary.late / summary.total) * 100)}%`
              : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.absent?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-secondary">Absent</p>
          <p className="text-xs text-text-secondary mt-1">
            {summary.total > 0
              ? `${Math.round((summary.absent / summary.total) * 100)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* ============================================
          OVERALL RATE BANNER
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Overall Attendance Rate</h2>
            </div>
            <p className="text-white/80 text-sm">
              {summary.present?.toLocaleString() || 0} present + {summary.late?.toLocaleString() || 0} late
              out of {summary.total?.toLocaleString() || 0} records
            </p>
          </div>
          <div className="text-5xl font-bold">
            {summary.attendanceRate || 0}%
          </div>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${summary.attendanceRate || 0}%` }}
          />
        </div>
      </div>

      {/* ============================================
          DAILY BREAKDOWN
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-akoma-green" />
            Daily Breakdown
          </h2>
          <span className="text-xs text-text-secondary">
            {trends.length} day{trends.length !== 1 ? 's' : ''} with data
          </span>
        </div>

        {trends.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">
              No attendance data for this period
            </p>
          </div>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="mb-6">
              <div className="flex items-end gap-1 h-40 bg-gray-50 rounded-lg p-3 overflow-x-auto">
                {trends.slice(-30).map((day) => {
                  const barHeight = (day.rate / maxRate) * 100;
                  const barColor = getBarColor(day.rate);

                  return (
                    <div
                      key={day.date}
                      className="flex-1 min-w-6 flex flex-col items-center justify-end gap-1 h-full group"
                      title={`${day.date}: ${day.rate}% (${day.present} present)`}
                    >
                      <div className="text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.rate}%
                      </div>
                      <div
                        className={`w-full ${barColor} rounded-t transition-all hover:opacity-80`}
                        style={{ height: `${Math.max(barHeight, 2)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
                <span>Oldest</span>
                <span>Most recent</span>
              </div>
            </div>

            {/* Detailed List (reverse order) */}
            <div className="space-y-2">
              {trends.slice().reverse().map((day) => (
                <div
                  key={day.date}
                  className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text">
                        {new Date(day.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
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
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex mb-2">
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
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-text-secondary">
                        {day.present} present
                      </span>
                    </span>
                    {day.late > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-text-secondary">
                          {day.late} late
                        </span>
                      </span>
                    )}
                    {day.absent > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-text-secondary">
                          {day.absent} absent
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ============================================
          INSIGHTS
          ============================================ */}
      {trends.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-akoma-green" />
            Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-600 mb-1">Best Day</p>
              <p className="text-sm font-bold text-green-800">
                {trends.reduce((best, day) => day.rate > best.rate ? day : best, trends[0]).date}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {Math.max(...trends.map(t => t.rate))}%
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs text-red-600 mb-1">Worst Day</p>
              <p className="text-sm font-bold text-red-800">
                {trends.reduce((worst, day) => day.rate < worst.rate ? day : worst, trends[0]).date}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {Math.min(...trends.map(t => t.rate))}%
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600 mb-1">Average Rate</p>
              <p className="text-sm font-bold text-blue-800">
                Across {trends.length} days
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(trends.reduce((sum, t) => sum + t.rate, 0) / trends.length)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}