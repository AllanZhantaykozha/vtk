import { Statistic } from "@/src/entities/Test/types";
import { Button } from "@/src/shared/ui/Button";
import { ButtonTypeEnum } from "@/src/shared/ui/Button/Button";

export function ProgressCart({ data }: { data: Statistic }) {
  return (
    <div className="">
      <div className="bg-white rounded-2xl flex-0 w-[250px] h-[180px] p-4 flex flex-col justify-between">
        <div className="flex gap-2 justify-between h-full">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold">{data.subjectName}</div>
            <div className="text-xs">Назнач. тесты: {data.totalTests}</div>
            <div className="text-xs">Выполнено: {data.totalSubmissions}</div>
          </div>
          <div className={`flex items-center h-full`}>
            <div
              className={`${
                Number(data.totalSubmissions) > 80
                  ? "border-green-300"
                  : Number(data.totalSubmissions) > 50
                  ? "border-amber-300"
                  : "border-red-400"
              } rounded-full p-4 border-5 aspect-square w-16 h-16 text-center `}
            >
              {data.averageGrade}
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
