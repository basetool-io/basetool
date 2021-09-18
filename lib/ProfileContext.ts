import React from "react";

const ProfileContext = React.createContext({
  user: { email: "", firstName: "", lastName: "" },
  organizations: [],
  role: { name: "", options: {} },
}); // add a "default" org so it doesn't squack later.

export const ProfileProvider = ProfileContext.Provider;

export default ProfileContext;
