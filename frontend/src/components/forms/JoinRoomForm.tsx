'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/routes';
import useRoomStore from '@/store/room';
import AnimatedBox from '../animation/box';
import { dropAnimation } from '@/motion/axis';
import { joinBattleRoom } from '@/services/room';

interface JoinRoomFormValues {
  username: string;
  RoomCode: string;
}

export const JoinRoomForm = () => {
  const router = useRouter();

  const formik = useFormik<JoinRoomFormValues>({
    initialValues: {
      username: '',
      RoomCode: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      RoomCode: Yup.string().required('Room code is required'),
    }),
    onSubmit: async (values) => {
      // TODO: Implement join room API call
      try {
        const response = await joinBattleRoom(values.username, values.RoomCode);
        toast.success(`Joining room ${values.RoomCode}`);
        useRoomStore.setState({
          roomCode: values.RoomCode,
          username: values.username,
          status: response.status,
        });
        router.push(Routes.SelectionRoom.replace(':roomId', values.RoomCode));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'An error occurred while joining the room'
        );
      }
    },
  });

  return (
    <AnimatedBox className="w-full max-w-4xl mx-auto" animation={dropAnimation}>
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 bg-[#1e1e2f]/30 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 text-white"
      >
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

        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="RoomCode" className="text-sm font-semibold">
            Room Code
          </label>
          <input
            id="RoomCode"
            name="RoomCode"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.RoomCode}
            placeholder="ABC123"
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formik.touched.RoomCode && formik.errors.RoomCode && (
            <span className="text-red-400 text-xs">{formik.errors.RoomCode}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Join Room
        </button>
      </form>
    </AnimatedBox>
  );
};
