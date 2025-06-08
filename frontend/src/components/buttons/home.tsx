"use client";
import { liftAnimation } from "@/motion/axis";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Image from 'next/image';
import pb from '@/assests/pb.svg'
import { GrTrophy } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { Routes } from "@/lib/routes";


const HomeButtons = () => {
    const router = useRouter();
    const navigate = (route: string) => {
        router.push(route);
    }
    return (
        <motion.div
      {...liftAnimation}
      transition={{duration: 1,delay: 1.7}}
       className="flex flex-col px-2 items-center justify-center gap-4 md:flex-row w-full md:w-1/2">
        <Button
          onClick={() => navigate(Routes.Pokedex)}
          size="lg"
          variant="secondary"
          className="w-full md:w-1/2 gap-6"
        >
        <Image 
            priority
            src={pb}
            alt="PokeDex icon"
            className="w-6 h-6"
          />
          PokeDex
        </Button>
        <Button
          size="lg"
          className="w-full md:w-1/2 gap-6"
        >
        <GrTrophy className="w-6 h-6 text-amber-300"/>
          League Stats
          
        </Button>
    </motion.div>
    )
}
export default HomeButtons;
