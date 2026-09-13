/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  QrCode,
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Smartphone as SmartphoneIcon,
  Tablet,
  Monitor,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Download,
  Power,
  ScanLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getMySchool, getDevices, registerDevice, activateDevice, removeDevice } from '@/lib/services/schoolAdminService';
import { format, formatDistanceToNow } from 'date-fns';

interface Device {
  id: string;
  deviceName: string;
  deviceId: string;
  deviceType: 'tablet' | 'smartphone' | 'scanner' | 'kiosk' | 'gate_reader';
  location: string;
  status: 'active' | 'inactive' | 'offline' | 'maintenance';
  isActive: boolean;
  lastUsedAt?: string;
  registeredAt: string;
  ipAddress?: string;
  registrations?: {
    activationCode: string;
    activationStatus: 'pending' | 'activated' | 'expired';
  }[];
}

interface DeviceStats {
  total: number;
  active: number;
  inactive: number;
  offline: number;
  maintenance: number;
}

const deviceTypeLabels: Record<string, { label: string; icon: any }> = {
  tablet: { label: 'Tablet', icon: Tablet },
  smartphone: { label: 'Smartphone', icon: SmartphoneIcon },
  scanner: { label: 'Scanner', icon: ScanLine },
  kiosk: { label: 'Kiosk', icon: Monitor },
  gate_reader: { label: 'Gate Reader', icon: QrCode },
};

export default function DeviceManagementPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats>({
    total: 0,
    active: 0,
    inactive: 0,
    offline: 0,
    maintenance: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [schoolId, setSchoolId] = useState<string>('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState<{ deviceId: string; activationCode: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceType: 'tablet' as Device['deviceType'],
    location: '',
    ipAddress: ''
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const schoolData = await getMySchool();
      if (schoolData) {
        setSchoolId(schoolData.id);
        
        const data = await getDevices(schoolData.id);
        const list = data || [];
        setDevices(list);
        setTotalPages(Math.ceil(list.length / itemsPerPage) || 1);
        
        // Calculate stats
        const total = list.length;
        const active = list.filter((d: Device) => d.status === 'active' && d.isActive).length;
        const inactive = list.filter((d: Device) => d.status === 'inactive' || !d.isActive).length;
        const offline = list.filter((d: Device) => d.status === 'offline').length;
        const maintenance = list.filter((d: Device) => d.status === 'maintenance').length;
        
        setStats({ total, active, inactive, offline, maintenance });
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.deviceName.trim() || !formData.location.trim()) {
      toast.error('Device name and location are required');
      return;
    }

    setActionLoading(true);
    try {
      // Get the actual user ID from auth context
      const registeredBy = user?.id || 'system';
      
      const data = await registerDevice({
        ...formData,
        schoolId,
        registeredBy
      });
      
      toast.success('Device registered successfully!', {
        description: `Activation code: ${data.activationCode}`,
        duration: 6000,
        icon: '📱',
        action: {
          label: 'Activate Now',
          onClick: () => {
            setShowActivateModal({
              deviceId: data.device.id,
              activationCode: data.activationCode
            });
          }
        }
      });
      
      setShowRegisterModal(false);
      setFormData({ deviceName: '', deviceType: 'tablet', location: '', ipAddress: '' });
      await fetchDevices();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to register device');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateDevice = async () => {
    if (!showActivateModal) return;
    
    setActionLoading(true);
    try {
      await activateDevice(showActivateModal.deviceId, showActivateModal.activationCode);
      toast.success('Device activated successfully!');
      setShowActivateModal(null);
      await fetchDevices();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to activate device');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setActionLoading(true);
    try {
      await removeDevice(deviceId);
      toast.success('Device removed successfully');
      setShowDeleteConfirm(null);
      await fetchDevices();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove device');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (device: Device) => {
    if (!device.isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <XCircle className="h-3.5 w-3.5" />
          Inactive
        </span>
      );
    }
    
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      active: {
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: 'Active'
      },
      offline: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Offline'
      },
      maintenance: {
        color: 'bg-orange-100 text-orange-700',
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        label: 'Maintenance'
      },
      inactive: {
        color: 'bg-gray-100 text-gray-700',
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: 'Inactive'
      }
    };
    const config = configs[device.status] || configs.inactive;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getDeviceIcon = (type: string) => {
    const config = deviceTypeLabels[type] || deviceTypeLabels.tablet;
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  const filteredDevices = devices.filter(device => {
    const search = searchTerm.toLowerCase();
    return (
      device.deviceName.toLowerCase().includes(search) ||
      device.deviceId.toLowerCase().includes(search) ||
      device.location?.toLowerCase().includes(search)
    );
  });

  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/school/attendance" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-2">
            <QrCode className="h-4 w-4" />
            Back to Attendance
          </Link>
          <h1 className="text-2xl font-bold text-text">Device Management</h1>
          <p className="text-text-secondary">
            Manage attendance devices (QR scanners, tablets, etc.)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDevices}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
            onClick={() => setShowRegisterModal(true)}
          >
            <Plus className="h-4 w-4" />
            Register Device
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Offline</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.offline}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Maintenance</p>
          <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by device name, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Device
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  ID
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Last Used
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <QrCode className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No devices found</p>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={() => setShowRegisterModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Register your first device
                    </Button>
                  </td>
                </tr>
              ) : (
                paginatedDevices.map((device) => (
                  <tr key={device.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <div>
                          <p className="font-medium text-text">{device.deviceName}</p>
                          <p className="text-xs text-text-secondary">
                            {device.registrations?.[0]?.activationStatus === 'pending' ? (
                              <span className="text-yellow-600">Awaiting activation</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {device.deviceId}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text capitalize">
                        {deviceTypeLabels[device.deviceType]?.label || device.deviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text">{device.location || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(device)}
                    </td>
                    <td className="px-6 py-4">
                      {device.lastUsedAt ? (
                        <div className="space-y-0.5">
                          <p className="text-sm text-text-secondary">
                            {format(new Date(device.lastUsedAt), 'PPP')}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatDistanceToNow(new Date(device.lastUsedAt), { addSuffix: true })}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-text-secondary">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {device.registrations?.[0]?.activationStatus === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() => setShowActivateModal({
                              deviceId: device.id,
                              activationCode: device.registrations?.[0]?.activationCode || ''
                            })}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setShowDeleteConfirm(device.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1.5 text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Register Device Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-akoma-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Register Device</h3>
                <p className="text-sm text-text-secondary">Add a new attendance device</p>
              </div>
            </div>

            <form onSubmit={handleRegisterDevice}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Device Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder="e.g., Main Gate Scanner"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Device Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                    required
                  >
                    <option value="tablet">Tablet</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="scanner">Scanner</option>
                    <option value="kiosk">Kiosk</option>
                    <option value="gate_reader">Gate Reader</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Entrance"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>After registration, you&apos;ll receive an activation code to activate the device.</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowRegisterModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-akoma-green hover:bg-akoma-dark text-white"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Register Device'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activate Device Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Power className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Activate Device</h3>
                <p className="text-sm text-text-secondary">Enter the activation code</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Activation Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={showActivateModal.activationCode}
                    onChange={(e) => setShowActivateModal({
                      ...showActivateModal,
                      activationCode: e.target.value.toUpperCase()
                    })}
                    placeholder="Enter activation code"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all uppercase"
                    required
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Enter the activation code that was provided during registration.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowActivateModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivateDevice}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={actionLoading || !showActivateModal.activationCode}
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Activate Device'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Device</h3>
                <p className="text-sm text-text-secondary">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this device? All associated attendance records will remain.
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  The device will be deactivated and can be re-registered if needed.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleRemoveDevice(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={actionLoading}
              >
                {actionLoading ? 'Removing...' : 'Remove Device'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}