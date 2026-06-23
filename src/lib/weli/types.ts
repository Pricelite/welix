export type WeliExpertise =
  | "Expert Devis"
  | "Expert Facturation"
  | "Expert Commercial"
  | "Expert Chantier"
  | "Expert Clients"
  | "Expert Administratif"
  | "Expert Planning"
  | "Expert Analyse"
  | "Expert Productivité"
  | "Expert Welix";

export type WeliQuickAction = {
  id: string;
  label: string;
  prompt: string;
};

export type WeliMemoryCategory =
  | "preference"
  | "pricing"
  | "writing"
  | "supplier"
  | "workflow"
  | "customer-care";

export type WeliMemoryItem = {
  id: string;
  label: string;
  value: string;
  category: WeliMemoryCategory;
  createdAt: string;
};

export type WeliSuggestedAction = {
  id: string;
  label: string;
  description: string;
  kind:
    | "create-quote"
    | "create-client"
    | "open-clients"
    | "open-quotes"
    | "open-billing"
    | "review-margin"
    | "draft-email";
};

export type WeliPageProfile = {
  pageLabel: string;
  title: string;
  bubble: string;
  opening: string;
  expertise: WeliExpertise;
  objective: string;
  quickActions: WeliQuickAction[];
  proactiveHints: string[];
  suggestedActions: WeliSuggestedAction[];
};

export type WeliWorkspaceSnapshot = {
  companyName: string | null;
  trade: string | null;
  userName: string | null;
  clientCount: number;
  quoteCount: number;
  invoiceCount: number;
  revenue: number;
  latestClients: Array<{
    id: string;
    name: string;
    city: string | null;
  }>;
  latestQuotes: Array<{
    id: string;
    quoteNumber: string;
    clientName: string;
    status: string;
    total: number;
  }>;
  latestInvoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    status: string;
    total: number;
  }>;
};

export type WeliActiveClientContext = {
  id: string;
  name: string;
  city: string | null;
  email: string | null;
  contact: string | null;
};

export type WeliActiveQuoteContext = {
  id: string;
  quoteNumber: string;
  clientId: string | null;
  clientName: string;
  status: string;
  total: number;
  trade: string | null;
};

export type WeliActiveContext = {
  client: WeliActiveClientContext | null;
  quote: WeliActiveQuoteContext | null;
};

export type WeliCopilotContext = {
  pathname: string;
  page: WeliPageProfile;
  memory: WeliMemoryItem[];
  workspace?: WeliWorkspaceSnapshot | null;
  activeContext?: WeliActiveContext | null;
};

export type WeliReply = {
  content: string;
  expertise: WeliExpertise;
  suggestedAction?: WeliSuggestedAction;
  memoryToSave?: Omit<WeliMemoryItem, "id" | "createdAt">;
};
