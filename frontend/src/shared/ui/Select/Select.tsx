"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Group } from "@/src/entities/Group/types";

export function Select({
  data,
  selectedGroupId,
  onChange,
  className,
}: {
  data: Group[];
  selectedGroupId?: number;
  onChange: (id: number | undefined) => void;
  className?: string;
}) {
  const [select, setSelect] = useState<string>(
    selectedGroupId
      ? data.find((g) => g.id === selectedGroupId)?.name || "Выберите"
      : "Выберите"
  );
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleSelect = (id: number) => {
    const group = data.find((g) => g.id === id);
    if (group) {
      setSelect(group.name);
      onChange(id);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setSelect("Выберите");
    onChange(undefined);
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        onClick={() => setOpen(!isOpen)}
        className={`bg-[#eef2f5] px-4 py-2 cursor-pointer rounded-2xl w-full flex justify-between items-center transition-all select-none ${
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
            {data?.map((obj) => (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSelect(obj.id)}
              >
                {obj.name}
              </motion.div>
            ))}
            {selectedGroupId && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors border-t"
                onClick={handleClear}
              >
                Очистить выбор
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
