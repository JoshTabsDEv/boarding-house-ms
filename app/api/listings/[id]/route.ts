import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteListing, getListing, updateListing } from "@/lib/listing-service";
import { listingSchema } from "@/lib/validation";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function requireAdmin(session: Session | null) {
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }
  return null;
}

export async function GET(_: Request, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const listing = await getListing(id);

  if (!listing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const forbidden = requireAdmin(session);
  if (forbidden) {
    return forbidden;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  const existing = await getListing(id);

  if (!existing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = listingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = await updateListing(id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const forbidden = requireAdmin(session);
  if (forbidden) {
    return forbidden;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  const existing = await getListing(id);

  if (!existing) {
    return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  }

  await deleteListing(id);
  return NextResponse.json({ success: true });
}


