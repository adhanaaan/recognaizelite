import React from "react";
import { twJoin } from "tailwind-merge";

interface FloatingInputProps {
  id: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  type = "text",
  label,
  value,
  onChange,
  error,
  placeholder = label,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ fontFamily: "Avenir, Helvetica, Arial, sans-serif", fontSize: 16, fontWeight: 600 }}
        className={twJoin(
          "peer w-full bg-transparent text-700 placeholder-transparent border px-3 sm:px-4 py-5 pr-10 pt-7 pb-2 rounded-lg transition duration-200                     focus:outline-none focus:border-[#002D7C]",
          error ? "border-[#F12534] focus:border-[#F12534]" : "border-[#9EA3B1]",
          disabled ? "opacity-60 cursor-not-allowed" : ""
        )}
      />

      <label
        htmlFor={id}
        style={{ fontFamily: "Avenir, Helvetica, Arial, sans-serif", fontWeight: 500 }}
        className={`absolute left-3 sm:left-4 top-2.5 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-4
                    peer-placeholder-shown:text-[16px]
                    peer-placeholder-shown:text-[#9EA3B1]
                    peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-500
                    peer-[&:not(:placeholder-shown)]:top-2.5
                    peer-[&:not(:placeholder-shown)]:text-[10px]
                    peer-[&:not(:placeholder-shown)]:text-500
                    ${error ? "text-[#F12534] font-medium" : "text-[#9EA3B1]"}
                `}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;
