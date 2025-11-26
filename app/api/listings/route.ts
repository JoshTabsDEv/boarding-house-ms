import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createListing, getListings } from "@/lib/listing-service";
import { listingSchema } from "@/lib/validation";

export async function GET() {
  const listings = await getListings();
  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = listingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const created = await createListing(parsed.data);
  return NextResponse.json(created, { status: 201 });
}


