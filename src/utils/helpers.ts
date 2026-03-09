export function diffTime(x: number, sub = 0) {
  return ((new Date().getTime() - x - sub) / 1000).toFixed(3);
}

export const formatTimestamp = (x: Date = new Date()) => {
  const date = x.getDate(),
    month = x.getMonth(),
    year = x.getFullYear(),
    hours = x.getHours(),
    minutes = x.getMinutes(),
    seconds = x.getSeconds();

  return `${date > 9 ? date : "0" + date}/${month > 9 ? month : "0" + month}/${year}-${
    hours > 9 ? hours : "0" + hours
  }:${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}`;
};

export function vibrate(duration = 100) {
  try {
    navigator.vibrate(duration);
  } catch {}
}

export const compareArrays = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};

export const debounced = (fn: () => void, delay: number) => {
  let timer: NodeJS.Timeout;

  return () => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(fn, delay);
  };
};

export const isDemoPage = () =>
  typeof window !== "undefined" && window.location.pathname.split("/").includes("demo");

export function demoNextStep(event?: string) {
  if (isDemoPage()) window.dispatchEvent(new Event(typeof event === "string" ? event : "demo-next"));
}

export function rotateArray(array: any[], k: number) {
  const newArray = [];

  for (let i = 0; i < array.length; i++) {
    newArray[(i + k) % array.length] = array[i];
  }

  return newArray;
}

export function getTimeLap() {
  let start = new Date().getTime();

  return function () {
    const time = diffTime(start);
    start = new Date().getTime();
    return time;
  };
}
