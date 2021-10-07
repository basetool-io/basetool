export const getBrowserTimezone = () => window ? window.Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
export const dateTimeFormat = "dd/LL/yyyy HH:mm:ss";
export const dateFormat = "dd/LL/yyyy";
