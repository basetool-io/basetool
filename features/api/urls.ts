export const urls = () => {
  let baseUrl = "";

  if (typeof window !== "undefined" && window?.location?.origin) {
    baseUrl = window.location.origin;
  } else {
    baseUrl = `https://${process.env.BASE_URL}`;
  }

  const apiUrl = `${baseUrl}/api`;

  return { baseUrl, apiUrl };
};

export const { baseUrl } = urls();
export const { apiUrl } = urls();
