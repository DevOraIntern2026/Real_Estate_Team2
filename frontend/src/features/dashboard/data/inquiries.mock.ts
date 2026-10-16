import type { Inquiry, InquiryReply } from "../../../types/inquiry";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const inquiriesMock: Inquiry[] = [
  { id: "i1", propertyId: "p2", customerName: "Mai Ahmed", customerEmail: "maiahmed@gmail.com", phone: "+201234567890", message: "Can we get to know the final price?", status: "New", createdAt: hoursAgo(2) },
  { id: "i2", propertyId: "p1", customerName: "Naser Ahmed", customerEmail: "naserahmed@gmail.com", phone: "+201234567891", message: "I want to inquire and know some details about this property. Is it still available, and can we negotiate the price?", status: "New", createdAt: hoursAgo(26) },
  { id: "i3", propertyId: "p5", customerName: "Dina Samir", customerEmail: "dinasamir@gmail.com", phone: "+201234567892", message: "Can I schedule a visit this week?", status: "New", createdAt: "2026-05-24T10:00:00" },
  { id: "i4", propertyId: "p3", customerName: "Hany Adel", customerEmail: "hanyadel@gmail.com", phone: "+201234567893", message: "Is the price negotiable?", status: "Responded", createdAt: "2026-04-02T16:32:00" },
  // belongs to another owner (p6): must NOT show on Sara's dashboard
  { id: "i5", propertyId: "p6", customerName: "Karim Nabil", customerEmail: "karimnabil@gmail.com", phone: "+201234567894", message: "Is the villa still available?", status: "New", createdAt: hoursAgo(5) },
];

export const inquiryRepliesMock: InquiryReply[] = [
  { id: "r1", inquiryId: "i4", sender: "owner", text: "Yes, we can negotiate. How can we get in touch?", createdAt: "2026-04-04T16:32:00" },
];
