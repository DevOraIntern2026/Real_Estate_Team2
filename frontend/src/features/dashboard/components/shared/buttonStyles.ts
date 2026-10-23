export type ButtonVariant = "solid" | "outline" | "text";

export const buttonBaseClass =
  "text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50";

export const buttonVariantClass: Record<ButtonVariant, string> = {
  solid: "rounded-sm bg-[#87400E] px-6 py-2 text-[#FAFAFA]",
  outline: "rounded-sm border-[0.8px] border-[#87400E] px-6 py-2 text-[#87400E]",
  text: "text-[#87400E] hover:underline",
};
