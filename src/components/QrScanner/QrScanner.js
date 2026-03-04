import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

const QrScannerOverlay = ({ open, onClose, onResult }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const cameraHandler = async (result) => {
    const data = String(result?.data ?? "").trim();
    let resolvedData = data;

    try {
      const response = await fetch(data, { method: "GET", redirect: "follow" });
console.log(await response)
      // In browser fetch, response.url is the final URL after HTTP redirects.
      if (response?.url) resolvedData = response.url;
    } catch (error) {
      console.error("QR redirect resolution failed:", error);
    }

    // elfogad: "7" vagy "/treasure/7" vagy "http://.../treasure/7"
    const match = resolvedData.match(/\/treasure\/(\d+)\b/i) || resolvedData.match(/^(\d+)$/);

    if (match) onResult(Number(match[1]));
  }

  useEffect(() => {
    if (!open) return;

    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScanner(
      video,
      cameraHandler,
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
      }
    );

    scannerRef.current = scanner;

    scanner
      .start()
      .catch((e) => {
        console.error("Camera start failed:", e);
        onClose();
      });

    return () => {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [open, onClose, onResult]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="p-3 flex items-center justify-between text-white">
        <div>QR beolvasás</div>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded bg-white/10"
        >
          Bezár
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-3">
        <video ref={videoRef} className="w-full max-w-md rounded" />
      </div>

      <div className="p-3 text-white/80 text-sm text-center">
        Irányítsd a kamerát a QR kódra.
      </div>
    </div>
  );
}

export default QrScannerOverlay;
