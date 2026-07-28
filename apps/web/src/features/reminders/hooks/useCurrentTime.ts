import { useEffect, useState } from "react";

export function useCurrentTime(intervalInMilliseconds = 60_000) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;

    function updateCurrentTime() {
      setCurrentTime(new Date());
    }

    const millisecondsUntilNextInterval =
      intervalInMilliseconds - (Date.now() % intervalInMilliseconds);

    const timeoutId = window.setTimeout(() => {
      updateCurrentTime();
      intervalId = window.setInterval(
        updateCurrentTime,
        intervalInMilliseconds,
      );
    }, millisecondsUntilNextInterval);

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [intervalInMilliseconds]);

  return currentTime;
}
