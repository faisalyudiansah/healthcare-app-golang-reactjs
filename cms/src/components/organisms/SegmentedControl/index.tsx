import React, { useRef, useState, useEffect } from 'react';
import './styles.css';

export interface Segment<T> {
  value: T;
  label: string;
  ref: React.RefObject<HTMLDivElement>;
}

interface SegmentedControlProps<T> {
  name: string;
  segments: Segment<T>[];
  callback: (value: T, index: number) => void;
  defaultIndex?: number;
  controlRef: React.RefObject<HTMLDivElement>;
}

const SegmentedControl = <T,>({
  name,
  segments,
  callback,
  defaultIndex = 0,
  controlRef,
}: SegmentedControlProps<T>): React.ReactElement => {
  const [activeIndex, setActiveIndex] = useState<number>(defaultIndex);
  const componentReady = useRef<boolean>(false);

  // Determine when the component is "ready"
  useEffect(() => {
    componentReady.current = true;
  }, []);

  useEffect(() => {
    const activeSegmentRef = segments[activeIndex].ref;
    const { offsetWidth, offsetLeft } = activeSegmentRef.current!;
    const { style } = controlRef.current!;

    style.setProperty('--highlight-width', `${offsetWidth}px`);
    style.setProperty('--highlight-x-pos', `${offsetLeft}px`);
  }, [activeIndex, callback, controlRef, segments]);

  const onInputChange = (value: T, index: number) => {
    setActiveIndex(index);
    callback(value, index);
  };

  return (
    <div className="controls-container" ref={controlRef}>
      <div
        className={`controls before:bg-primary ${
          componentReady.current ? 'ready' : 'idle'
        }`}
      >
        {segments?.map((item, i) => (
          <div
            key={item.value as string}
            className={`segment ${
              i === activeIndex ? 'active' : 'inactive'
            } select-none`}
            ref={item.ref}
          >
            <input
              type="radio"
              value={item.value as string}
              id={item.label as string}
              name={name}
              onChange={() => onInputChange(item.value, i)}
              checked={i === activeIndex}
            />
            <label htmlFor={item.label}>{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SegmentedControl;
