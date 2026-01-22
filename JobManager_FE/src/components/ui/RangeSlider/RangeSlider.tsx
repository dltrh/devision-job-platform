import React, { useState, useEffect } from "react";
import clsx from "clsx";

export interface RangeSliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
  showInputs?: boolean;
  onApply?: () => void;
  minGap?: number;
  /** Prefix for formatted display (e.g., "$" for currency) */
  prefix?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  formatValue = (v) => v.toString(),
  className,
  showInputs = true,
  onApply,
  minGap = 0,
  prefix = "$",
}) => {
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);
  const [minInputValue, setMinInputValue] = useState(minValue.toString());
  const [maxInputValue, setMaxInputValue] = useState(maxValue.toString());

  // Sync local state when external props change (e.g., when loading a profile)
  useEffect(() => {
    setLocalMin(minValue);
    setMinInputValue(minValue.toString());
  }, [minValue]);

  useEffect(() => {
    setLocalMax(maxValue);
    setMaxInputValue(maxValue.toString());
  }, [maxValue]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Enforce minGap: min value cannot exceed (localMax - minGap)
    const maxAllowed = localMax - minGap;
    const newValue = value <= maxAllowed ? value : maxAllowed;
    setLocalMin(newValue);
    setMinInputValue(newValue.toString());
    onMinChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Enforce minGap: max value cannot go below (localMin + minGap)
    const minAllowed = localMin + minGap;
    const newValue = value >= minAllowed ? value : minAllowed;
    setLocalMax(newValue);
    setMaxInputValue(newValue.toString());
    onMaxChange(newValue);
  };

  // Input change handlers for number inputs
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setMinInputValue(inputVal);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setMaxInputValue(inputVal);
  };

  // Apply input value when user presses Enter or leaves the field
  const handleMinInputBlur = () => {
    let value = Number(minInputValue);
    if (isNaN(value)) {
      value = min;
    }
    // Clamp to valid range
    value = Math.max(min, Math.min(value, localMax - minGap));
    setLocalMin(value);
    setMinInputValue(value.toString());
    onMinChange(value);
  };

  const handleMaxInputBlur = () => {
    let value = Number(maxInputValue);
    if (isNaN(value)) {
      value = max;
    }
    // Clamp to valid range
    value = Math.min(max, Math.max(value, localMin + minGap));
    setLocalMax(value);
    setMaxInputValue(value.toString());
    onMaxChange(value);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "min" | "max",
  ) => {
    if (e.key === "Enter") {
      if (type === "min") {
        handleMinInputBlur();
      } else {
        handleMaxInputBlur();
      }
    }
  };

  const handleApply = () => {
    onMinChange(localMin);
    onMaxChange(localMax);
    onApply?.();
  };

  // Calculate the left and width for the range highlight
  const leftPercent = ((localMin - min) / (max - min)) * 100;
  const widthPercent = ((localMax - localMin) / (max - min)) * 100;

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="relative pt-1 h-6">
        {/* Track background */}
        <div className="absolute top-2 left-0 right-0 h-2 bg-gray-200 rounded-full" />

        {/* Active range highlight */}
        <div
          className="absolute top-2 h-2 bg-blue-500 rounded-full"
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          className="absolute top-0 w-full h-6 appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
          style={{ pointerEvents: "none" }}
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          className="absolute top-0 w-full h-6 appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
          style={{ pointerEvents: "none" }}
        />
      </div>

      {showInputs && (
        <div className="flex items-center gap-3 mt-2">
          {/* Min input */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {prefix}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={minInputValue}
                onChange={handleMinInputChange}
                onBlur={handleMinInputBlur}
                onKeyDown={(e) => handleKeyDown(e, "min")}
                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <span className="text-gray-400 mt-5">–</span>

          {/* Max input */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {prefix}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={maxInputValue}
                onChange={handleMaxInputChange}
                onBlur={handleMaxInputBlur}
                onKeyDown={(e) => handleKeyDown(e, "max")}
                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {onApply && (
            <button
              onClick={handleApply}
              className="mt-5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          )}
        </div>
      )}
    </div>
  );
};
