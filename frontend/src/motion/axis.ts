export const liftAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.5, ease: "easeInOut" },
};

export const dropAnimation = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.5, ease: "easeInOut" },
}

export const XaxisAnimation = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1, delay: 0.5, ease: "easeInOut" },
};

export const LeftToRightAnimation = {
  initial: { opacity: 0, x: -200 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay: 0.5, ease: "easeInOut" },
};

export const RightToLeftAnimation = {
  initial: { opacity: 0, x: 200 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay: 0.5, ease: "easeInOut" },
};
