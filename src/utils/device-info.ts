export function getPlatform() {
  const { userAgent, platform } = window.navigator;

  const iosPlatforms = ["iPhone", "iPad", "iPod"];
  if (
    iosPlatforms.indexOf(platform) !== -1 ||
    // For new IPads with M1 chip and IPadOS platform returns "MacIntel"
    (platform === "MacIntel" && "maxTouchPoints" in navigator && navigator.maxTouchPoints > 2)
  )
    return "iOS";

  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  if (macosPlatforms.indexOf(platform) !== -1) return "macOS";

  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  if (windowsPlatforms.indexOf(platform) !== -1) return "Windows";

  if (/Android/.test(userAgent)) return "Android";

  if (/Linux/.test(platform)) return "Linux";

  return "unknown";
}

export function getBrowser() {
  if (
    navigator.userAgent.toLowerCase().includes("firefox") ||
    navigator.userAgent.toLowerCase().includes("iceweasel") ||
    navigator.userAgent.toLowerCase().includes("icecat")
  ) {
    return "Firefox";
  } else if (navigator.userAgent.includes("YaBrowser")) {
    return "YaBrowser";
  } else if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {
    return "Opera";
  } else if (navigator.userAgent.indexOf("Edg") != -1) {
    return "Edge";
  } else if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    return "Safari";
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("MSIE") != -1 || !!document.DOCUMENT_NODE == true) {
    //IF IE > 10
    return "IE";
  }

  return "unknown";
}

export function hasNotch() {
  if (CSS.supports("padding-bottom: env(safe-area-inset-bottom)")) {
    var E = document.createElement("div");
    (E.style.paddingBottom = "env(safe-area-inset-bottom)"), document.body.appendChild(E);
    var A = parseInt(window.getComputedStyle(E).paddingBottom, 10);
    if ((document.body.removeChild(E), A > 0)) return !0;
  }
  return !1;
}

export function isTablet() {
  return /(ipad|tablet|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|puffin)/i.test(navigator.userAgent);
}

export function isInstalledAndroidApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches
    // || window.navigator.standalone
  );
}

export function getDeviceInfo() {
  return {
    platform: getPlatform(),
    browser: getBrowser(),
    hasNotch: hasNotch(),
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  };
}
