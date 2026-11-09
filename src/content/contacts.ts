/**
 * RU-only `/contacts`.
 * Provenance: docs/discovery/CONTACTS_PAGE_BASELINE.md
 */

export const CONTACTS_PATH = "/contacts" as const;

export const CONTACTS_PAGE = {
  path: CONTACTS_PATH,
  metaTitle: "Контакты | Пивоварня Глетчер",
  metaDescription: "Контакты",
  heroTitle: "Контакты",
  heroImage: {
    src: "/pages/contacts/img_3189.jpg",
    alt: "Пивоварня Gletcher",
  },
  companyName: "OOO «ГЛЕТЧЕР»",
  inn: "ИНН 7729664700",
  address: "141602, Московская область, г. Клин, ул. Терешковой, д.1 стр.2",
  people: [
    {
      role: "Бренд-менеджер",
      name: "Алексей Котельников",
      phone: "+7 (963) 921-10-51",
      phoneHref: "tel:+79639211051",
    },
  ],
  phones: [
    { label: "Офис", phone: "+7 (495) 989-24-14", href: "tel:+74959892414" },
    { label: "Магазин", phone: "+7 (929) 634-50-17", href: "tel:+79296345017" },
  ],
  emails: [
    { address: "info@svamgroup.ru", href: "mailto:info@svamgroup.ru" },
    {
      address: "info@gletcherbrewery.com",
      href: "mailto:info@gletcherbrewery.com",
    },
  ],
  travel: [
    {
      label: "Яндекс.Навигатор: Маршрут",
      href: "https://yandex.ru/maps/-/CCQxZTqdsC",
    },
    {
      label: "Расписание автобусов",
      href: "https://yandex.ru/maps/-/CCQxASSmkA",
    },
    {
      label: "Расписание электричек из Москвы",
      href: "https://rasp.yandex.ru/suburban/moscow--klin-station",
    },
  ],
  formTitle: "Свяжитесь с нами",
  formLead: "Будем рады ответить на любые ваши вопросы и предложения.",
  fields: {
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    city: "Город",
    company: "Юрлицо",
    comment: "Комментарий",
  },
  submit: "Отправить",
  pending: "Отправляем…",
  note: "Заявка сохраняется на сервере. Уведомление в рабочий Telegram отправляется отдельно.",
  accepted: "Заявка сохранена. Номер:",
  unavailable:
    "Сейчас не удалось сохранить заявку. Ваши данные остались в форме — свяжитесь напрямую:",
  networkError:
    "Сеть недоступна. Данные формы сохранены — повторите отправку или свяжитесь напрямую:",
  error: "Проверьте обязательные поля.",
} as const;
