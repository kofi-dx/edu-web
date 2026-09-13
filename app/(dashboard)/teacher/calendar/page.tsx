/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Users,
  MapPin,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getMyTeacherClasses } from '@/lib/services/schoolAdminService';

interface ClassEvent {
  id: string;
  title: string;
  type: 'class' | 'exam' | 'meeting' | 'holiday';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  classId?: string;
  className?: string;
}

const eventTypeColors = {
  class: 'bg-blue-100 text-blue-700 border-blue-200',
  exam: 'bg-red-100 text-red-700 border-red-200',
  meeting: 'bg-purple-100 text-purple-700 border-purple-200',
  holiday: 'bg-green-100 text-green-700 border-green-200',
};

const eventTypeLabels = {
  class: 'Class',
  exam: 'Exam',
  meeting: 'Meeting',
  holiday: 'Holiday',
};

export default function TeacherCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);

  // Fetch teacher's classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getMyTeacherClasses();
      setClasses(data || []);
      
      // Generate mock schedule from classes
      const today = new Date();
      const mockEvents: ClassEvent[] = [];
      
      (data || []).forEach((cls: any, index: number) => {
        // Add class events for weekdays
        for (let day = 0; day < 5; day++) {
          const eventDate = new Date(today);
          eventDate.setDate(today.getDate() + (day - today.getDay() + 1));
          
          if (eventDate.getDay() !== 0 && eventDate.getDay() !== 6) {
            mockEvents.push({
              id: `${cls.id}-${day}`,
              title: `${cls.name} - Class`,
              type: 'class',
              date: eventDate.toISOString().split('T')[0],
              startTime: index === 0 ? '08:00' : '10:00',
              endTime: index === 0 ? '09:30' : '11:30',
              location: cls.roomNumber || 'Room TBD',
              classId: cls.id,
              className: cls.name,
            });
          }
        }
      });
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  // Get selected date's events
  const selectedDateEvents = selectedDate
    ? events.filter(e => e.date === selectedDate.toISOString().split('T')[0])
    : [];

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Calendar</h1>
          <p className="text-text-secondary">
            View your class schedule and events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEventModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Classes Today</p>
              <p className="text-2xl font-bold text-text">
                {getEventsForDate(new Date().getDate()).filter(e => e.type === 'class').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Upcoming Exams</p>
              <p className="text-2xl font-bold text-text">
                {events.filter(e => e.type === 'exam').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">My Classes</p>
              <p className="text-2xl font-bold text-text">{classes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Events</p>
              <p className="text-2xl font-bold text-text">{events.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-text min-w-50 text-center">
              {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {Object.entries(eventTypeLabels).map(([type, label]) => (
              <span key={type} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${
                  type === 'class' ? 'bg-blue-500' :
                  type === 'exam' ? 'bg-red-500' :
                  type === 'meeting' ? 'bg-purple-500' : 'bg-green-500'
                }`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-text-secondary uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: startingDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24 rounded-lg bg-gray-50/50" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDate(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === month &&
                selectedDate?.getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDate(new Date(year, month, day))
                  }
                  className={`h-24 rounded-lg border p-1.5 text-left transition-all overflow-hidden ${
                    isSelected
                      ? 'border-akoma-green bg-akoma-green/5 ring-2 ring-akoma-green/20'
                      : isToday
                      ? 'border-akoma-green/50 bg-akoma-green/5'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday ? 'text-akoma-green' : 'text-text'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-akoma-green text-white px-1.5 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${
                          eventTypeColors[event.type]
                        }`}
                      >
                        {event.startTime} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-text-secondary px-1.5">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text">
                {formatDate(selectedDate)}
              </h3>
              <p className="text-sm text-text-secondary">
                {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                <p className="text-text-secondary">No events on this day</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-2"
                  onClick={() => setShowEventModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${eventTypeColors[event.type]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {eventTypeLabels[event.type]}
                          </span>
                          {event.className && (
                            <span className="text-xs">• {event.className}</span>
                          )}
                        </div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">Add Event</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text">Title</label>
                <input
                  type="text"
                  placeholder="Event title"
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text">Type</label>
                <select className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white">
                  <option value="class">Class</option>
                  <option value="exam">Exam</option>
                  <option value="meeting">Meeting</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text">Date</label>
                <input
                  type="date"
                  defaultValue={selectedDate?.toISOString().split('T')[0]}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-text">Start Time</label>
                  <input
                    type="time"
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text">End Time</label>
                  <input
                    type="time"
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text">Location</label>
                <input
                  type="text"
                  placeholder="Room or location"
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                onClick={() => {
                  toast.success('Event added successfully');
                  setShowEventModal(false);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}