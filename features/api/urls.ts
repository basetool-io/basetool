export const urls = () => {
  let baseUrl = "";

  if (typeof window !== "undefined" && window?.location?.origin) {
    // If we can get it from the window object, use that.
    baseUrl = window.location.origin;
  } else {
    // By default we should use the BASE_URL.
    baseUrl = `https://${process.env.BASE_URL}`;

    // If we're on vercel and not production, we should read the custom deployment url.
    if (process.env.VERCEL && process.env.VERCEL_ENV !== 'production') {
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      } else {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      }
    }
  }

  const apiUrl = `${baseUrl}/api`;

  return { baseUrl, apiUrl };
};

export const { baseUrl } = urls();
export const { apiUrl } = urls();
