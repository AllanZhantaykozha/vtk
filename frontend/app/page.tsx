import { NewsList } from "@/components/ux/news-list";
import { News } from "@/components/types/news.type";
import { Information } from "@/components/ux/information";
const news: News[] = [
  {
    title: "Запуск нового кампуса",
    content:
      "Сегодня открылся новый кампус колледжа с современными аудиториями и лабораториями.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2025-09-01T10:00:00Z",
  },
  {
    title: "IT-конференция в Астане",
    content:
      "Собрались более 500 специалистов в сфере IT для обсуждения будущего технологий.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-02T12:30:00Z",
    updatedAt: "2025-09-02T12:30:00Z",
  },
  {
    title: "Победа студентов",
    content:
      "Команда колледжа заняла первое место в хакатоне по искусственному интеллекту.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-03T15:45:00Z",
    updatedAt: "2025-09-03T15:45:00Z",
  },
  {
    title: "Обновление библиотеки",
    content:
      "В библиотеке добавили более 200 новых книг по программированию и бизнесу.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-04T09:00:00Z",
    updatedAt: "2025-09-04T09:00:00Z",
  },
  {
    title: "Новый спортзал",
    content:
      "Студенты теперь могут заниматься в новом спортзале с современными тренажёрами.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-05T08:20:00Z",
    updatedAt: "2025-09-05T08:20:00Z",
  },
  {
    title: "Волонтёрская акция",
    content: "Студенты приняли участие в экологической акции по уборке леса.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-06T11:10:00Z",
    updatedAt: "2025-09-06T11:10:00Z",
  },
  {
    title: "Стажировки в IT-компаниях",
    content:
      "Открыта регистрация на стажировки в ведущих IT-компаниях Казахстана.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-07T14:00:00Z",
    updatedAt: "2025-09-07T14:00:00Z",
  },
  {
    title: "Новый курс по маркетингу",
    content: "Запущен курс по цифровому маркетингу для студентов 2–3 курсов.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-08T16:40:00Z",
    updatedAt: "2025-09-08T16:40:00Z",
  },
  {
    title: "Выставка проектов студентов",
    content: "Студенты представили свои IT-проекты на ежегодной выставке.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-09T13:15:00Z",
    updatedAt: "2025-09-09T13:15:00Z",
  },
  {
    title: "Новые ноутбуки",
    content: "Колледж закупил 100 новых ноутбуков для учебных аудиторий.",
    image: "https://picsum.photos/400/300",
    createdAt: "2025-09-10T17:50:00Z",
    updatedAt: "2025-09-10T17:50:00Z",
  },
];

export default function Home() {
  return (
    <div className="">
      <div className="grid gap-20">
        <NewsList news={news} />
        <div className="bg-slate-200 mx-10 px-10 py-10 rounded-2xl">
          <Information />
        </div>
        <div className="container mx-auto">
          <div className="">Войти</div>
          <div className=""></div>
        </div>
      </div>
    </div>
  );
}
