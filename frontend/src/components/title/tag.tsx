"use client";
import { LeftToRightAnimation, RightToLeftAnimation } from "@/motion/axis";
import { motion } from "framer-motion";
import { WordRotate } from "../magicui/word-rotate";

const TagTitle = () => {
  return (
    <div className="flex flex-col justify-center ">
      <motion.div
        {...LeftToRightAnimation}
        className="border-[#942d0a] border-1 md:border-2 py-[0.5]  rounded-lg w-full bg-orange-700"
      />
      <WordRotate
        words={["BATTLE ARENA"]}
        className="font-long self-center text-orange-700 text-stroke-2 text-3xl md:text-5xl"
      />
      <motion.div
        {...RightToLeftAnimation}
        className="border-[#942d0a] border-1 md:border-2 py-[0.5]  rounded-lg w-full bg-orange-700"
      />
    </div>
  );
};

export default TagTitle;
