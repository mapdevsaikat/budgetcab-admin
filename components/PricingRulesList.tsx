'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PricingRule } from '@/lib/types';
import { Plus, Edit, DollarSign } from 'lucide-react';

interface PricingRulesListProps {
  initialRules: PricingRule[];
}

const CAB_TYPES = [
  'Maruti Ertiga Or Similar',
  'Maruti Swift Dzire Or Similar CNG',
  'Maruti Swift Dzire Or Similar Diesel',
  'Tempo Traveller 17 Seater',
  'Tempo Traveller 26 Seater',
];

const TRIP_TYPES = ['Local', 'One Way', 'Outstation', 'Airport Transfer'];

const getTripTypeBadgeColor = (tripType: string) => {
  switch (tripType) {
    case 'Local':
      return 'bg-blue-100 text-blue-800';
    case 'One Way':
      return 'bg-green-100 text-green-800';
    case 'Outstation':
      return 'bg-purple-100 text-purple-800';
    case 'Airport Transfer':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

export default function PricingRulesList({ initialRules }: PricingRulesListProps) {
  const [rules, setRules] = useState<PricingRule[]>(initialRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [baseFare, setBaseFare] = useState('');
  const [cabType, setCabType] = useState('');
  const [tripType, setTripType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const openModal = (rule?: PricingRule) => {
    if (rule) {
      setEditingRule(rule);
      // Handle numeric type which might be string or number
      const fareValue = typeof rule.base_fare === 'string' 
        ? parseFloat(rule.base_fare).toString() 
        : rule.base_fare?.toString() || '';
      setBaseFare(fareValue);
      setCabType(rule.cab_type || '');
      setTripType(rule.trip_type || '');
    } else {
      setEditingRule(null);
      setBaseFare('');
      setCabType('');
      setTripType('');
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setBaseFare('');
    setCabType('');
    setTripType('');
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!cabType || !tripType) {
        setError('Cab type and trip type are required');
        setLoading(false);
        return;
      }

      const baseFareNum = baseFare ? parseFloat(baseFare) : 0;
      if (isNaN(baseFareNum) || baseFareNum < 0) {
        setError('Base fare must be a valid positive number');
        setLoading(false);
        return;
      }

      if (editingRule) {
        // Update existing rule
        const { data, error: updateError } = await supabase
          .from('pricing')
          .update({
            cab_type: cabType,
            trip_type: tripType,
            base_fare: baseFareNum,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRule.id)
          .select();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        if (!data || data.length === 0) {
          throw new Error('Pricing rule not found or could not be updated');
        }

        // Convert base_fare to number if it's a string (PostgreSQL numeric type)
        const updatedRule = {
          ...data[0],
          base_fare: typeof data[0].base_fare === 'string' 
            ? parseFloat(data[0].base_fare) 
            : data[0].base_fare
        };

        setRules(rules.map((r) => (r.id === editingRule.id ? updatedRule : r)));
      } else {
        // Check if combination already exists
        const existingRule = rules.find(
          (r) => r.cab_type === cabType && r.trip_type === tripType
        );
        if (existingRule) {
          setError('A pricing rule for this cab type and trip type combination already exists');
          setLoading(false);
          return;
        }

        // Create new rule
        const { data, error: insertError } = await supabase
          .from('pricing')
          .insert({
            cab_type: cabType,
            trip_type: tripType,
            base_fare: baseFareNum,
          })
          .select();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        if (!data || data.length === 0) {
          throw new Error('Failed to create pricing rule');
        }

        // Convert base_fare to number if it's a string (PostgreSQL numeric type)
        const newRule = {
          ...data[0],
          base_fare: typeof data[0].base_fare === 'string' 
            ? parseFloat(data[0].base_fare) 
            : data[0].base_fare
        };

        setRules([...rules, newRule]);
      }

      closeModal();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
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
                      <span className="text-sm font-medium text-gray-900">
                        {rule.cab_type}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getTripTypeBadgeColor(rule.trip_type)}`}>
                        {rule.trip_type}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Base Fare:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        ₹{typeof rule.base_fare === 'string' 
                          ? parseFloat(rule.base_fare).toFixed(2) 
                          : rule.base_fare?.toFixed(2) || '0.00'}
                      </span>
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
                  Cab Type *
                </label>
                <select
                  value={cabType}
                  onChange={(e) => setCabType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  required
                >
                  <option value="">Select Cab Type</option>
                  {CAB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Type *
                </label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  required
                >
                  <option value="">Select Trip Type</option>
                  {TRIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Fare (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-maahi-brand focus:border-maahi-brand"
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Base fare for this cab type and trip type combination
                </p>
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

