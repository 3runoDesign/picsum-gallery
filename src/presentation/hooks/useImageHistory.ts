import { useCallback, useRef, useState } from "react";
import { Image } from "../../domain/entities/Image";

export const useImageHistory = () => {
  const [history, setHistory] = useState<Image[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentIndexRef = useRef(-1);

  currentIndexRef.current = currentIndex;

  const addImage = useCallback((image: Image) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndexRef.current + 1);
      newHistory.push(image);
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < history.length - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [history.length]);

  const getCurrentImage = useCallback(() => {
    return currentIndex >= 0 ? history[currentIndex] : null;
  }, [currentIndex, history]);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  return {
    addImage,
    goToPrevious,
    goToNext,
    getCurrentImage,
    canGoBack,
    canGoForward,
    historyLength: history.length,
  };
};
