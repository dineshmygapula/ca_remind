import { useEffect, RefObject } from "react";

/**
 * Fires `handler` whenever a mousedown event occurs outside all of the
 * provided refs. Pass as many refs as needed (e.g. multiple dropdowns).
 */
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
