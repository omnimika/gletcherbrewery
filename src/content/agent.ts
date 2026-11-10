/**
 * `/agent` — bonus program landing.
 * Provenance: Tilda page 44414247 (published), ZB records
 * 711680591 / 720411103 / 720628054 / 720648821 / 720675280 / 720952281.
 * Copy and media URLs Confirmed from MCP 03.11.2026. Do not invent rewards rules.
 */

export const AGENT_PATH = "/agent" as const;

export const AGENT_PAGE = {
  path: AGENT_PATH,
  metaTitle: "Агент Глетчер | Gletcher Brewery | Пивоварня Глетчер",
  metaDescription:
    "Бонусная и реферальная программа для ценителей пива. Стань амбассадором Gletcher и получай ценные призы от нашей пивоварни!",
  signupHref: "/members/signup",
  /** Spike: magic-link login until /members/login + Postbox. */
  loginHref: "/agent/login",
  videos: {
    bottle: {
      hevc: "https://files.gletcherbrewery.com/vid/comp-960-hevc-safari.mp4",
      webm: "https://files.gletcherbrewery.com/vid/comp-960-vp9-chrome.webm",
    },
    coin: {
      hevc: "https://files.gletcherbrewery.com/vid/coin-hevc-safari.mp4",
      webm: "https://files.gletcherbrewery.com/vid/coin-vp9-chrome.webm",
    },
    registration: {
      mp4: "https://files.gletcherbrewery.com/vid/registration.mp4",
      webm: "https://files.gletcherbrewery.com/vid/registration-vp9-chrome-l.webm",
    },
  },
  assets: {
    slogan: "/pages/agent/slogan-red.png",
    purchasesL: "/pages/agent/purchases-l.png",
    purchasesR: "/pages/agent/purchases-r.png",
    coins: [
      "/pages/agent/coin-1.png",
      "/pages/agent/coin-2.png",
      "/pages/agent/coin-3.png",
      "/pages/agent/coin-4.png",
      "/pages/agent/coin-5.png",
    ] as const,
    partners: [
      "/pages/agent/partner-1.png",
      "/pages/agent/partner-2.png",
      "/pages/agent/partner-3.png",
    ] as const,
    status: [
      "/pages/agent/status-1.png",
      "/pages/agent/status-2.png",
      "/pages/agent/status-3.png",
    ] as const,
  },
  hero: {
    title: "Стань агентом",
    brand: "gletcher",
    mobileLines: ["БУДЬ С НАМИ", "ПОЛУЧАЙ ПРИЗЫ"] as const,
    // Source order left → year → right (ZB lefts 20 / 790 / 875 @1200).
    pills: [
      "бонусная программа Gletcher Brewery",
      "2025",
      "БУДЬ С НАМИ – ПОЛУЧАЙ ПРИЗЫ",
    ] as const,
    cta: "зарегистрироваться",
  },
  purchases: {
    kicker: "регистируй",
    title: "ПОКУПКИ",
    titleGhost: "ПОКУПК",
    body: "Агент Gletcher – это бонусная программа для тех, кто неравнодушен к продукции пивоварни Gletcher Brewery",
    cta: "зарегистрироваться",
  },
  coins: {
    kicker: "ЗАРАБАТЫВАЙ",
    title: "БИРКОИНЫ",
    body: "Теперь пивооткрыватели и пивонтюристы всей страны смогут накапливать «биркоины» – уникальную валюту, которую можно обменивать на любимое пиво и крутые призы от Gletcher!",
    cta: "зарегистрироваться",
  },
  partner: {
    title: "ИГРАЙ ЗА НАС!",
    subtitle: "БУДЬ ПАРТНЁРОМ! СОУЧАСТВУЙ!",
    cards: [
      "ПРИМЕРЬ НА СЕБЯ РОЛЬ АМБАССАДОРА",
      "РАССКАЗЫВАЙ О GLETCHER В ЗАВЕДЕНИЯХ СВОЕГО ГОРОДА",
      "НАЛАЖИВАЙ ПОСТАВКИ И ПОЛУЧАЙ СВОЮ ДОЛЮ",
    ] as const,
    cta: "зарегистрироваться",
  },
  status: {
    kicker: "ПОДНИМАЙ",
    title: "СТАТУС",
    subtitle: "ПРИВИЛЕГИИ ДЛЯ САМЫХ АКТИВНЫХ АГЕНТОВ",
    cards: [
      "УЧАСТИЕ В ДЕГУСТАЦИЯХ И ГАСТРОТУРАХ",
      "РАЗРАБОТКА И ВАРКА АВТОРСКОГО СОРТА НА ПИВОВАРНЕ",
      "И ГЛАВНЫЙ ПРИЗ — ГОДОВОЙ ЗАПАС ПИВА!",
    ] as const,
    cta: "зарегистрироваться",
  },
  finale: {
    title: "Стань агентом gletcher",
    line1: "получай",
    line2: "призы",
    cta: "зарегистрироваться",
    login: "УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ",
    legal:
      "18+ Пейте культурно! Чрезмерное употребление алкоголя вредит вашему здоровью",
  },
} as const;

export type AgentPageCopy = typeof AGENT_PAGE;
