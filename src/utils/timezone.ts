const RU_TZ_TO_IANA: Record<string, string> = {
  калининград: "Europe/Kaliningrad",
  москва: "Europe/Moscow",
  самара: "Europe/Samara",
  екатеринбург: "Asia/Yekaterinburg",
  омск: "Asia/Omsk",
  красноярск: "Asia/Krasnoyarsk",
  иркутск: "Asia/Irkutsk",
  якутск: "Asia/Yakutsk",
  владивосток: "Asia/Vladivostok",
  магадан: "Asia/Magadan",
  "петропавловск-камчатский": "Asia/Kamchatka",
  "петропавловск камчатский": "Asia/Kamchatka",
  камчатка: "Asia/Kamchatka",
};

export function resolveTimeZone(input?: string | null): string {
  if (!input) return "Europe/Moscow";
  const normalized = input.trim().toLowerCase();

  if (normalized.includes("/")) return input;

  return RU_TZ_TO_IANA[normalized] ?? "Europe/Moscow";
}

export function getZonedNowParts(timeZone: string): {
  hours: number;
  minutes: number;
  seconds: number;
  date: number;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  });
  const parts = formatter.formatToParts(now);
  const toNum = (name: string) =>
    Number(parts.find((p) => p.type === name)?.value ?? 0);
  const hours = toNum("hour");
  const minutes = toNum("minute");
  const seconds = toNum("second");

  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    timeZone,
  });
  const dateParts = dateFormatter.formatToParts(now);
  const date = Number(dateParts.find((p) => p.type === "day")?.value ?? 1);

  return { hours, minutes, seconds, date };
}
