import { Button } from "@/src/shared/ui/Button";
import { ButtonTypeEnum } from "@/src/shared/ui/Button/Button";

export interface ProgressCartDto {
  title: string;
  href: string;
  totalGrade: number;
  completedTests: number;
  totalTests: number;
}

export function ProgressCart({ data }: { data: ProgressCartDto }) {
  return (
    <div className="">
      <div className="bg-white rounded-2xl flex-0 w-[250px] h-[180px] p-4 flex flex-col justify-between">
        <div className="flex gap-2 justify-between h-full">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold">{data.title}</div>
            <div className="text-xs">Назнач. тесты: {data.totalTests}</div>
            <div className="text-xs">Выполнено: {data.completedTests}</div>
          </div>
          <div className={`flex items-center h-full`}>
            <div
              className={`${
                Number(data.totalGrade) > 80
                  ? "border-green-300"
                  : Number(data.totalGrade) > 50
                  ? "border-amber-300"
                  : "border-red-400"
              } rounded-full p-4 border-5 aspect-square w-16 h-16 `}
            >
              {data.totalGrade}
            </div>
          </div>
        </div>
        <Button
          type={ButtonTypeEnum.BLACK}
          text="Подробнее"
          className="h-fit w-full text-center mt-4"
        />
      </div>
    </div>
  );
}
