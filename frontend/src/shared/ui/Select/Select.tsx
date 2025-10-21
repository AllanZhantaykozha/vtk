"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Select<T extends { id: number }>({
  data,
  selectedId,
  onChange,
  getOptionLabel,
  className,
}: {
  data: T[];
  selectedId?: number;
  onChange: (id: number | undefined) => void;
  getOptionLabel?: (item: T) => string;
  className?: string;
}) {
  const resolveLabel =
    getOptionLabel ||
    ((item: T) => (item as any).name || (item as any).label || String(item.id));

  const [select, setSelect] = useState<string>(
    selectedId
      ? resolveLabel(data.find((item) => item.id === selectedId) || ({} as T))
      : "Выберите"
  );
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleSelect = (id: number) => {
    const item = data.find((item) => item.id === id);
    if (item) {
      setSelect(resolveLabel(item));
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
    <div className={cn("relative z-20", className)}>
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
            {data?.map((item) => {
              const itemId = item.id;
              return (
                <motion.div
                  key={itemId}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSelect(itemId)}
                >
                  {resolveLabel(item)}
                </motion.div>
              );
            })}
            {selectedId && (
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
