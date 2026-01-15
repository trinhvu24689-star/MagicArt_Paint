import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ToolType, RGB } from '../types';

interface CanvasBoardProps {
  tool: ToolType;
  color: string;
  brushSize: number;
  opacity: number;
  showGrid: boolean;
  locked?: boolean;
}

export interface CanvasBoardHandle {
  exportImage: () => string | null;
}

export const CanvasBoard = forwardRef<CanvasBoardHandle, CanvasBoardProps>(({ 
  tool, color, brushSize, opacity, showGrid, locked = false 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (canvasRef.current) {
        // Return the data URL of the drawing canvas (ignores the grid canvas)
        return canvasRef.current.toDataURL('image/png');
      }
      return null;
    }
  }));

  // Initialize and resize
  useEffect(() => {
    const handleResize = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent && canvasRef.current && gridRef.current) {
        // Save current content before resizing (optional, but good for UX)
        // For now, simple resize resets canvas as per original logic, 
        // in a real app you'd copy the image data.
        
        // Set canvas size to match parent exactly
        canvasRef.current.width = parent.clientWidth;
        canvasRef.current.height = parent.clientHeight;
        gridRef.current.width = parent.clientWidth;
        gridRef.current.height = parent.clientHeight;
        
        // Fill white background initially
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, parent.clientWidth, parent.clientHeight);
        }
        drawGrid();
      }
    };

    window.addEventListener('resize', handleResize);
    // Slight delay to ensure parent container has sized correctly
    setTimeout(handleResize, 10);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Grid drawing logic (Ô li styling)
  const drawGrid = () => {
    const ctx = gridRef.current?.getContext('2d');
    const width = gridRef.current?.width || 0;
    const height = gridRef.current?.height || 0;
    const gridSize = 10; // Đã chỉnh nhỏ lại thành 10px như Navigator

    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    if (!showGrid) return;

    // Drawing the "Ô li" style (Primary lines)
    ctx.strokeStyle = 'rgba(100, 149, 237, 0.2)'; // Giảm opacity một chút vì lưới dày hơn
    ctx.lineWidth = 1;

    ctx.beginPath();
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x + 0.5, 0); // +0.5 for sharper lines
      ctx.lineTo(x + 0.5, height);
    }
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();
  };

  useEffect(() => {
    drawGrid();
  }, [showGrid]);

  const startDrawing = (e: React.MouseEvent) => {
    if (locked) return; // Prevent drawing if locked

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPos.current = { x, y };

    draw(e);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing && e.type === 'mousemove') return;
    if (locked) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity;
    
    // Reset shadow by default
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; 
    } else if (tool === 'ai_real') {
      // Hiệu ứng đặc biệt cho bút AI
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.lineWidth = brushSize * 1.2; // Vẽ dày hơn chút
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser' || tool === 'airbrush' || tool === 'ai_real') {
       if (lastPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    } else if (tool === 'fill') {
      if (e.type === 'mousedown') {
        ctx.fillStyle = color;
        ctx.fillRect(0,0, canvas.width, canvas.height); 
      }
    }

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  return (
    <div className={`relative w-full h-full bg-white overflow-hidden ${locked ? 'cursor-not-allowed' : 'cursor-crosshair'}`}>
      {/* Drawing Layer */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute inset-0 z-10"
      />

      {/* Grid Overlay Layer - Pointer events none ensures clicks pass through to canvas */}
      <canvas
        ref={gridRef}
        className="absolute inset-0 pointer-events-none z-20"
      />
    </div>
  );
});

CanvasBoard.displayName = "CanvasBoard";