/**
 * Member LK — Tilda `/members/lk` (page 44958479) shell contract.
 * Visual/IA: docs/discovery/MEMBERS_LK_BASELINE.md
 */

export const MEMBERS_LK_PATH = "/members/lk" as const;
export const MEMBERS_LOGIN_PATH = "/agent/login" as const; // magic-link until Postbox + /members/login

export type LkPanelId =
  | "info"
  | "check"
  | "agent"
  | "purchases"
  | "shop"
  | "statuses";

export const LK_NAV: { id: LkPanelId; label: string }[] = [
  { id: "info", label: "Инфо" },
  { id: "check", label: "Загрузить чек" },
  { id: "agent", label: "Агент" },
  { id: "purchases", label: "Покупки" },
  { id: "shop", label: "Магазин" },
  { id: "statuses", label: "Статусы" },
];

/** Venue select from Tilda checkupload form (ZB 716215408). */
export const LK_BUY_PLACES = [
  "Ашан",
  "Атак",
  "Беру Выходной",
  "Бирхаус",
  "Винлаб",
  "ВкусВилл",
  "Глобус",
  "Дикси",
  "Лента",
  "Магнит",
  "ОКЕЙ",
  "Перекрёсток",
  "Пятёрочка",
  "Хмель и Солод",
  "Яблоко",
  "Ярче!",
  "SPAR",
  "Gletcher Brewery",
  "SVAM Group",
  "Другой",
] as const;

/**
 * Observed Tilda copy: +1 level per 1000 earned bircoins.
 * Prize/status ladder formulas remain Open — show level only as provisional.
 */
export const LK_LEVEL_STEP_BIRCOINS = 1000;

export const LK_INFO_COPY = {
  levelsIntro:
    "За каждый новый уровень — ценные призы от нашей пивоварни!",
  levelsBody:
    "Повышайте свой уровень на +1 за каждую новую 1000 заработанных биркоинов. Каждый пятый (юбилейный) уровень повышает ваш статус и вы получаете ценные призы от нашей пивоварни. Главный приз — годовое снабжение пивом.",
  friendsTitle: "С друзьями выгоднее!",
  friendsBody:
    "Для каждого Агента Gletcher генерируется уникальная реферальная ссылка. Приглашённые по ней и зарегистрировавшиеся друзья, при покупках Gletcher, начисляют 1% от суммы своих покупок на счёт пригласившего.",
  bircoinTitle: "1 ₿ = 1 ₽",
  bircoinBody:
    "Биркоин — виртуальная валюта: покупки в магазине, экскурсии, гастро-туры Brewer's House и спецпредложения партнёров.",
  checkTitle: "Зарегистрировать офлайн покупку",
  checkBody:
    "Загружайте чеки офлайн-покупок пива Gletcher и получайте 5% от суммы товаров Gletcher на биркоин-кошелёк. Засчитываются чеки с QR-кодом.",
  prizesContactName: "Алексей Котельников",
  prizesContactPhone: "+7 (963) 921 10 51",
  prizesContactNote: "По поводу получения призов и другим вопросам",
} as const;
