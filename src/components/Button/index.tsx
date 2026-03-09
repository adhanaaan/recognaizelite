import styles from "./button.module.scss";
import { CircularProgress } from "./CircularProgress";

export type ButtonVariant = "text" | "outline" | "contained";
type Type = "button" | "submit" | "reset";

export type ButtonColorProps = "primary" | "success" | "error" | "warning" | "info" | "text" | "disabled";

type Props = {
  type?: Type;
  className?: string;
  variant: ButtonVariant;
  color?: ButtonColorProps;
  fullWidth?: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  children: React.ReactNode;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function BottomButton({
  type = "button",
  className = "",
  variant,
  color = "primary",
  fullWidth,
  disabled,
  isSubmitting,
  children,
  buttonProps,
  onClick,
}: Props) {
  const isDisabled = disabled || isSubmitting;
  const colorState = isDisabled ? "disabled" : color;

  const combinedClassName = `
		${styles.button}
		${styles[variant]}
		${styles[`button-color--color-${colorState}`]}
		${isDisabled && styles[`${variant}-disabled`]}
		${fullWidth ? styles.fullWidth : ""}
		${className}
	`;

  return (
    <button type={type} disabled={isDisabled} className={combinedClassName} onClick={onClick} {...buttonProps}>
      {children}
      {isSubmitting && (
        <span className={styles.spinnerWrapper}>
          <CircularProgress size={20} />
        </span>
      )}
    </button>
  );
}
