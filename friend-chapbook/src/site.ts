function envText(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export const site = {
  title: envText(import.meta.env.VITE_SITE_TITLE, "Chapbook"),
  kicker: envText(import.meta.env.VITE_SITE_KICKER, "On stage"),
  lede: envText(import.meta.env.VITE_SITE_LEDE, "A stage for songs and poems."),
};
