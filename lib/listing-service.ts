import type { RowDataPacket } from "mysql2";
import { execute, query } from "@/lib/db";
import type { Listing } from "@/types/listing";
import { listingSchema, type ListingPayload } from "@/lib/validation";

export type ListingRow = RowDataPacket & {
  id: number;
  name: string;
  location: string;
  price: number;
  rooms: number;
  status: string;
  description: string;
  created_at: Date;
};

const baseSelect =
  "SELECT id, name, location, price, rooms, status, description, created_at FROM listings";

export const mapListing = (row: ListingRow): Listing => ({
  id: row.id,
  name: row.name,
  location: row.location,
  price: row.price,
  rooms: row.rooms,
  status: row.status as Listing["status"],
  description: row.description,
  createdAt: row.created_at.toISOString(),
});

export async function getListings() {
  const rows = await query<ListingRow[]>(`${baseSelect} ORDER BY created_at DESC`);
  return rows.map(mapListing);
}

export async function getListing(id: number) {
  const [row] = await query<ListingRow[]>(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
  return row ? mapListing(row) : null;
}

export async function createListing(payload: ListingPayload) {
  const parsed = listingSchema.parse(payload);

  const result = await execute(
    "INSERT INTO listings (name, location, price, rooms, status, description) VALUES (?, ?, ?, ?, ?, ?)",
    [parsed.name, parsed.location, parsed.price, parsed.rooms, parsed.status, parsed.description ?? ""],
  );

  return getListing(result.insertId);
}

export async function updateListing(id: number, payload: ListingPayload) {
  const parsed = listingSchema.parse(payload);

  await execute(
    "UPDATE listings SET name = ?, location = ?, price = ?, rooms = ?, status = ?, description = ? WHERE id = ?",
    [
      parsed.name,
      parsed.location,
      parsed.price,
      parsed.rooms,
      parsed.status,
      parsed.description ?? "",
      id,
    ],
  );

  return getListing(id);
}

export async function deleteListing(id: number) {
  await execute("DELETE FROM listings WHERE id = ?", [id]);
}


