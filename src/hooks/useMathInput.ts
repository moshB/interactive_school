import { useCallback, useRef, useState, type ChangeEvent } from 'react';

export type MathToken = {
  label: string;
  value: string;
  cursorOffset?: number;
  description: string;
  action?: 'backspace';
};

export function useMathInput(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: initialValue.length, end: initialValue.length });

  const rememberSelection = useCallback(() => {
    const input = inputRef.current;
    if (input) {
      selectionRef.current = {
        start: input.selectionStart ?? input.value.length,
        end: input.selectionEnd ?? input.value.length,
      };
    }
  }, []);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    selectionRef.current = {
      start: event.target.selectionStart ?? event.target.value.length,
      end: event.target.selectionEnd ?? event.target.value.length,
    };
  }, []);

  const insertToken = useCallback((token: MathToken) => {
    const input = inputRef.current;
    let start = input?.selectionStart ?? selectionRef.current.start;
    const end = input?.selectionEnd ?? selectionRef.current.end;
    if (token.action === 'backspace' && start === end && start > 0) {
      start -= 1;
    }
    const nextValue = `${value.slice(0, start)}${token.value}${value.slice(end)}`;
    const nextCursor = start + (token.cursorOffset ?? token.value.length);

    setValue(nextValue);
    selectionRef.current = { start: nextCursor, end: nextCursor };
    input?.focus();
    requestAnimationFrame(() => input?.setSelectionRange(nextCursor, nextCursor));
  }, [value]);

  return {
    value,
    setValue,
    inputRef,
    handleChange,
    rememberSelection,
    insertToken,
  };
}
