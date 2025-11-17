import {
  CreateIslandDto,
  CreateListIsland,
} from "@/src/widgets/CreatePage/CreateListIsland";

const links: CreateIslandDto[] = [
  { id: 1, title: "Пользователи", icon: "User", href: "create/user" },
  { id: 2, title: "Группы", icon: "Users", href: "create/groups" },
  { id: 3, title: "Предметы", icon: "GraduationCap", href: "create/subjects" },
  // { id: 4, title: "Тесты", icon: "BookOpenCheck", href: "create/tests" },
  // { id: 5, title: "Лекции", icon: "BookOpen", href: "create/lectures" },
  { id: 6, title: "Уведомления", icon: "Bell", href: "create/notifications" },
];

export function CreatePage() {
  return (
    <div className="grid grid-cols-2 gap-5 container mx-auto">
      {links.map((obj: CreateIslandDto) => (
        <CreateListIsland key={obj.id} data={obj} />
      ))}
    </div>
  );
}
