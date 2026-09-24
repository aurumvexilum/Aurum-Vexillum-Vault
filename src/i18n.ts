export type Locale = "en" | "es" | "fr" | "de" | "pt" | "zh";
export const translations: Record<Locale, Record<string, string>> = {
  en: { dashboard: "Dashboard", send: "Send", assets: "Assets", recovery: "Recovery", dapps: "dApps", trade: "Trade", refresh: "Refresh", totalValue: "Total value", activity: "Activity" },
  es: { dashboard: "Panel", send: "Enviar", assets: "Activos", recovery: "Recuperación", dapps: "dApps", trade: "Intercambiar", refresh: "Actualizar", totalValue: "Valor total", activity: "Actividad" },
  fr: { dashboard: "Tableau de bord", send: "Envoyer", assets: "Actifs", recovery: "Récupération", dapps: "dApps", trade: "Échanger", refresh: "Actualiser", totalValue: "Valeur totale", activity: "Activité" },
  de: { dashboard: "Dashboard", send: "Senden", assets: "Vermögen", recovery: "Wiederherstellung", dapps: "dApps", trade: "Handeln", refresh: "Aktualisieren", totalValue: "Gesamtwert", activity: "Aktivität" },
  pt: { dashboard: "Painel", send: "Enviar", assets: "Ativos", recovery: "Recuperação", dapps: "dApps", trade: "Trocar", refresh: "Atualizar", totalValue: "Valor total", activity: "Atividade" },
  zh: { dashboard: "仪表盘", send: "发送", assets: "资产", recovery: "恢复", dapps: "dApp", trade: "交易", refresh: "刷新", totalValue: "总价值", activity: "活动" },
};
export function translate(locale: Locale, key: string) { return translations[locale]?.[key] ?? translations.en[key] ?? key; }
