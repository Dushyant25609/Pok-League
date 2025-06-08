// components/wrapper/DataBoxWrapper.tsx
"use client";

import { FC, useState } from "react";
import DataBox from "@/components/box/data";
import { highlight } from "@/types/highlight";

interface DataBoxWrapperProps {
  features: highlight[];
  className?: string;
}

const DataBoxWrapper: FC<DataBoxWrapperProps> = ({ features, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={className}>
      {features.map((feature, index) => (
        <DataBox
          key={index}
          index={index}
          highlight={feature}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          delay={(index + 1) * 0.5}
          xAxisAnimation={index % 2 === 0 ? -200 : 200}
        />
      ))}
    </div>
  );
};

export default DataBoxWrapper;
