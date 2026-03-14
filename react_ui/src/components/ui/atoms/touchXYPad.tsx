/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {useRef, useCallback, PointerEvent} from 'react';
import {cn} from '@/lib/utils';

interface TouchXYPadProps {
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xStep: number;
  yStep: number;
  xValue: number;
  yValue: number;
  xDecimals?: number;
  yDecimals?: number;
  onXChange: (value: number) => void;
  onYChange: (value: number) => void;
}

const TouchXYPad: React.FC<TouchXYPadProps> = ({
  xLabel,
  yLabel,
  xMin,
  xMax,
  yMin,
  yMax,
  xStep,
  yStep,
  xValue,
  yValue,
  xDecimals = 2,
  yDecimals = 2,
  onXChange,
  onYChange,
}) => {
  const padRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);

  const clampAndStep = (
    val: number,
    min: number,
    max: number,
    step: number,
  ): number => {
    const stepped = Math.round((val - min) / step) * step + min;
    return Math.min(max, Math.max(min, stepped));
  };

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!padRef.current) return;
      const rect = padRef.current.getBoundingClientRect();

      const ratioX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      // Y is inverted: top = max, bottom = min
      const ratioY = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));

      const newX = clampAndStep(xMin + ratioX * (xMax - xMin), xMin, xMax, xStep);
      const newY = clampAndStep(yMin + ratioY * (yMax - yMin), yMin, yMax, yStep);

      onXChange(newX);
      onYChange(newY);
    },
    [xMin, xMax, yMin, yMax, xStep, yStep, onXChange, onYChange],
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== null) return;
      activePointerId.current = e.pointerId;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      updateFromPointer(e.clientX, e.clientY);

      const handleMove = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== activePointerId.current) return;
        updateFromPointer(ev.clientX, ev.clientY);
      };

      const handleUp = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== activePointerId.current) return;
        activePointerId.current = null;
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [updateFromPointer],
  );

  // Normalized positions for the crosshair indicator
  const normX = (xValue - xMin) / (xMax - xMin);
  const normY = 1 - (yValue - yMin) / (yMax - yMin);

  return (
    <div className={container}>
      <div className={labelRow}>
        <span className={axisLabel}>{yLabel}</span>
      </div>
      <div
        ref={padRef}
        className={pad}
        onPointerDown={handlePointerDown}
      >
        {/* Grid lines */}
        <div className={gridOverlay}>
          <div className={cn(gridLine, 'left-1/4 top-0 bottom-0 w-px')} />
          <div className={cn(gridLine, 'left-1/2 top-0 bottom-0 w-px')} />
          <div className={cn(gridLine, 'left-3/4 top-0 bottom-0 w-px')} />
          <div className={cn(gridLine, 'top-1/4 left-0 right-0 h-px')} />
          <div className={cn(gridLine, 'top-1/2 left-0 right-0 h-px')} />
          <div className={cn(gridLine, 'top-3/4 left-0 right-0 h-px')} />
        </div>

        {/* Crosshair lines */}
        <div
          className={crosshairH}
          style={{top: `${normY * 100}%`}}
        />
        <div
          className={crosshairV}
          style={{left: `${normX * 100}%`}}
        />

        {/* Touch indicator dot */}
        <div
          className={indicator}
          style={{
            left: `${normX * 100}%`,
            top: `${normY * 100}%`,
          }}
        />

        {/* Value readouts */}
        <div className={valueOverlay}>
          <span className={valueText}>
            {xLabel}: {xValue.toFixed(xDecimals)}
          </span>
          <span className={valueText}>
            {yLabel}: {yValue.toFixed(yDecimals)}
          </span>
        </div>
      </div>
      <div className={labelRow}>
        <span className={axisLabel}>{xLabel}</span>
      </div>
    </div>
  );
};

const container = 'flex flex-col items-center gap-1';
const labelRow = 'flex justify-center';
const axisLabel = 'text-xs text-muted-foreground font-medium';

const pad = `
  relative w-[260px] h-[260px] rounded-lg
  bg-secondary border border-border
  touch-none select-none cursor-crosshair overflow-hidden`;

const gridOverlay = 'absolute inset-0 pointer-events-none';
const gridLine = 'absolute bg-border opacity-30';

const crosshairH = `
  absolute left-0 right-0 h-px bg-progress opacity-60
  pointer-events-none transition-[top] duration-75`;
const crosshairV = `
  absolute top-0 bottom-0 w-px bg-progress opacity-60
  pointer-events-none transition-[left] duration-75`;

const indicator = `
  absolute w-5 h-5 rounded-full
  bg-progress border-2 border-primary shadow-lg
  -translate-x-1/2 -translate-y-1/2
  pointer-events-none transition-all duration-75`;

const valueOverlay = `
  absolute bottom-2 left-2 flex flex-col gap-0.5
  pointer-events-none`;
const valueText = `
  text-[10px] font-medium text-muted-foreground
  bg-background/70 rounded px-1 py-0.5`;

export {TouchXYPad};
