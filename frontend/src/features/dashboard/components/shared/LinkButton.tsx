import { Link, type LinkProps } from "react-router-dom";
import { buttonBaseClass, buttonVariantClass, type ButtonVariant } from "./buttonStyles";

type LinkButtonProps = LinkProps & { variant?: ButtonVariant };

/** A <Link> that looks like a Button (navigation should be a link, not a button). */
export default function LinkButton({
  variant = "solid",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`inline-block text-center ${buttonBaseClass} ${buttonVariantClass[variant]} ${className}`}
      {...props}
    />
  );
}
