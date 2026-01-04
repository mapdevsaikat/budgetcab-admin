'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PricingRule } from '@/lib/types';
import { Plus, Edit, DollarSign } from 'lucide-react';

interface PricingRulesListProps {
  initialRules: PricingRule[];
}

export default function PricingRulesList({ initialRules }: PricingRulesListProps) {
  const [rules, setRules] = useState<PricingRule[]>(initialRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [baseFare, setBaseFare] = useState('');
  const [perKmRate, setPerKmRate] = useState('');
  const [timeSlotType, setTimeSlotType] = useState('regular_time');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const openModal = (rule?: PricingRule) => {
    if (rule) {
      setEditingRule(rule);
      setBaseFare(rule.base_fare?.toString() || '');
      setPerKmRate(rule.per_km_rate?.toString() || '');
      setTimeSlotType(rule.time_slot_type);
      setStartTime(rule.start_time || '');
      setEndTime(rule.end_time || '');
      setPriority(rule.priority?.toString() || '0');
    } else {
      setEditingRule(null);
      setBaseFare('');
      setPerKmRate('');
      setTimeSlotType('regular_time');
      setStartTime('');
      setEndTime('');
      setPriority('0');
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setBaseFare('');
    setPerKmRate('');
    setTimeSlotType('regular_time');
    setStartTime('');
    setEndTime('');
    setPriority('0');
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseFareNum = baseFare ? parseFloat(baseFare) : null;
      const perKmRateNum = perKmRate ? parseFloat(perKmRate) : null;
      const priorityNum = priority ? parseInt(priority) : 0;

      if (editingRule) {
        // Update existing rule
        const { data, error: updateError } = await supabase
          .from('pricing_rules')
          .update({
            base_fare: baseFareNum,
            per_km_rate: perKmRateNum,
            time_slot_type: timeSlotType,
            start_time: startTime || null,
            end_time: endTime || null,
            priority: priorityNum,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRule.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setRules(rules.map((r) => (r.id === editingRule.id ? data : r)));
      } else {
        // Create new rule
        const { data, error: insertError } = await supabase
          .from('pricing_rules')
          .insert({
            base_fare: baseFareNum,
            per_km_rate: perKmRateNum,
            time_slot_type: timeSlotType,
            start_time: startTime || null,
            end_time: endTime || null,
            priority: priorityNum,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setRules([...rules, data]);
      }

      closeModal();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (rule: PricingRule) => {
    if (rule.start_time && rule.end_time) {
      return `${rule.start_time} - ${rule.end_time}`;
    }
    return 'All day';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maahi-brand hover:bg-maahi-brand/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pricing Rule
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {rules.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No pricing rules found. Add your first pricing rule.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rules.map((rule) => (
              <li key={rule.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {rule.time_slot_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        Priority: {rule.priority}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Base Fare:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          ₹{rule.base_fare?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">Per KM:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          ₹{rule.per_km_rate?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <span>Time:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatTimeSlot(rule)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openModal(rule)}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
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
                  Time Slot Type *
                </label>
                <select
                  value={timeSlotType}
                  onChange={(e) => setTimeSlotType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                >
                  <option value="regular_time">Regular Time</option>
                  <option value="office_hours">Office Hours</option>
                  <option value="night_hours">Night Hours</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher priority rules take precedence when time slots overlap
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Fare (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Per KM Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={perKmRate}
                  onChange={(e) => setPerKmRate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  placeholder="0.00"
                />
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
                disabled={loading}
                className="px-4 py-2 bg-maahi-brand text-white rounded-md hover:bg-maahi-brand/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

