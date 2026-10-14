import type { Property } from "../../../types/property";

export const propertiesMock: Property[] = [
  { id: "p1", code: "Dev-1234", title: "Moudi Family House", ownerId: "u1", owner: "Sara Ahmed", type: "House", purpose: "Rent", location: "Maadi", city: "Cairo", price: 16000, status: "Under Review", submitted: "Today" },
  { id: "p2", code: "Dev-1235", title: "Garden City Office Lofty", ownerId: "u1", owner: "Sara Ahmed", type: "Office", purpose: "Sale", location: "Garden City", city: "Cairo", price: 3200000, status: "Published", submitted: "Yesterday" },
  { id: "p3", code: "Dev-1236", title: "Moudi Family House", ownerId: "u1", owner: "Sara Ahmed", type: "House", purpose: "Rent", location: "Dokki", city: "Giza", price: 16000, status: "Rejected", submitted: "Yesterday" },
  { id: "p4", code: "Dev-1237", title: "Moudi Family House", ownerId: "u1", owner: "Sara Ahmed", type: "House", purpose: "Rent", location: "El-Mohandsen", city: "Cairo", price: 16000, status: "Inactive", submitted: "May 24, 2026" },
  { id: "p5", code: "Dev-1238", title: "Moudi Family House", ownerId: "u1", owner: "Sara Ahmed", type: "House", purpose: "Rent", location: "El-Mohandsen", city: "Cairo", price: 16000, status: "Inactive", submitted: "May 24, 2026" },
  { id: "p6", code: "Dev-1301", title: "Sheikh Zayed Villa", ownerId: "u2", owner: "Darak", type: "Villa", purpose: "Sale", location: "Sheikh Zayed", city: "Giza", price: 9800000, status: "Published", submitted: "3 days ago" },
  { id: "p7", code: "Dev-1302", title: "Downtown Retail Shop", ownerId: "u2", owner: "Darak", type: "Shop", purpose: "Rent", location: "Downtown", city: "Cairo", price: 22000, status: "Sold/Rented", submitted: "Last week" },
  { id: "p8", code: "Dev-1303", title: "Nile View Apartment", ownerId: "u5", owner: "Mona Adel", type: "Apartment", purpose: "Sale", location: "Zamalek", city: "Cairo", price: 4500000, status: "Change Required", submitted: "2 days ago" },
  { id: "p9", code: "Dev-1304", title: "New Cairo Duplex", ownerId: "u5", owner: "Mona Adel", type: "Duplex", purpose: "Sale", location: "New Cairo", city: "Cairo", price: 6200000, status: "Under Review", submitted: "Last week" },
  { id: "p10", code: "Dev-1305", title: "Corniche Studio", ownerId: "u7", owner: "Nour Hassan", type: "Studio", purpose: "Rent", location: "Corniche", city: "Aswan", price: 7000, status: "Inactive", submitted: "Last week" },
  { id: "p11", code: "Dev-1306", title: "Heliopolis Apartment", ownerId: "u9", owner: "Laila Mostafa", type: "Apartment", purpose: "Rent", location: "Heliopolis", city: "Cairo", price: 12000, status: "Published", submitted: "Yesterday" },
];

export const getPropertiesByOwner = (ownerId: string): Property[] =>
  propertiesMock.filter((p) => p.ownerId === ownerId);
