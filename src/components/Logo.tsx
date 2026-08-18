import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onClick?: () => void;
  href?: string;
  textColor?: string;
}

export const LogoIcon: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className = "",
}) => {
  const dimensions = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  }[size];

  return (
    <div
      className={`${dimensions} flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
    >
      <img
        src="/icon.png"
        alt="Invoicely"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showText = true,
  onClick,
  href = "/",
  textColor = "text-foreground",
}) => {
  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 group ${className}`}
      aria-label="Invoicely Home"
    >
      <LogoIcon size={size} />
      {showText && (
        <div className="flex items-center">
          <span className={`font-black tracking-tight ${textColor} ${textSizes}`}>
            Invoicely
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 ml-0.5 animate-pulse" aria-hidden="true" />
        </div>
      )}
    </Link>
  );
};


export default Logo;
