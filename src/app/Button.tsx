import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`w-full sm:max-w-xs rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-3 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}