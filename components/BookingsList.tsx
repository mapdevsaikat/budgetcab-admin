'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Booking, BookingStatus, Driver } from '@/lib/types';
import { format } from 'date-fns';
import { Search, Filter, MapPin, Calendar, User, Phone, DollarSign, Edit, Navigation, Share2 } from 'lucide-react';
import BookingModal from './BookingModal';
import { getWhatsAppShareUrl } from '@/lib/whatsapp';

interface BookingsListProps {
  initialBookings: Booking[];
}

export default function BookingsList({ initialBookings }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.booking_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.user_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.user_mobile?.includes(searchTerm) ||
          b.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.drop_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);

  const refreshBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        drivers (
          id,
          name,
          mobile
        ),
        booking_options (
          cab_type,
          trip_type,
          number_of_nights
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
  };

  const handleWhatsAppShare = (booking: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const driverMobile = booking.drivers?.mobile || null;
    const whatsappUrl = getWhatsAppShareUrl(booking, driverMobile);
    window.open(whatsappUrl, '_blank');
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    refreshBookings();
  };

  const statusColors: Record<BookingStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    driver_assigned: 'bg-purple-100 text-purple-800',
    driver_enroute: 'bg-red-100 text-red-800',
    arrived: 'bg-cyan-100 text-cyan-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-green-200 text-green-900',
    cancelled_by_user: 'bg-red-100 text-red-800',
    cancelled_by_driver: 'bg-red-100 text-red-800',
    cancelled_by_admin: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Filters */}
      <div className="mb-4 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by booking ref, name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-maahi-brand focus:border-maahi-brand"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="driver_assigned">Driver Assigned</option>
            <option value="driver_enroute">Driver Enroute</option>
            <option value="arrived">Arrived</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled_by_user">Cancelled by User</option>
            <option value="cancelled_by_driver">Cancelled by Driver</option>
            <option value="cancelled_by_admin">Cancelled by Admin</option>
            <option value="no_show">No Show</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBookings.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No bookings found
            </li>
          ) : (
            filteredBookings.map((booking) => (
              <li key={booking.id} className="hover:bg-gray-50 flex items-center">
                <div
                  onClick={() => handleBookingClick(booking)}
                  className="flex-1 px-4 py-4 sm:px-6 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-maahi-brand">
                          {booking.booking_ref}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]
                            }`}
                        >
                          {booking.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center min-w-0">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{booking.user_first_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{booking.user_mobile || 'N/A'}</span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate" title={booking.pickup_address || 'N/A'}>
                            {booking.pickup_address || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>₹{booking.price_total?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                      {booking.scheduled_time && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>
                            Scheduled: {format(new Date(booking.scheduled_time), 'PPp')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center pr-4 sm:pr-6 space-x-2">
                  {booking.pickup_lat && booking.pickup_lng && booking.drop_lat && booking.drop_lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${booking.pickup_lat},${booking.pickup_lng}&destination=${booking.drop_lat},${booking.drop_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center justify-center"
                      title="Navigate on Google Maps"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation className="w-5 h-5 fill-current" />
                    </a>
                  )}
                  <button
                    onClick={(e) => handleWhatsAppShare(booking, e)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleBookingClick(booking)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit Booking"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

