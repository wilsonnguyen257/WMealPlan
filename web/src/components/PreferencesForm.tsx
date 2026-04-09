'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Preferences, PreferencesSchema, DietSchema } from '@/lib/contracts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PreferencesFormProps {
  onSubmit: (data: Preferences) => void;
  isLoading?: boolean;
}

export function PreferencesForm({ onSubmit, isLoading }: PreferencesFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Preferences>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      days: 3,
      people: 2,
      budget: 100,
      diet: 'None',
      goal: 'Healthy',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Meal Preferences</h2>
        <p className="text-sm text-gray-500">Customize your weekly plan.</p>
      </div>

      {/* Days */}
      <div className="space-y-1">
        <label htmlFor="days" className="block text-sm font-medium text-gray-700">
          Days to Plan (1-7)
        </label>
        <input
          id="days"
          type="number"
          min={1}
          max={7}
          {...register('days', { valueAsNumber: true })}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border",
            errors.days && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          aria-invalid={!!errors.days}
          aria-describedby={errors.days ? "days-error" : undefined}
        />
        {errors.days && (
          <p id="days-error" className="text-sm text-red-600">{errors.days.message}</p>
        )}
      </div>

      {/* People */}
      <div className="space-y-1">
        <label htmlFor="people" className="block text-sm font-medium text-gray-700">
          People
        </label>
        <input
          id="people"
          type="number"
          min={1}
          max={10}
          {...register('people', { valueAsNumber: true })}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border",
            errors.people && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        />
        {errors.people && (
          <p className="text-sm text-red-600">{errors.people.message}</p>
        )}
      </div>

      {/* Budget */}
      <div className="space-y-1">
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          Budget (AUD)
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            id="budget"
            type="number"
            {...register('budget', { valueAsNumber: true })}
            className={cn(
              "block w-full rounded-md border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border",
              errors.budget && "border-red-500"
            )}
          />
        </div>
        {errors.budget && (
          <p className="text-sm text-red-600">{errors.budget.message}</p>
        )}
      </div>

      {/* Diet */}
      <div className="space-y-1">
        <label htmlFor="diet" className="block text-sm font-medium text-gray-700">
          Dietary Restriction
        </label>
        <select
          id="diet"
          {...register('diet')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        >
          {DietSchema.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.diet && (
          <p className="text-sm text-red-600">{errors.diet.message}</p>
        )}
      </div>

      {/* Goal */}
      <div className="space-y-1">
        <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
          Goal (Optional)
        </label>
        <input
          id="goal"
          type="text"
          placeholder="e.g. High Protein, Quick Meals"
          {...register('goal')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? 'Generating Plan...' : 'Generate Meal Plan'}
      </button>
    </form>
  );
}
