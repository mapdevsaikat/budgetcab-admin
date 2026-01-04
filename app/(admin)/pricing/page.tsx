import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import PricingRulesList from '@/components/PricingRulesList';
import { PricingRule } from '@/lib/types';

export default async function PricingPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: pricingRules, error } = await supabase
    .from('pricing_rules')
    .select('*')
    .order('priority', { ascending: false })
    .order('start_time');

  if (error) {
    console.error('Error fetching pricing rules:', error);
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Rules</h1>
        <p className="mt-1 text-sm text-gray-500">Manage fare calculation rules</p>
      </div>
      <PricingRulesList initialRules={(pricingRules as PricingRule[]) || []} />
    </div>
  );
}

