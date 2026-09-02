import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg";
}

/** Shared CTA button — every clickable action in BreakBuddy should use this. */
export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  const classes = ["bb-button", `bb-button--${variant}`, `bb-button--${size}`, className]
    .filter(Boolean)
    .join(" ");
  return <button className={classes} {...props} />;
}
