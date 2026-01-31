'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Driver } from '@/lib/types';
import { Plus, Edit, Check, X } from 'lucide-react';

interface DriversListProps {
  initialDrivers: Driver[];
}

export default function DriversList({ initialDrivers }: DriversListProps) {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [name, setName] = useState('');
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [vehicleTypeName, setVehicleTypeName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [driverToDeactivate, setDriverToDeactivate] = useState<Driver | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<Array<{ name: string }>>([]);
  const supabase = createClient();

  useEffect(() => {
    // Fetch vehicle types
    const fetchVehicleTypes = async () => {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('name')
        .eq('is_active', true)
        .order('display_order')
        .order('name');
      
      if (!error && data) {
        setVehicleTypes(data);
      }
    };
    fetchVehicleTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setName(driver.name || '');
      setShiftStart(driver.shift_start || '');
      setShiftEnd(driver.shift_end || '');
      setVehicleTypeName(driver.vehicle_type_name || '');
      setIsActive(driver.is_active);
    } else {
      setEditingDriver(null);
      setName('');
      setShiftStart('');
      setShiftEnd('');
      setVehicleTypeName('');
      setIsActive(true);
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
    setName('');
    setShiftStart('');
    setShiftEnd('');
    setVehicleTypeName('');
    setIsActive(true);
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (editingDriver) {
        // Update existing driver
        const { data, error: updateError } = await supabase
          .from('drivers')
          .update({
            name,
            shift_start: shiftStart || null,
            shift_end: shiftEnd || null,
            vehicle_type_name: vehicleTypeName || null,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingDriver.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setDrivers(drivers.map((d) => (d.id === editingDriver.id ? data : d)));
      } else {
        // Create new driver
        const { data, error: insertError } = await supabase
          .from('drivers')
          .insert({
            name,
            shift_start: shiftStart || null,
            shift_end: shiftEnd || null,
            vehicle_type_name: vehicleTypeName || null,
            is_active: isActive,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setDrivers([...drivers, data]);
      }

      closeModal();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (driver: Driver) => {
    const { data, error } = await supabase
      .from('drivers')
      .update({ is_active: !driver.is_active })
      .eq('id', driver.id)
      .select()
      .single();

    if (!error && data) {
      setDrivers(drivers.map((d) => (d.id === driver.id ? data : d)));
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maahi-brand hover:bg-maahi-brand/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Driver
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {drivers.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No drivers found. Add your first driver.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {drivers.map((driver) => {
              // Determine if driver is currently online based on shift times
              const isCurrentlyOnline = (() => {
                if (!driver.is_active || !driver.shift_start || !driver.shift_end) {
                  return false;
                }

                const now = new Date();
                const currentTime = now.getHours() * 60 + now.getMinutes();

                // Parse shift times (format: HH:MM:SS or HH:MM)
                const parseTime = (timeStr: string) => {
                  const [hours, minutes] = timeStr.split(':').map(Number);
                  return hours * 60 + (minutes || 0);
                };

                const formatAMPM = (timeStr: string) => {
                  const [hours, minutes] = timeStr.split(':').map(Number);
                  const period = hours >= 12 ? 'PM' : 'AM';
                  const h = hours % 12 || 12;
                  const m = (minutes || 0).toString().padStart(2, '0');
                  return `${h}:${m} ${period}`;
                };

                const shiftStartMinutes = parseTime(driver.shift_start || '00:00');
                const shiftEndMinutes = parseTime(driver.shift_end || '00:00');

                // Handle shifts that cross midnight
                if (shiftEndMinutes < shiftStartMinutes) {
                  return currentTime >= shiftStartMinutes || currentTime <= shiftEndMinutes;
                }

                return currentTime >= shiftStartMinutes && currentTime <= shiftEndMinutes;
              })();

              return (
                <li key={driver.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {/* Status indicator with glow */}
                        <div className="relative flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${isCurrentlyOnline
                              ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse'
                              : 'bg-red-500 shadow-lg shadow-red-500/30'
                              }`}
                          />
                          {isCurrentlyOnline && (
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isCurrentlyOnline
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : driver.is_active
                                  ? 'bg-gray-50 text-gray-600 border border-gray-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                            >
                              {isCurrentlyOnline ? 'Online' : driver.is_active ? 'Offline' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 space-y-1">
                            {driver.shift_start && driver.shift_end ? (
                              <span className="flex items-center space-x-1">
                                <span className="text-gray-400">Shift:</span>
                                <span className="font-medium">
                                  {(() => {
                                    const formatAMPM = (timeStr: string) => {
                                      const [hours, minutes] = timeStr.split(':').map(Number);
                                      const period = hours >= 12 ? 'PM' : 'AM';
                                      const h = hours % 12 || 12;
                                      const m = (minutes || 0).toString().padStart(2, '0');
                                      return `${h}:${m} ${period}`;
                                    };
                                    return `${formatAMPM(driver.shift_start)} - ${formatAMPM(driver.shift_end)}`;
                                  })()}
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">No shift time set</span>
                            )}
                            {driver.vehicle_type_name && (
                              <span className="flex items-center space-x-1">
                                <span className="text-gray-400">Vehicle:</span>
                                <span className="font-medium">{driver.vehicle_type_name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (driver.is_active) {
                            setDriverToDeactivate(driver);
                          } else {
                            toggleActive(driver);
                          }
                        }}
                        className={`p-2 rounded-md transition-colors ${driver.is_active
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                        title={driver.is_active ? 'Deactivate driver' : 'Activate driver'}
                      >
                        {driver.is_active ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal(driver)}
                        className="p-2 text-gray-400 hover:text-maahi-brand hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit driver"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDriver ? 'Edit Driver' : 'Add Driver'}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Start
                  </label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift End
                  </label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleTypeName}
                  onChange={(e) => setVehicleTypeName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                >
                  <option value="">Select vehicle type (optional)</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.name} value={vt.name}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-maahi-brand focus:ring-maahi-brand border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !name.trim()}
                className="px-4 py-2 bg-maahi-brand text-white rounded-md hover:bg-maahi-brand/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Deactivation Confirmation Modal */}
      {driverToDeactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deactivation</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to deactivate <strong>{driverToDeactivate.name}</strong>? They will no longer be available for bookings.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDriverToDeactivate(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await toggleActive(driverToDeactivate);
                  setDriverToDeactivate(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
