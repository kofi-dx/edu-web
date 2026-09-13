/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  QrCode,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Calendar,
  User,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getMySchool } from '@/lib/services/schoolAdminService';

const navItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    ]
  },
  {
    section: 'Teaching',
    items: [
      { label: 'My Classes', href: '/teacher/classes', icon: BookOpen },
      { label: 'Assessments', href: '/teacher/assessments', icon: ClipboardList }, 
      { label: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },          
      { label: 'Students', href: '/teacher/students', icon: Users },
    ]
  },
  {
    section: 'Attendance',
    items: [
      { label: 'Take Attendance', href: '/teacher/attendance', icon: QrCode },
      { label: 'Calendar', href: '/teacher/calendar', icon: Calendar },
    ]
  },
  {
    section: 'Profile',
    items: [
      { label: 'My Profile', href: '/teacher/profile', icon: User },
      { label: 'Settings', href: '/teacher/settings', icon: Settings },
    ]
  }
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [schoolName, setSchoolName] = useState<string>('');

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const data = await getMySchool();
        if (data) {
          setSchoolName(data.name);
        }
      } catch (error) {
        console.error('Failed to fetch school:', error);
      }
    };
    if (user) {
      fetchSchool();
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'teacher') {
        const roleRoutes: Record<string, string> = {
          super_admin: '/platform',
          school_admin: '/school',
          student: '/student',
          parent: '/parent',
        };
        router.push(roleRoutes[user.role] || '/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/teacher" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-akoma-green flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-text hidden sm:inline">Akoma Edu</span>
              <span className="text-xs bg-akoma-green/10 text-akoma-green px-2 py-0.5 rounded-full hidden sm:inline truncate max-w-30">
                Teacher
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search students, classes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-akoma-green">
                    {user.firstName?.[0]}{user.lastName?.[0] || ''}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-text leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-text-secondary capitalize">Teacher</p>
                </div>
                <ChevronDown className="h-4 w-4 text-text-secondary hidden sm:block" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-text">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                      <p className="text-xs text-akoma-green mt-0.5 capitalize">Teacher</p>
                      <p className="text-xs text-text-secondary mt-1">{schoolName}</p>
                    </div>
                    <Link
                      href="/teacher/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-text"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/teacher/settings"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-text"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-600 w-full border-t border-gray-100 mt-1 pt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-gray-200 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="h-full overflow-y-auto py-4 px-3">
          {navItems.map((section) => (
            <div key={section.section} className="mb-4">
              {!isCollapsed && (
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider px-3 mb-2">
                  {section.section}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = 
                    (item.href === '/teacher' && pathname === '/teacher') || 
                    (item.href !== '/teacher' && pathname?.startsWith(item.href));
                  
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group",
                        isActive 
                          ? "bg-akoma-green/10 text-akoma-green" 
                          : "text-text-secondary hover:bg-gray-100 hover:text-text"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-akoma-green" : "text-text-secondary"
                      )} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="lg:hidden border-t border-gray-100 pt-4 mt-4">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "pt-16 transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-64",
        "pl-0"
      )}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}