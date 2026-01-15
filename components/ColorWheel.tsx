import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HSV } from '../types';
import { hexToHsv, hsvToHex } from '../utils';

interface ColorWheelProps {
  color: string;
  onChange: (hex: string) => void;
  size?: number;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({ color, onChange, size = 160 }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const [hsv, setHsv] = useState<HSV>(hexToHsv(color));
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [isDraggingSquare, setIsDraggingSquare] = useState(false);

  useEffect(() => {
    setHsv(hexToHsv(color));
  }, [color]);

  const updateColor = useCallback((newHsv: HSV) => {
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  }, [onChange]);

  const handleWheelInteraction = (e: MouseEvent | React.MouseEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = e.clientX - cx;
    const y = e.clientY - cy;
    
    // Calculate angle
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    updateColor({ ...hsv, h: angle });
  };

  const handleSquareInteraction = (e: MouseEvent | React.MouseEvent) => {
    if (!squareRef.current) return;
    const rect = squareRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Clamp
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    const s = (x / rect.width) * 100;
    const v = 100 - ((y / rect.height) * 100);

    updateColor({ ...hsv, s, v });
  };

  const onMouseDownWheel = (e: React.MouseEvent) => {
    setIsDraggingWheel(true);
    handleWheelInteraction(e);
  };

  const onMouseDownSquare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling to wheel if overlapped
    setIsDraggingSquare(true);
    handleSquareInteraction(e);
  };

  useEffect(() => {
    const onMouseUp = () => {
      setIsDraggingWheel(false);
      setIsDraggingSquare(false);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingWheel) handleWheelInteraction(e);
      if (isDraggingSquare) handleSquareInteraction(e);
    };

    if (isDraggingWheel || isDraggingSquare) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingWheel, isDraggingSquare, hsv, updateColor]);

  const wheelStyle = {
    background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`,
  };

  const squareStyle = {
    background: `
      linear-gradient(to top, black, transparent),
      linear-gradient(to right, white, transparent)
    `,
    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`
  };

  const innerSize = size * 0.65; // Inner square size relative to wheel

  return (
    <div className="relative mx-auto select-none" style={{ width: size, height: size }}>
      {/* Hue Ring */}
      <div 
        ref={wheelRef}
        onMouseDown={onMouseDownWheel}
        className="absolute inset-0 rounded-full cursor-crosshair shadow-lg border-2 border-gray-900"
        style={wheelStyle}
      >
        {/* Hue Indicator */}
        <div 
          className="absolute w-3 h-3 border border-white rounded-full shadow-sm pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `rotate(${hsv.h}deg) translate(${(size/2) - 8}px) rotate(-${hsv.h}deg) translate(-50%, -50%)`
          }}
        />
      </div>

      {/* Inner Mask */}
      <div className="absolute inset-0 m-auto bg-gray-app rounded-full flex items-center justify-center" style={{ width: size - 30, height: size - 30 }}>
        {/* Saturation/Value Square */}
        <div 
          ref={squareRef}
          onMouseDown={onMouseDownSquare}
          className="relative cursor-crosshair border border-gray-600"
          style={{ ...squareStyle, width: innerSize, height: innerSize }}
        >
          {/* SV Indicator */}
          <div 
            className="absolute w-2 h-2 border border-black bg-white rounded-full shadow-sm pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};