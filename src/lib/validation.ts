import { z } from "zod";

export const listingSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(120),
  location: z.string().min(3, "Location must be at least 3 characters").max(120),
  price: z.coerce.number().positive("Price must be greater than zero"),
  rooms: z.coerce.number().int().positive("Rooms must be greater than zero"),
  status: z.enum(["available", "occupied"]),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .default(""),
});

export type ListingPayload = z.infer<typeof listingSchema>;

