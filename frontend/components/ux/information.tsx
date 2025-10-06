import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Information() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full  mx-auto container"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="py-3 cursor-pointer text-xl font-normal">О заочном отделении</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            Заочное отделение ГККП «Высший технический колледж, г. Кокшетау» предоставляет возможность получения качественного профессионального образования для тех, кто совмещает учебу с работой или другими обязанностями. Наши программы разработаны с учетом современных требований рынка труда и позволяют студентам гибко планировать свое обучение.
          </p>
          <p>Обучение на заочном отделении включает:</p>
            <ul className="list-disc pl-6">
                <li>Доступ к учебным материалам в электронном виде.</li>
                <li>Проведение сессий (занятий и экзаменов) по утвержденному расписанию.</li>
                <li>Индивидуальную поддержку со стороны преподавателей.</li>
                <li>Использование онлайн-платформы для сдачи заданий и тестов.</li>
            </ul>
          <p>Мы стремимся создать комфортные условия для обучения, обеспечивая студентов всей необходимой информацией и ресурсами.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="py-3 cursor-pointer text-xl font-normal">Контакты</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
           Для связи с администрацией заочного отделения используйте следующие контакты:
          </p>
            <ul className="list-disc pl-6">
                <li>Адрес: г. Кокшетау, ул. Примерная, д. 123.</li>
                <li>Телефон: +7 (7162) 12-34-56.</li>
                <li>Электронная почта: correspondence@vtcollege.kz.</li>
                <li>Часы работы: Пн–Пт: 09:00–17:00, Сб–Вс: выходной.</li>
            </ul>
          <p> Вы также можете воспользоваться формой обратной связи на нашем сайте для отправки вопросов или запросов.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="py-3 cursor-pointer text-xl font-normal">Правила обучения</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <ol className="list-decimal pl-4 gap-3 grid">
            <li>Регистрация и зачисление:</li>
            <ul className="list-disc pl-4">
                <li>Студенты обязаны подать полный комплект документов в установленные сроки.</li>
                <li>Зачисление проводится на основании результатов вступительных испытаний (при наличии).</li>
            </ul><li>Учебный процесс:</li>
             <ul className="list-disc pl-4">
                <li>Студенты должны посещать сессии согласно расписанию.</li>
                <li>Все задания и тесты сдаются через личный кабинет на сайте.</li>
                <li>Пропуск сроков сдачи заданий влечет снижение оценки, если иное не согласовано с преподавателем.</li>
            </ul><li>Экзамены и зачеты:</li>
             <ul className="list-disc pl-4">
                <li>Экзамены проводятся в очной или дистанционной форме (по решению администрации).</li>
                <li>Результаты экзаменов доступны в личном кабинете в течение 5 рабочих дней.</li>
               
            </ul><li>Поведение и дисциплина:</li>
             <ul className="list-disc pl-4">
                <li>Студенты обязаны соблюдать академическую честность.</li>
                <li>Нарушение правил (плагиат, списывание) влечет дисциплинарные меры, вплоть до отчисления.</li>
                
            </ul><li>Оплата обучения:</li>
             <ul className="list-disc pl-4">
                <li>Оплата производится согласно договору в установленные сроки.</li>
                <li>Задолженность может привести к приостановке доступа к учебным материалам.</li>
              
            </ul>
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
