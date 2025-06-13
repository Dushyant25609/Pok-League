'use client';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AnimatedBox from '../animation/box';
import { dropAnimation } from '@/motion/axis';
import { CreateRoomRequest } from '@/types/room';
import { createBattleRoom } from '@/services/room';
import { toast } from 'sonner';
import useRoomStore from '@/store/room';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';

interface BattleRoomFormValues {
  username: string;
  generationAllow: number[];
  allowLegendaries: boolean;
  allowMythicals: boolean;
  bannedTypes: string[];
  teamSelectTime: number;
}

const BattleRoomForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const formik = useFormik<BattleRoomFormValues>({
    initialValues: {
      username: '',
      generationAllow: [],
      allowLegendaries: false,
      allowMythicals: false,
      bannedTypes: [],
      teamSelectTime: 300,
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      generationAllow: Yup.array()
        .of(Yup.number().min(1).max(9))
        .min(1, 'Select at least one generation')
        .required('Required'),
      allowLegendaries: Yup.boolean().required('Required'),
      allowMythicals: Yup.boolean().required('Required'),
      bannedTypes: Yup.array().of(Yup.string()),
      teamSelectTime: Yup.number()
        .min(60, 'Minimum 1 minute')
        .max(1800, 'Maximum 30 minutes')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      const submissionValues: CreateRoomRequest = {
        username: values.username,
        generation_allowed: values.generationAllow,
        banned_types: values.bannedTypes,
        allow_legendaries: values.allowLegendaries,
        allow_mythicals: values.allowMythicals,
        team_selection_time: values.teamSelectTime,
      };

      try {
        const res = await createBattleRoom(
          submissionValues.username,
          submissionValues.generation_allowed,
          submissionValues.banned_types,
          submissionValues.allow_legendaries,
          submissionValues.allow_mythicals,
          submissionValues.team_selection_time
        );
        console.log('response: ');

        useRoomStore.setState({
          username: submissionValues.username,
          roomCode: res.code,
          status: res.status,
        });

        toast.success('Room Successfully created');

        router.push(Routes.SelectionRoom.replace(':roomId', res.code));
      } catch (error: unknown) {
        toast.error('Room creation failed');
        useRoomStore.setState({ error: error as string });
      }
    },
  });

  const generations = Array.from({ length: 9 }, (_, i) => i + 1);
  const pokemonTypes = [
    'Normal',
    'Fire',
    'Water',
    'Grass',
    'Electric',
    'Ice',
    'Fighting',
    'Poison',
    'Ground',
    'Flying',
    'Psychic',
    'Bug',
    'Rock',
    'Ghost',
    'Dragon',
    'Steel',
    'Dark',
    'Fairy',
  ];

  const steps = [
    {
      title: 'Trainer Information',
      fields: (
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="username" className="text-sm font-semibold">
            Trainer Name
          </label>
          <input
            id="username"
            name="username"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
            placeholder="AshKetchum99"
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formik.touched.username && formik.errors.username && (
            <span className="text-red-400 text-xs">{formik.errors.username}</span>
          )}
        </div>
      ),
      validationFields: ['username'],
    },
    {
      title: 'Allowed Generations',
      fields: (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Allowed Generations</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {generations.map((gen) => {
              const isChecked = formik.values.generationAllow.includes(gen);
              return (
                <label
                  key={gen}
                  className={`cursor-pointer text-center px-4 py-2 rounded-full border text-sm transition-all duration-200
              ${
                isChecked
                  ? 'bg-red-600 text-white border-red-900'
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
              }
            `}
                >
                  <input
                    type="checkbox"
                    name="generationAllow"
                    value={gen}
                    checked={isChecked}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      const num = Number(value);
                      formik.setFieldValue(
                        'generationAllow',
                        checked
                          ? [...formik.values.generationAllow, num]
                          : formik.values.generationAllow.filter((g) => g !== num)
                      );
                    }}
                    className="hidden"
                  />
                  Gen {gen}
                </label>
              );
            })}
          </div>
          {formik.touched.generationAllow && formik.errors.generationAllow && (
            <span className="text-red-400 text-xs">{formik.errors.generationAllow}</span>
          )}
        </div>
      ),
      validationFields: ['generationAllow'],
    },
    {
      title: 'Legendaries & Mythicals',
      fields: (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Allow Legendaries & Mythicals</label>
          <div className="flex flex-wrap gap-4">
            {[
              {
                name: 'allowLegendaries',
                label: 'Allow Legendaries',
              },
              {
                name: 'allowMythicals',
                label: 'Allow Mythicals',
              },
            ].map(({ name, label }) => {
              const isChecked = formik.values[name as keyof BattleRoomFormValues] as boolean;
              return (
                <label
                  key={name}
                  className={`cursor-pointer px-6 py-2 rounded-full border transition-all duration-200
              ${
                isChecked
                  ? 'bg-yellow-500 text-black border-yellow-700'
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
              }
            `}
                >
                  <input
                    type="checkbox"
                    name={name}
                    checked={isChecked}
                    onChange={formik.handleChange}
                    className="hidden"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </div>
      ),
      validationFields: ['allowLegendaries', 'allowMythicals'],
    },
    {
      title: 'Banned Types',
      fields: (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Banned Types</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pokemonTypes.map((type) => {
              const isChecked = formik.values.bannedTypes.includes(type);
              return (
                <label
                  key={type}
                  className={`cursor-pointer text-center px-4 py-1.5 rounded-full border text-sm transition-all duration-200
              ${
                isChecked
                  ? 'bg-pink-600 text-white border-pink-800'
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
              }
            `}
                >
                  <input
                    type="checkbox"
                    name="bannedTypes"
                    value={type}
                    checked={isChecked}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      formik.setFieldValue(
                        'bannedTypes',
                        checked
                          ? [...formik.values.bannedTypes, value]
                          : formik.values.bannedTypes.filter((t) => t !== value)
                      );
                    }}
                    className="hidden"
                  />
                  {type}
                </label>
              );
            })}
          </div>
        </div>
      ),
      validationFields: ['bannedTypes'],
    },
    {
      title: 'Team Selection Time',
      fields: (
        <div className="flex flex-col gap-1">
          <label htmlFor="teamSelectTime" className="text-sm font-semibold">
            Team Select Time (minutes)
          </label>
          <input
            id="teamSelectTime"
            name="teamSelectTime"
            type="number"
            min={1}
            max={30}
            value={formik.values.teamSelectTime / 60}
            onChange={(e) => formik.setFieldValue('teamSelectTime', Number(e.target.value) * 60)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formik.touched.teamSelectTime && formik.errors.teamSelectTime && (
            <span className="text-red-400 text-xs">{formik.errors.teamSelectTime}</span>
          )}
        </div>
      ),
      validationFields: ['teamSelectTime'],
    },
  ];

  const handleNext = async () => {
    const currentStepFields = steps[currentStep].validationFields;
    const errors = await formik.validateForm();
    const hasErrors = currentStepFields.some(
      (field) => errors[field as keyof BattleRoomFormValues]
    );

    if (!hasErrors) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Manually touch fields to show errors
      currentStepFields.forEach((field) => {
        formik.setFieldTouched(field, true);
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <AnimatedBox className="w-full max-w-4xl mx-auto" animation={dropAnimation}>
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 bg-[#1e1e2f]/30 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 text-white"
      >
        <h2 className="text-2xl font-bold text-white mb-2 text-center sm:text-left">
          {steps[currentStep].title}
        </h2>

        {steps[currentStep].fields}

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Previous
            </button>
          )}

          {currentStep < steps.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 ml-auto"
            >
              Next
            </button>
          )}

          {currentStep === steps.length - 1 && (
            <button
              type="submit"
              className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Create Room
            </button>
          )}
        </div>
      </form>
    </AnimatedBox>
  );
};

export default BattleRoomForm;
