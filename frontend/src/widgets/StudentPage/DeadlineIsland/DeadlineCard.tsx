import { Deadline } from "@/src/shared/lib/stores/deadlineStore";
import { Button } from "@/src/shared/ui/Button";
import { ButtonVariantEnum } from "@/src/shared/ui/Button/Button";
import { Clock, FileCheck, SquareCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function DeadlineCard({ data }: { data: Deadline }) {
  const date = new Date(data.dueDate);
  const isOverdue = data.status === "overdue" || date < new Date();

  const route = useRouter();

  const [text, setText] = useState("");

  useEffect(() => {
    function calc() {
      const target = new Date(data.dueDate);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setText("просрочен");
        return;
      }

      const mins = Math.floor(diff / (1000 * 60));
      const days = Math.floor(mins / (60 * 24));
      const hours = Math.floor((mins % (60 * 24)) / 60);
      const minutes = mins % 60;

      setText(`${days} дней ${hours} часов ${minutes} минут`);
    }

    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [data.dueDate]);

  return (
    <div className="bg-white rounded-3xl p-4 w-full max-w-sm min-w-xs  border relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            {data.type === "task" ? (
              <FileCheck className="w-5 h-5 text-gray-600" />
            ) : (
              <SquareCheckBig className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-800">
            {data.type === "task" ? "Задание по" : "Тест по"} {data.subject}
          </h3>
        </div>
      </div>

      <div className="space-y-2 relative z-10 text-xs text-gray-600">
        <div className="text-lg text-black">{data.title}</div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Дедлайн через {text}</span>
        </div>
      </div>

      <Button
        variant={isOverdue ? ButtonVariantEnum.GRAY : ButtonVariantEnum.BLACK}
        text={isOverdue ? "Просрочено" : "Открыть"}
        className="h-fit w-full text-center mt-4"
        onClick={async () =>
          route.push(
            `student/${data.type === "task" ? "tasks" : "tests"}/${data.id}`
          )
        }
      />
    </div>
  );
}
