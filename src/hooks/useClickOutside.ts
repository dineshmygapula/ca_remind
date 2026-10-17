import { useEffect, RefObject } from "react";


export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: (ref: RefObject<HTMLElement | null>) => void
) {
  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      refs.forEach((ref) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          handler(ref);
        }
      });
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);
}
