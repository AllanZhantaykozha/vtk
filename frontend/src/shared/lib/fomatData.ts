export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  // Если менее часа
  if (diffHours < 1) {
    const minutes = Math.floor(diffMs / (1000 * 60));
    return `${minutes} мин назад`;
  }

  // Если менее суток
  if (diffHours < 24) {
    return `${diffHours} ${getHourWord(diffHours)} назад`;
  }

  // Если меньше 3 дней
  if (diffDays < 3) {
    return `${diffDays} ${getDayWord(diffDays)} назад`;
  }

  // Если больше 3 дней → формат "5 окт"
  const day = date.getDate();
  const monthNames = [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  const month = monthNames[date.getMonth()];

  return `${day} ${month}`;
}

function getHourWord(hours: number): string {
  if (hours % 10 === 1 && hours % 100 !== 11) return "час";
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100))
    return "часа";
  return "часов";
}

function getDayWord(days: number): string {
  if (days === 1) return "день";
  if ([2, 3, 4].includes(days)) return "дня";
  return "дней";
}
