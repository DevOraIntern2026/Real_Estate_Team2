import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatPrice = (price: number, currency: string, perMonth: boolean) =>
  `${currency} ${new Intl.NumberFormat('en-US').format(price)}${perMonth ? '/month' : ''}`;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
