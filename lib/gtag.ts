import { googleAnalyticsUACode } from "./services";

export const pageview = (url: string) => {
  if (!(window as any)?.gtag) return;

  (window as any).gtag("config", googleAnalyticsUACode, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: any) => {
  if (!(window as any)?.gtag) return;

  (window as any).gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
