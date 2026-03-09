import React, { useId } from "react";

interface props {
  label: string;
  className?: string;
  error?: string;
  message?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export const Input: React.FC<props & React.InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  className,
  error,
  inputClassName,
  labelClassName,
  message,
  name,
  ...props
}) => {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className={["block mb-2 font-medium text-gray-900 text-md", labelClassName].join(" ")}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        className={
          "bg-gray-50 border border-gray-300 text-gray-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 block w-full px-3 " +
          inputClassName
        }
        {...props}
      />
      {message && <p className="p-1 -mb-2 text-sm text-gray-500">{message}</p>}
      {error && <p className="p-1 -mb-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};
