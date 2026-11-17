/**
 * Agent cabinet — product IA for `/agent/cabinet`.
 * Legacy Tilda `/members/lk` is handled only via next.config redirects (no page).
 * Layout: DESIGN_SYSTEM + task-first UX (balance → upload → history).
 */

/** Canonical cabinet URL (owner Confirmed). */
export const AGENT_CABINET_PATH = "/agent/cabinet" as const;
export const AGENT_LOGIN_PATH = "/agent/login" as const;

/** Own retail points (not Mapbox retail layers). */
export const CABINET_BRANDED_BUY_PLACES = [
  "Gletcher Brewery (Клин)",
  "SVAM Group (Москва)",
] as const;

export const CABINET_BUY_PLACE_OTHER = "Другой" as const;

export const CABINET_COPY = {
  kicker: "Агент Глетчер",
  title: "Кабинет",
  balanceHint: "Можно тратить на призы и спецпредложения",
  lifetimeHint: "всего начислено",
  uploadCta: "Загрузить чек",
  uploadTitle: "Новый чек",
  uploadLead:
    "5% биркоинами от суммы товаров Gletcher. Лучше фото с QR — так быстрее проверка.",
  historyTitle: "Недавние чеки",
  historyEmpty: "Пока пусто — загрузите первый чек выше.",
  progressTitle: "Статус",
  progressLead: "Растёт с накопленными ₿. Приз — за текущий статус.",
  statusLabel: "Статус",
  prizeLabel: "Приз",
  levelLabel: "Уровень",
  toNextLabel: "до следующего уровня",
  inviteTitle: "Пригласить друзей",
  inviteLead:
    "Ваша персональная ссылка на программу. Начисление за приглашения пока не подключено.",
  inviteCta: "Скопировать ссылку",
  inviteCopied: "Ссылка скопирована",
  agentTitle: "Стать агентом",
  agentLead:
    "Заявка по заведению — до 10 открытых одновременно (кроме «Одобрена» и «Отказано»). Статус и комментарий менеджера — в списке ниже.",
  agentSubmit: "Отправить заявку",
  agentSuccess: "Заявка принята — на рассмотрении",
  agentOpenLimit:
    "Лимит 10 открытых заявок. Дождитесь решения по текущим или обратитесь к менеджеру.",
  agentListTitle: "Ваши заявки",
  agentListEmpty: "Пока нет заявок.",
  agentPending: "«{venue}»: {status}",
  agentPublicNote: "Комментарий: {note}",
  moreTitle: "Скоро",
  moreShop: "Магазин призов и списание ₿",
  helpTitle: "Вопросы по призам",
  helpName: "Алексей Котельников",
  helpPhone: "+7 (963) 921 10 51",
  logout: "Выйти",
} as const;

/** Observed Make/Tilda agent form — useful enums, not UI chrome. */
export const CABINET_AGENT_VENUE_TYPES = [
  "Бар",
  "Ресторан",
  "Кафе",
  "Магазин",
  "Дистрибьютор",
  "Другое",
] as const;
