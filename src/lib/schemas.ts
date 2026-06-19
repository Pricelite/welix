import { z } from "zod";

const optionalTrimmedText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined);

export const aiQuoteRequestSchema = z.object({
  prompt: z.string().trim().min(8, "Décris un peu plus précisément le besoin").max(2000),
});

export const quoteExtractionSchema = z.object({
  trade: z.string().trim().min(2).max(120),
  service: z.string().trim().min(2).max(160),
  surface: z.number().min(0).max(100000).nullable(),
  urgency: z.enum(["faible", "normale", "haute"]),
  materials: z.array(z.string().trim().min(1).max(80)).max(12),
  durationHours: z.number().min(0.5).max(400).nullable(),
  distanceKm: z.number().min(0).max(1000).nullable(),
});

export const createClientSchema = z.object({
  name: z.string().trim().min(2, "Le nom du client est obligatoire").max(160),
  contact: optionalTrimmedText(160),
  email: z.string().trim().email("Email invalide").max(200).optional().or(z.literal("")),
  city: optionalTrimmedText(120),
});

export const updateClientSchema = z
  .object({
    name: z.string().trim().min(2).max(160).optional(),
    contact: optionalTrimmedText(160),
    email: z.string().trim().email("Email invalide").max(200).optional().or(z.literal("")),
    city: optionalTrimmedText(120),
    archived: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, "Aucune modification fournie");

export const quoteStatusSchema = z.enum(["Brouillon", "Envoyé", "Accepté", "Refusé", "Payé"]);

export const quotePayloadSchema = z.object({
  clientId: z.string().uuid("Client invalide"),
  trade: z.string().trim().min(2).max(120),
  description: z.string().trim().min(8).max(3000),
  material: optionalTrimmedText(2000),
  labor: optionalTrimmedText(2000),
  estimatedTime: optionalTrimmedText(120),
  recommendedPrice: z.number().min(0).max(1_000_000),
  vatRate: z.number().min(0).max(100),
  vatAmount: z.number().min(0).max(1_000_000),
  total: z.number().min(0).max(1_000_000),
  status: quoteStatusSchema.optional(),
});

export const updateQuoteSchema = z
  .object({
    clientId: z.string().uuid().optional(),
    trade: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().min(8).max(3000).optional(),
    material: optionalTrimmedText(2000),
    labor: optionalTrimmedText(2000),
    estimatedTime: optionalTrimmedText(120),
    recommendedPrice: z.number().min(0).max(1_000_000).optional(),
    vatRate: z.number().min(0).max(100).optional(),
    vat: z.number().min(0).max(1_000_000).optional(),
    total: z.number().min(0).max(1_000_000).optional(),
    status: quoteStatusSchema.optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, "Aucune modification fournie");

export const stripeCheckoutSchema = z.object({
  plan: z.enum(["starter", "pro"]).default("pro"),
});

export const stripeManageSchema = z.object({
  action: z.enum(["upgrade", "downgrade", "cancel", "resume", "portal"]),
  priceId: z.string().trim().min(1).optional(),
});
