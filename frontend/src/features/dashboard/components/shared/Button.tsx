import type { ButtonHTMLAttributes } from "react";
import { buttonBaseClass, buttonVariantClass, type ButtonVariant } from "./buttonStyles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
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
      className={`${buttonBaseClass} ${buttonVariantClass[variant]} ${className}`}
      {...props}
    />
  );
}
