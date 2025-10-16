"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectDto {
  id: number;
  title: string;
  link?: string;
}

export function Select({
  data,
  className,
}: {
  data: SelectDto[];
  className?: string;
}) {
  const [select, setSelect] = useState<string>("Выберите");
  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <div className={cn("relative w-56", className)}>
      <div
        onClick={() => setOpen(!isOpen)}
        className={`bg-[#eef2f5] px-4 py-2 cursor-pointer rounded-2xl flex justify-between items-center transition-all select-none ${
          isOpen ? "rounded-b-none" : "rounded-2xl"
        }`}
      >
        {select}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute top-full left-0 w-full bg-[#eef2f5] rounded-b-2xl shadow-md border-t border-gray-300/40 overflow-hidden z-10 select-none"
          >
            {data.map((obj) => (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setSelect(obj.title);
                  setOpen(false);
                }}
              >
                {obj.title}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
