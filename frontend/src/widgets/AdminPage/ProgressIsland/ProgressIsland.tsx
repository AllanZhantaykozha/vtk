import { Button, ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { ProgressCart, ProgressCartDto } from "./ProgressCart";
import { Select } from "@/src/shared/ui/Select";

export const progressCartMock: ProgressCartDto[] = [
  {
    title: "Основы программирования",
    href: "/courses/programming-basics",
    totalGrade: 87,
    completedTests: 7,
    totalTests: 10,
  },
  {
    title: "Алгоритмы и структуры данных",
    href: "/courses/algorithms",
    totalGrade: 93,
    completedTests: 5,
    totalTests: 6,
  },
  {
    title: "Базы данных",
    href: "/courses/databases",
    totalGrade: 78,
    completedTests: 3,
    totalTests: 5,
  },
  {
    title: "Веб-разработка",
    href: "/courses/web-dev",
    totalGrade: 91,
    completedTests: 8,
    totalTests: 9,
  },
  {
    title: "Операционные системы",
    href: "/courses/os",
    totalGrade: 44,
    completedTests: 4,
    totalTests: 5,
  },
];

const select = [
  {
    id: 1,
    title: "Apple",
    link: "/",
  },
  {
    id: 2,
    title: "Orange",
    link: "/",
  },
  {
    id: 3,
    title: "Melon",
    link: "/",
  },
  {
    id: 4,
    title: "Watermelon",
    link: "/",
  },
  {
    id: 5,
    title: "Peach",
    link: "/",
  },
];

export function ProgressIsland() {
  return (
    <Island className="h-fit w-fit" theme={IslandThemeEnum.BLUE}>
      <IslandHeader>
        <Icon icon="GraduationCap" theme={IconThemeEnum.WHITE} />
        <div className="text-white text-xl font-bold">Успеваемость</div>
        <Select data={select} className="w-[150px]" />
      </IslandHeader>
      <IslandContent className="grid grid-flow-col gap-5">
        <div className="overflow-x-auto custom-scroll pb-2">
          <div
            className="
              flex gap-5 
              scrollbar-hide
              scroll-smooth
              snap-x snap-mandatory
            "
          >
            {progressCartMock.map((obj: ProgressCartDto) => (
              <ProgressCart key={obj.href} data={obj} />
            ))}
          </div>
        </div>
      </IslandContent>
    </Island>
  );
}
