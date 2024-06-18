import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

// Define the types for the items
interface Item {
  title: string;
  description: string;
  header: JSX.Element;
  className: string;
  icon: JSX.Element;
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
);

const items: Item[] = [
  {
    title: "The Dawn of Innovation",
    description: "Explore the birth of groundbreaking ideas and inventions.",
    header: <Skeleton />,
    className: "md:col-span-2 md:row-span-1",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "The Digital Revolution",
    description: "Dive into the transformative power of technology.",
    header: <Skeleton />,
    className: "md:col-span-1 md:row-span-2",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "The Art of Design",
    description: "Discover the beauty of thoughtful and functional design.",
    header: <Skeleton />,
    className: "md:col-span-1 md:row-span-1",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "The Digital Revolution",
    description: "Dive into the transformative power of technology.",
    header: <Skeleton />,
    className: "md:col-span-1 md:row-span-1",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "The Art of Design",
    description: "Discover the beauty of thoughtful and functional design.",
    header: <Skeleton />,
    className: "md:col-span-1 md:row-span-2",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "The Power of Communication",
    description:
      "Understand the impact of effective communication in our lives.",
    header: <Skeleton />,
    className: "md:col-span-2 md:row-span-1",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
];

function arrangeInBentoGrid(items: Item[], totalColumns: number) {
  const columns: Item[][] = Array.from({ length: totalColumns }, () => []);

  items.forEach((item) => {
    const colSpan = item.className.includes("md:col-span-2") ? 2 : 1;
    const rowSpan = item.className.includes("md:row-span-2") ? 2 : 1;

    let minColIndex = 0;
    let minColSpan = columns[0].reduce(
      (acc, curr) => acc + (curr.className.includes("md:col-span-2") ? 2 : 1),
      0
    );

    for (let i = 1; i < totalColumns; i++) {
      const currentColSpan = columns[i].reduce(
        (acc, curr) => acc + (curr.className.includes("md:col-span-2") ? 2 : 1),
        0
      );
      if (currentColSpan < minColSpan) {
        minColIndex = i;
        minColSpan = currentColSpan;
      }
    }

    columns[minColIndex].push({ ...item, className: item.className });
  });

  return columns;
}

export function PostCard() {
  const totalColumns = 3;
  const bentoGrid = arrangeInBentoGrid(items, totalColumns);

  return (
    <BentoGrid className=" mx-auto md:.auto-rows-20rem md:grid md:grid-cols-3 gap-4 mt-10">
      {bentoGrid.map((column, colIndex) => (
        <div key={colIndex} className="space-y-4">
          {column.map((item, itemIndex) => (
            <BentoGridItem
              key={itemIndex}
              title={item.title}
              description={item.description}
              header={item.header}
              className={item.className}
              icon={item.icon}
            />
          ))}
        </div>
      ))}
    </BentoGrid>
  );
}
