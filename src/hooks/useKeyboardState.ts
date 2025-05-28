
import { useState, useEffect, useRef } from 'react';

interface KeyboardState {
  isOpen: boolean;
  height: number;
  isInputFocused: boolean;
}

export const useKeyboardState = () => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isOpen: false,
    height: 0,
    isInputFocused: false
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const initialViewportHeight = useRef<number>(0);

  useEffect(() => {
    // Capturar altura inicial da viewport
    if (typeof window !== 'undefined') {
      initialViewportHeight.current = window.innerHeight;
    }

    const handleResize = () => {
      if (typeof window === 'undefined') return;
      
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      
      // Considerar que o teclado está aberto se a altura diminuiu significativamente
      const isKeyboardOpen = heightDifference > 150;
      
      setKeyboardState(prev => ({
        ...prev,
        isOpen: isKeyboardOpen,
        height: Math.max(0, heightDifference)
      }));
    };

    const handleVisualViewport = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const viewport = window.visualViewport;
        const keyboardHeight = window.innerHeight - viewport.height;
        const isOpen = keyboardHeight > 150;
        
        setKeyboardState(prev => ({
          ...prev,
          isOpen: isOpen,
          height: Math.max(0, keyboardHeight)
        }));
      }
    };

    // Event listeners
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
    };
  }, []);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setKeyboardState(prev => ({ ...prev, isInputFocused: true }));
    }
  };

  const blurInput = () => {
    if (inputRef.current) {
      inputRef.current.blur();
      setKeyboardState(prev => ({ ...prev, isInputFocused: false }));
    }
  };

  const handleInputFocus = () => {
    setKeyboardState(prev => ({ ...prev, isInputFocused: true }));
  };

  const handleInputBlur = () => {
    setKeyboardState(prev => ({ ...prev, isInputFocused: false }));
  };

  return {
    keyboardState,
    inputRef,
    focusInput,
    blurInput,
    handleInputFocus,
    handleInputBlur
  };
};
