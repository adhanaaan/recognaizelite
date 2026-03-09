export function NumberButton({ children }: React.PropsWithChildren) {
  return (
    <div
      className="p-1 rounded-full text-2xl font-bold size-11 tall:size-[52px]"
      style={{
        background: "linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)",
        filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25))",
      }}
    >
      <div
        className="bg-white rounded-full size-9 tall:size-11 c"
        style={{ color: "var(--text-color)", background: "var(--number-bg)", lineHeight: "28px" }}
      >
        {children}
      </div>
    </div>
  );
}
