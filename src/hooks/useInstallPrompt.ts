import { useCallback, useEffect, useState } from "react";

type PromptOutcome = "accepted" | "dismissed" | "unavailable";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function detectIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIphoneIpad = /iPad|iPhone|iPod/.test(ua);
  const isModernIpad =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIphoneIpad || isModernIpad;
}

function detectMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    Boolean((navigator as NavigatorWithStandalone).standalone)
  );
}

function isSecure() {
  if (typeof window === "undefined") return false;
  return (
    window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export type InstallState = {
  installed: boolean;
  promptAvailable: boolean;
  isIos: boolean;
  isMobile: boolean;
  secure: boolean;
  busy: boolean;
  install: () => Promise<PromptOutcome>;
  dismissHint: () => void;
  hintDismissed: boolean;
};

export function useInstallPrompt(): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(isStandaloneMode);
  const [busy, setBusy] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    const media = window.matchMedia("(display-mode: standalone)");
    const handleDisplayChange = (event: MediaQueryListEvent) =>
      setInstalled(event.matches);
    media.addEventListener("change", handleDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      media.removeEventListener("change", handleDisplayChange);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

    const register = () => {
      /* Путь считаем от baseURI: приложение может жить в подпапке. */
      const workerUrl = new URL("sw.js", document.baseURI).toString();
      navigator.serviceWorker
        .register(workerUrl, { scope: "./", updateViaCache: "none" })
        .then((registration) => registration.update().catch(() => undefined))
        .catch(() => undefined);
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  const install = useCallback(async (): Promise<PromptOutcome> => {
    if (!deferred) return "unavailable";
    setBusy(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setDeferred(null);
        return "accepted";
      }
      return "dismissed";
    } catch {
      return "unavailable";
    } finally {
      setBusy(false);
    }
  }, [deferred]);

  return {
    installed,
    promptAvailable: Boolean(deferred),
    isIos: detectIos(),
    isMobile: detectMobile(),
    secure: isSecure(),
    busy,
    install,
    dismissHint: () => setHintDismissed(true),
    hintDismissed,
  };
}
