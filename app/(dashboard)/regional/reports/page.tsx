/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  TrendingUp,
  ClipboardList,
  Landmark,
  Building2,
  BarChart3, 
  Sparkles,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getRegionalOverview,
  getDistrictsInRegion,
  getSchoolsInRegion,
  getRegionalAttendanceTrends,
  getRegionalAssessmentPerformance,
  type RegionalOverview,
  type DistrictStat
} from '@/lib/services/regionalService';

// ============================================
// REPORT TEMPLATES
// ============================================

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  formats: ('csv' | 'pdf')[];
  category: 'analytics' | 'geography';
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'regional-overview',
    title: 'Regional Overview Report',
    description: 'Complete snapshot of schools, students, teachers, and performance in your region',
    icon: BarChart3,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    formats: ['csv', 'pdf'],
    category: 'analytics',
  },
  {
    id: 'district-performance',
    title: 'District Performance Report',
    description: 'Performance metrics breakdown by all districts in your region',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    formats: ['csv', 'pdf'],
    category: 'analytics',
  },
  {
    id: 'attendance-trends',
    title: 'Attendance Trends Report',
    description: 'Daily attendance rates and patterns across your region',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-100',
    formats: ['csv', 'pdf'],
    category: 'analytics',
  },
  {
    id: 'assessment-performance',
    title: 'Assessment Performance Report',
    description: 'Subject-by-subject pass rates and average scores in your region',
    icon: ClipboardList,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    formats: ['csv', 'pdf'],
    category: 'analytics',
  },
  {
    id: 'school-directory',
    title: 'School Directory',
    description: 'Complete list of all schools in your region with contact info',
    icon: Landmark,
    color: 'text-red-600',
    bg: 'bg-red-100',
    formats: ['csv'],
    category: 'geography',
  },
];

// ============================================
// COMPONENT
// ============================================

export default function RegionalReportsPage() {
  const [overview, setOverview] = useState<RegionalOverview | null>(null);
  const [districts, setDistricts] = useState<DistrictStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchSnapshot();
  }, [range]);

  const fetchSnapshot = async () => {
    setLoading(true);
    try {
      const [overviewData, districtsData] = await Promise.all([
        getRegionalOverview(range),
        getDistrictsInRegion(range),
      ]);
      setOverview(overviewData);
      setDistricts(districtsData);
    } catch (error: any) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CSV GENERATION
  // ============================================

  const downloadCSV = (filename: string, rows: string[][]) => {
    const csv = rows.map(row =>
      row.map(cell => {
        const str = String(cell ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReport = async (reportId: string, format: 'csv' | 'pdf') => {
    if (format === 'pdf') {
      toast.info('PDF export coming soon. Downloading CSV for now.');
    }

    setGenerating(`${reportId}-${format}`);
    try {
      let rows: string[][] = [];

      switch (reportId) {
        case 'regional-overview':
          if (!overview) throw new Error('Data not ready');
          rows = [
            ['Metric', 'Value'],
            ['Region', overview.region.name],
            ['Range', range],
            ['Total Schools', String(overview.schools.total)],
            ['Public Schools', String(overview.schools.public)],
            ['Private Schools', String(overview.schools.private)],
            ['Total Districts', String(overview.geography.districts)],
            ['Total Students', String(overview.students.total)],
            ['Total Teachers', String(overview.teachers.total)],
            ['Total Classes', String(overview.classes.total)],
            ['Attendance Records', String(overview.attendance.total)],
            ['Attendance Rate %', String(overview.attendance.rate)],
            ['Total Assessment Attempts', String(overview.assessments.totalAttempts)],
            ['Assessment Pass Rate %', String(overview.assessments.passRate)],
            ['Average Score %', String(overview.assessments.averageScore)],
          ];
          downloadCSV(`regional-overview-${overview.region.name}`, rows);
          break;

        case 'district-performance':
          if (!districts) throw new Error('Data not ready');
          rows = [
            [
              'District',
              'Schools',
              'Public',
              'Private',
              'Students',
              'Teachers',
              'Student:Teacher Ratio',
              'Attendance %',
              'Assessment Attempts',
              'Pass Rate %',
              'Average Score %'
            ],
            ...districts.map(d => [
              d.district,
              String(d.schools),
              String(d.publicSchools),
              String(d.privateSchools),
              String(d.students),
              String(d.teachers),
              `1:${d.studentTeacherRatio}`,
              String(d.attendance),
              String(d.assessmentAttempts),
              String(d.assessmentPassRate),
              String(d.averageScore),
            ]),
          ];
          downloadCSV(`district-performance-${overview?.region?.name || 'region'}`, rows);
          break;

        case 'attendance-trends': {
          const attendanceData = await getRegionalAttendanceTrends(range);
          rows = [
            ['Date', 'Present', 'Late', 'Absent', 'Total', 'Rate %'],
            ...(attendanceData.trends || []).map(t => [
              t.date,
              String(t.present),
              String(t.late),
              String(t.absent),
              String(t.total),
              String(t.rate),
            ]),
          ];
          downloadCSV(`attendance-trends-${overview?.region?.name || 'region'}`, rows);
          break;
        }

        case 'assessment-performance': {
          const assessData = await getRegionalAssessmentPerformance(range);
          rows = [
            ['Subject', 'Attempts', 'Passed', 'Pass Rate %', 'Average Score %'],
            ...(assessData.subjects || []).map(s => [
              s.subject,
              String(s.attempts),
              String(s.passed),
              String(s.passRate),
              String(s.averageScore),
            ]),
          ];
          downloadCSV(`assessment-performance-${overview?.region?.name || 'region'}`, rows);
          break;
        }

        case 'school-directory': {
          const schoolsData = await getSchoolsInRegion({ limit: 1000 });
          rows = [
            [
              'Name',
              'Code',
              'Type',
              'Status',
              'District',
              'Region',
              'Contact Email',
              'Contact Phone',
              'Students',
              'Teachers',
              'Classes'
            ],
            ...(schoolsData.schools || []).map((s: any) => [
              s.name,
              s.code,
              s.type,
              s.status,
              s.district || '',
              s.region || '',
              s.contactEmail || '',
              s.contactPhone || '',
              String(s.studentCount),
              String(s.teacherCount),
              String(s.classCount),
            ]),
          ];
          downloadCSV(`school-directory-${overview?.region?.name || 'region'}`, rows);
          break;
        }

        default:
          throw new Error('Unknown report');
      }

      toast.success('Report downloaded successfully!');
    } catch (error: any) {
      console.error('Generate report error:', error);
      toast.error(error?.message || 'Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const filteredTemplates = activeCategory === 'all'
    ? REPORT_TEMPLATES
    : REPORT_TEMPLATES.filter(t => t.category === activeCategory);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">Reports</h1>
          </div>
          <p className="text-text-secondary">
            Generate and download reports for {overview?.region?.name || 'your region'}
          </p>
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {[
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
            { value: '90d', label: '90d' },
            { value: '1y', label: '1y' }
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

      {/* Snapshot Banner */}
      {overview && (
        <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Live Data Snapshot</h2>
          </div>
          <p className="text-white/80 text-sm mb-4">
            Reports include data from the last <strong>{range}</strong> for all schools in {overview.region.name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/70">Districts</p>
              <p className="text-2xl font-bold">{overview.geography.districts}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/70">Schools</p>
              <p className="text-2xl font-bold">{overview.schools.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/70">Students</p>
              <p className="text-2xl font-bold">{overview.students.total.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-xs text-white/70">Teachers</p>
              <p className="text-2xl font-bold">{overview.teachers.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit">
        {[
          { value: 'all', label: 'All Reports', icon: FileText },
          { value: 'analytics', label: 'Analytics', icon: BarChart3 },
          { value: 'geography', label: 'Geography', icon: Building2 },
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                activeCategory === cat.value
                  ? 'bg-akoma-green text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Report Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          const isGenerating = generating?.startsWith(template.id);

          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 rounded-lg ${template.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${template.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text text-sm leading-tight mb-1">
                    {template.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${template.bg} ${template.color}`}>
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-text-secondary mb-4 flex-1">
                {template.description}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {template.formats.includes('csv') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateReport(template.id, 'csv')}
                    disabled={isGenerating}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    CSV
                  </Button>
                )}
                {template.formats.includes('pdf') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateReport(template.id, 'pdf')}
                    disabled={isGenerating}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Export */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <Download className="h-5 w-5 text-akoma-green" />
              Quick Export
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Download all district data in a single CSV file
            </p>
          </div>
          <Button
            onClick={() => generateReport('district-performance', 'csv')}
            disabled={!!generating}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            <Download className="h-4 w-4" />
            Download All Districts
          </Button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-800">Coming Soon</p>
            <ul className="text-sm text-blue-700 mt-1 space-y-0.5 list-disc list-inside">
              <li>PDF generation with charts</li>
              <li>Custom date range selection</li>
              <li>Scheduled email reports</li>
              <li>District comparison reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}