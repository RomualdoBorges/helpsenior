import { useEffect, useState } from "react";

export function useCurrentTime(intervalInMilliseconds = 60_000) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, intervalInMilliseconds);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalInMilliseconds]);

  return currentTime;
}
