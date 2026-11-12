import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  errorMessage: string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
}

function mapCameraError(err: unknown): {
  status: CameraStatus;
  message: string;
} {
  if (err instanceof DOMException) {
    if (
      err.name === 'NotAllowedError' ||
      err.name === 'PermissionDeniedError'
    ) {
      return {
        status: 'denied',
        message:
          'Izin kamera belum diberikan. Yuk klik "Izinkan Kamera" di browser kamu agar wayang bisa melihat tanganmu!',
      };
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return {
        status: 'unavailable',
        message:
          'Kamera tidak ditemukan. Pastikan webcam terpasang dengan baik ya!',
      };
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return {
        status: 'error',
        message:
          'Kamera sedang dipakai oleh aplikasi lain. Tutup aplikasi lain lalu coba lagi.',
      };
    }
  }
  return {
    status: 'error',
    message:
      'Kamera tidak dapat dinyalakan saat ini. Coba muat ulang halaman atau periksa pengaturan browser.',
  };
}

export function useCamera(autoStart = false): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('unavailable');
      setErrorMessage(
        'Browser ini belum mendukung akses kamera. Gunakan Google Chrome atau Edge versi terbaru ya!'
      );
      return false;
    }

    if (streamRef.current) {
      return true;
    }

    setStatus('requesting');
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setStatus('active');
      return true;
    } catch (err) {
      const mapped = mapCameraError(err);
      setStatus(mapped.status);
      setErrorMessage(mapped.message);
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      void startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [autoStart, startCamera]);

  return {
    videoRef,
    status,
    errorMessage,
    startCamera,
    stopCamera,
  };
}

