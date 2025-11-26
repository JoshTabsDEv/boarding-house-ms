"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { Listing } from "@/types/listing";

const emptyForm = {
  name: "",
  location: "",
  price: "",
  rooms: "",
  status: "available",
  description: "",
};

type FormState = typeof emptyForm;

export default function Home() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginState, setLoginState] = useState({ username: "admin", password: "admin" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const isAdmin = session?.user?.role === "admin";

  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    setError(null);
    try {
      const response = await fetch("/api/listings");
      if (!response.ok) {
        throw new Error("Unable to load listings");
      }
      const data: Listing[] = await response.json();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    const result = await signIn("credentials", {
      redirect: false,
      username: loginState.username,
      password: loginState.password,
    });

    if (result?.error) {
      setLoginError("Invalid admin credentials");
    }
  };

  const resetForm = () => {
    setFormState(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...formState,
      price: Number(formState.price),
      rooms: Number(formState.rooms),
    };

    try {
      const response = await fetch(editingId ? `/api/listings/${editingId}` : "/api/listings", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "Unable to save listing");
      }

      const updatedListing: Listing = await response.json();
      setListings((previous) => {
        if (editingId) {
          return previous.map((listing) => (listing.id === updatedListing.id ? updatedListing : listing));
        }
        return [updatedListing, ...previous];
      });

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this listing?")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Unable to delete listing");
      }
      setListings((previous) => previous.filter((listing) => listing.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete listing");
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setFormState({
      name: listing.name,
      location: listing.location,
      price: String(listing.price),
      rooms: String(listing.rooms),
      status: listing.status,
      description: listing.description ?? "",
    });
  };

  const dashboardTitle = useMemo(() => {
    if (isAdmin) return "Admin Dashboard";
    if (session?.user) return "Resident Dashboard";
    return "Boarding House Management";
  }, [isAdmin, session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-700">Preparing your dashboard…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white/95 p-10 shadow-2xl">
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Boarding House</p>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in as admin or continue with Google as a resident</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">Admin Username</label>
              <input
                value={loginState.username}
                onChange={(event) => setLoginState((prev) => ({ ...prev, username: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Admin Password</label>
              <input
                type="password"
                value={loginState.password}
                onChange={(event) => setLoginState((prev) => ({ ...prev, password: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
              />
            </div>
            {loginError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in as admin
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            OR
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            onClick={() => signIn("google")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Boarding House</p>
            <h1 className="text-2xl font-semibold text-slate-900">{dashboardTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">{session.user?.name ?? "Guest"}</p>
              <p className="text-xs uppercase tracking-widest text-slate-400">{session.user?.role}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

        {isAdmin && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Manage</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingId ? "Edit listing" : "Create new listing"}
                </h2>
              </div>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-sm font-semibold text-slate-500 underline underline-offset-4"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">Name</label>
                <input
                  required
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Location</label>
                <input
                  required
                  value={formState.location}
                  onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Monthly price</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={formState.price}
                  onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Rooms</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={formState.rooms}
                  onChange={(event) => setFormState((prev) => ({ ...prev, rooms: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Status</label>
                <select
                  value={formState.status}
                  onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">Notes</label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update listing" : "Create listing"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Inventory</p>
              <h2 className="text-xl font-semibold text-slate-900">Boarding houses</h2>
            </div>
            <button
              onClick={fetchListings}
              className="text-sm font-semibold text-slate-500 underline underline-offset-4"
            >
              Refresh
            </button>
          </div>

          {loadingListings ? (
            <p className="mt-6 text-sm text-slate-500">Loading listings…</p>
          ) : listings.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No boarding houses registered yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{listing.name}</h3>
                      <p className="text-sm text-slate-500">{listing.location}</p>
                    </div>
                    <StatusBadge status={listing.status} />
                  </div>
                  <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Monthly</p>
                      <p className="text-base font-semibold text-slate-900">
                        PHP {new Intl.NumberFormat().format(listing.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Rooms</p>
                      <p className="text-base font-semibold text-slate-900">{listing.rooms}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Updated</p>
                      <p className="text-base font-semibold text-slate-900">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {listing.description && (
                    <p className="mt-4 text-sm text-slate-600">{listing.description}</p>
                  )}

                  {isAdmin ? (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleEdit(listing)}
                        className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="rounded-lg border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs uppercase tracking-[0.4em] text-slate-400">
                      Viewing as resident (read-only)
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Listing["status"] }) {
  const isAvailable = status === "available";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-amber-500"}`} />
      {isAvailable ? "Available" : "Occupied"}
    </span>
  );
}
