import { Target, Transition } from 'framer-motion';

export interface MotionAnimation {
  initial: Target;
  animate: Target;
  transition: Transition;
}
