export type Listing = {
  id: number;
  name: string;
  location: string;
  price: number;
  rooms: number;
  status: "available" | "occupied";
  description: string | null;
  createdAt: string;
};


