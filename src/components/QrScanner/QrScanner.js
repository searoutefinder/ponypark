import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

const QrScannerOverlay = ({ open, onClose, onResult }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onResultRef = useRef(onResult);
  const [startError, setStartError] = useState(null);
  const [lastScannedValue, setLastScannedValue] = useState("");
  const [scanInfo, setScanInfo] = useState(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const cameraHandler = async (result) => {
    const data = String(result?.data ?? "").trim();
    const resolvedData = data;

    alert(JSON.stringify(data));
    setLastScannedValue(resolvedData);

    const match =
      resolvedData.match(/\/treasure\/(\d+)\b/i) ||
      resolvedData.match(/^treasure:(\d+)$/i) ||
      resolvedData.match(/^(\d+)$/);

    if (match) {
      setScanInfo(null);
      onResultRef.current?.(Number(match[1]));
      return;
    }

    setScanInfo("QR kod felismerve, de a tartalom nem tamogatott formatumu.");
  };

  useEffect(() => {
    if (!open) return;

    const video = videoRef.current;
    if (!video) return;

    setStartError(null);
    setLastScannedValue("");
    setScanInfo(null);

    const scanner = new QrScanner(video, cameraHandler, {
      preferredCamera: "environment",
      highlightScanRegion: true,
    });

    scannerRef.current = scanner;

    scanner.start().catch((error) => {
      console.error("Camera start failed:", error);
      setStartError(
        error?.message ||
          "Camera did not start. Check your permissions and make sure the site is running over https."
      );
    });

    return () => {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="p-3 flex items-center justify-between text-white">
        <div>Read QR</div>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-3">
        <video
          ref={videoRef}
          className="w-full max-w-md rounded"
          playsInline
          muted
          autoPlay
        />
      </div>

      <div className="p-3 text-white/80 text-sm text-center">
        {startError ?? "Iranyitsd a kamerat a QR kodra."}
      </div>

      {!startError && scanInfo ? (
        <div className="px-3 pb-2 text-xs text-yellow-300 text-center">
          {scanInfo}
        </div>
      ) : null}

      {!startError && lastScannedValue ? (
        <div className="px-3 pb-3 text-xs text-white/60 text-center break-all">
          Utolso beolvasott ertek: {lastScannedValue}
        </div>
      ) : null}
    </div>
  );
};

export default QrScannerOverlay;
