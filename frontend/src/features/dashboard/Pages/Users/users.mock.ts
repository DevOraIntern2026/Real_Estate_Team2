import type { User } from "./types";

// Replace with an API call later.
export const usersMock: User[] = [
  { id: "u1", name: "Sara Ahmed", role: "Owner", email: "saraahmed@gmail.com", listings: 5, phone: "+20123456789", location: "Fifth Settlement, New Cairo, Egypt", status: "Active", joined: "2026-09-24" },
  { id: "u2", name: "Darak", role: "Agent", email: "darkom@gmail.com", listings: 2, phone: "+20123456789", location: "Maadi, Cairo, Egypt", status: "Suspended", joined: "2026-09-24" },
  { id: "u3", name: "Omar Omran", role: "Customer", email: "omaromran@gmail.com", listings: 0, phone: "+20123456789", location: "Zamalek, Cairo, Egypt", status: "Active", joined: "2026-09-24" },
  { id: "u4", name: "Ahmed Fathy", role: "Admin", email: "ahmedfathy@gmail.com", listings: 0, phone: "+20123456789", location: "Nasr City, Cairo, Egypt", status: "Suspended", joined: "2026-09-24" },
  { id: "u5", name: "Mona Adel", role: "Owner", email: "monaadel@gmail.com", listings: 2, phone: "+20123456780", location: "Sheikh Zayed, Giza, Egypt", status: "Active", joined: "2026-09-22" },
  { id: "u6", name: "Khaled Samir", role: "Customer", email: "khaledsamir@gmail.com", listings: 0, phone: "+20123456781", location: "Dokki, Giza, Egypt", status: "Active", joined: "2026-09-20" },
  { id: "u7", name: "Nour Hassan", role: "Agent", email: "nourhassan@gmail.com", listings: 1, phone: "+20123456782", location: "Corniche, Aswan, Egypt", status: "Active", joined: "2026-09-18" },
  { id: "u8", name: "Youssef Ali", role: "Customer", email: "youssefali@gmail.com", listings: 0, phone: "+20123456783", location: "Heliopolis, Cairo, Egypt", status: "Suspended", joined: "2026-09-15" },
  { id: "u9", name: "Laila Mostafa", role: "Owner", email: "lailamostafa@gmail.com", listings: 1, phone: "+20123456784", location: "Mohandessin, Giza, Egypt", status: "Active", joined: "2026-09-12" },
];
