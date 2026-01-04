'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Booking, BookingStatus, Driver } from '@/lib/types';
import { format } from 'date-fns';
import { X, MapPin, Calendar, User, Phone, DollarSign, Save, UserCheck } from 'lucide-react';

interface BookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ booking, isOpen, onClose }: BookingModalProps) {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [driverId, setDriverId] = useState<string>(booking.driver_id || '');
  const [toll, setToll] = useState<string>(booking.toll?.toString() || '0');
  const [priceTotal, setPriceTotal] = useState<string>(booking.price_total?.toString() || '');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name');

    if (!error && data) {
      setDrivers(data as Driver[]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (driverId) {
      updateData.driver_id = driverId;
    }

    if (toll) {
      const tollValue = parseFloat(toll);
      if (!isNaN(tollValue)) {
        updateData.toll = tollValue;
      }
    }

    if (priceTotal) {
      const price = parseFloat(priceTotal);
      if (!isNaN(price)) {
        updateData.price_total = price;
      }
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Booking Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Reference
            </label>
            <p className="text-lg font-semibold text-maahi-brand">{booking.booking_ref}</p>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                User Name
              </label>
              <p className="text-gray-900">{booking.user_first_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Mobile
              </label>
              <p className="text-gray-900">{booking.user_mobile || 'N/A'}</p>
            </div>
          </div>

          {/* Locations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Pickup Location
            </label>
            <p className="text-gray-900">{booking.pickup_address || 'N/A'}</p>
            {booking.pickup_digipin && (
              <p className="text-sm text-gray-500 mt-1">DigiPin: {booking.pickup_digipin}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Drop Location
            </label>
            <p className="text-gray-900">{booking.drop_address || 'N/A'}</p>
            {booking.drop_digipin && (
              <p className="text-sm text-gray-500 mt-1">DigiPin: {booking.drop_digipin}</p>
            )}
          </div>

          {/* Scheduled Time */}
          {booking.scheduled_time && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Scheduled Time
              </label>
              <p className="text-gray-900">
                {format(new Date(booking.scheduled_time), 'PPp')}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
            >
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

          {/* Driver Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="w-4 h-4 inline mr-1" />
              Assign Driver
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
            >
              <option value="">No driver assigned</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} {driver.is_active ? '(Active)' : '(Inactive)'}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Toll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Toll (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={toll}
                onChange={(e) => {
                  const newToll = e.target.value;
                  const oldTollValue = parseFloat(toll) || 0;
                  const newTollValue = parseFloat(newToll) || 0;
                  const currentPrice = parseFloat(priceTotal) || 0;

                  // Adjust total price based on toll change
                  const priceWithoutToll = currentPrice - oldTollValue;
                  const updatedPrice = priceWithoutToll + newTollValue;

                  setToll(newToll);
                  setPriceTotal(updatedPrice.toFixed(2));
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Total Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={priceTotal}
                onChange={(e) => setPriceTotal(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand font-bold bg-gray-50 text-maahi-brand"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Distance: {booking.distance_km?.toFixed(2) || '0.00'} km
          </p>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {format(new Date(booking.created_at), 'PPp')}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{' '}
              {format(new Date(booking.updated_at), 'PPp')}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-maahi-brand text-white rounded-md hover:bg-maahi-brand/90 disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

