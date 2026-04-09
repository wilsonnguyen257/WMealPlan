'use client';

import { PreferencesForm } from '@/components/PreferencesForm';
import { MealPlanView } from '@/components/meal-plan/MealPlanView';
import { generateMealPlanAction } from '@/app/actions/gemini';
import { Preferences, MealPlan } from '@/lib/contracts';
import { useState } from 'react';

export default function Home() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: Preferences) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMealPlanAction(data);
      setPlan(result);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            WMealPlan <span className="text-indigo-600">High Assurance</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Mathematically verified meal planning.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!plan ? (
          <div className="max-w-xl mx-auto">
            <PreferencesForm onSubmit={handleGenerate} isLoading={loading} />
          </div>
        ) : (
          <MealPlanView plan={plan} onReset={() => setPlan(null)} />
        )}
      </div>
    </main>
  );
}
