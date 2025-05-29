
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

    const handleVisualViewport = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const viewport = window.visualViewport;
        const currentHeight = viewport.height;
        const keyboardHeight = window.innerHeight - currentHeight;
        const isOpen = keyboardHeight > 150;
        
        console.log('📱 Keyboard state:', { 
          isOpen, 
          keyboardHeight, 
          windowHeight: window.innerHeight, 
          viewportHeight: currentHeight 
        });
        
        setKeyboardState(prev => ({
          ...prev,
          isOpen: isOpen,
          height: Math.max(0, keyboardHeight)
        }));
      }
    };

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

    // Priorizar visualViewport se disponível (mais confiável)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    } else {
      // Fallback para dispositivos mais antigos
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      } else {
        window.removeEventListener('resize', handleResize);
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
