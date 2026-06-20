import {
  Bell,
  Database,
  Mail,
  Palette,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

export const profileSettings = [
  {
    label: "Имя",
    value: "Иван Иванов",
  },
  {
    label: "Email",
    value: "ivan@example.com",
  },
];

export const preferenceItems = [
  {
    title: "Стиль адаптации",
    description: "Как сервис будет переписывать резюме по умолчанию.",
    value: "Сохранять стиль автора",
    icon: SlidersHorizontal,
  },
  {
    title: "Тема интерфейса",
    description: "Сейчас управляется через переключатель в шапке.",
    value: "Системная / ручная",
    icon: Palette,
  },
  {
    title: "Email-уведомления",
    description: "Оповещения о готовности анализа и адаптаций.",
    value: "Включены",
    icon: Bell,
  },
];

export const securityItems = [
  {
    title: "Авторизация",
    description: "Вход по ссылке на email без пароля.",
    icon: Shield,
  },
  {
    title: "Хранение резюме",
    description: "Файлы будут доступны только владельцу аккаунта.",
    icon: Database,
  },
  {
    title: "Контактный email",
    description: "Используется для входа и сервисных уведомлений.",
    icon: Mail,
  },
];

export const futureSettings = [
  "язык резюме по умолчанию",
  "желаемая должность",
  "стиль коммуникации",
  "шаблон итогового файла",
  "управление подпиской",
];