export const WELI_CREATE_QUOTE_STORAGE_KEY = "welix:weli:create-quote";
export const WELI_CREATE_CLIENT_STORAGE_KEY = "welix:weli:create-client";
export const WELI_OPEN_QUOTE_STORAGE_KEY = "welix:weli:open-quote";
export const WELI_OPEN_CLIENT_STORAGE_KEY = "welix:weli:open-client";
export const WELI_DRAFT_EMAIL_STORAGE_KEY = "welix:weli:draft-email";

export type WeliQuotePrefill = {
  prompt?: string;
  clientId?: string;
};

export type WeliOpenEntityPayload = {
  mode: "create" | "edit";
  id?: string;
};
