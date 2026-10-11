import type { ButtonHTMLAttributes } from "react";

type Variant = "solid" | "outline" | "text";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  solid: "rounded-sm bg-[#87400E] px-6 py-2 text-[#FAFAFA]",
  outline:
    "rounded-sm border-[0.8px] border-[#87400E] px-6 py-2 text-[#87400E]",
  text: "text-[#87400E] hover:underline",
};

export default function Button({
  variant = "solid",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
