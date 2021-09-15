import React from "react";

const OrganizationContext = React.createContext({id: "", name: ""}); // add a "default" org so it doesn't squack later.

export const OrganizationProvider = OrganizationContext.Provider;

export default OrganizationContext;
