import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onClick?: () => void;
  href?: string;
}

export const LogoIcon: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const dimensions = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  }[size];

  const svgSizes = {
    sm: 18,
    md: 22,
    lg: 26,
  }[size];

  return (
    <div
      className={`${dimensions} rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black flex-shrink-0 transition-transform duration-200 hover:scale-105`}
    >
      <svg
        width={svgSizes}
        height={svgSizes}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-slate-950"
      >
        <path
          d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2V8H20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 13L11 18L8 15"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showText = true,
  onClick,
  href = "/",
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
          <span className={`font-black tracking-tight text-foreground ${textSizes}`}>
            Invoicely
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 ml-0.5 animate-pulse" aria-hidden="true" />
        </div>
      )}
    </Link>
  );
};

export default Logo;
