import type { GestureType } from '../../types';

/**
 * Traditional Javanese Gunungan (Kayon) emblem used as the Dalang Cilik mark.
 */
export function GununganIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 3C11 9.5 6.5 16 6.5 23.5H25.5C25.5 16 21 9.5 16 3Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 7.5V27M16 14C13.8 14 12.2 15.5 11.5 17.5M16 14C18.2 14 19.8 15.5 20.5 17.5M12 27H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="16" cy="11" r="1.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Crisp custom vector hand-gesture illustration (zero emojis).
 */
export function GestureVectorIcon({
  gesture,
  className = 'h-9 w-9',
}: {
  gesture: GestureType;
  className?: string;
}) {
  if (gesture === 'closed_fist') {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <rect
          x="9"
          y="13"
          width="18"
          height="15"
          rx="6"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="M13 13V17M18 12V17M23 13V17M9.5 19H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (gesture === 'index_up') {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M15 16V7.5C15 6.1 16.1 5 17.5 5C18.9 5 20 6.1 20 7.5V16"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M11.5 19C11.5 16.8 13.3 15 15.5 15H22.5C24.7 15 26.5 16.8 26.5 19V22.5C26.5 26.6 23.1 30 19 30H17C13.7 30 11.5 27.3 11.5 24V19Z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="M20 15V19M23.5 16V19.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (gesture === 'pinch') {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M13 15.5C13 12 15.5 9.5 18.5 9.5C21 9.5 22.8 11 23 13.2"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M11.5 20.5C11.5 18.2 13.8 16.5 16.5 16.5H23.5C25.4 16.5 27 18.1 27 20V23C27 26.9 23.9 30 20 30H17.5C14.2 30 11.5 27.3 11.5 24V20.5Z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle cx="14.5" cy="14" r="2.6" fill="#C65D3B" />
      </svg>
    );
  }

  if (
    gesture === 'move_left' ||
    gesture === 'move_right' ||
    gesture === 'move_up' ||
    gesture === 'move_down'
  ) {
    const rotation =
      gesture === 'move_right'
        ? 0
        : gesture === 'move_down'
          ? 90
          : gesture === 'move_left'
            ? 180
            : -90;
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-hidden="true"
      >
        <circle
          cx="18"
          cy="18"
          r="12"
          fill="currentColor"
          fillOpacity="0.14"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12.5 18H23.5M23.5 18L19 13.5M23.5 18L19 22.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Default: Open Palm
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11 18V10.5C11 9.4 11.9 8.5 13 8.5C14.1 8.5 15 9.4 15 10.5V16M15 16V7.5C15 6.4 15.9 5.5 17 5.5C18.1 5.5 19 6.4 19 7.5V16M19 16V8.5C19 7.4 19.9 6.5 21 6.5C22.1 6.5 23 7.4 23 8.5V16.5M23 16.5V11.5C23 10.4 23.9 9.5 25 9.5C26.1 9.5 27 10.4 27 11.5V21C27 26 23 30 18 30C14 30 10.8 27.4 9.6 23.8L7.8 18.8C7.4 17.7 8 16.5 9.1 16.2C10 15.9 11 16.5 11 18Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

