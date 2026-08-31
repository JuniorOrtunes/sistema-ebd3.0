import { useEffect, useState } from 'react';

export function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const finalValue = value;
    if (finalValue === 0) {
      setCount(0);
      return;
    }

    const totalFrames = duration / (1000 / 60);
    const increment = finalValue / totalFrames;

    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      
      if (currentFrame >= totalFrames) {
        setCount(finalValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count.toLocaleString('pt-BR')}</>;
}