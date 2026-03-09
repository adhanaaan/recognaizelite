import styles from "./CircularProgress.module.scss";

type Props = {
  size?: number; // optional size prop
  color?: string; // optional color prop
};

export function CircularProgress({ size = 40, color = "#1976d2" }: Props) {
  return (
    <div
      className={styles.circularProgress}
      style={{
        width: size,
        height: size,
        borderColor: `${color} transparent ${color} transparent`,
      }}
    />
  );
}
