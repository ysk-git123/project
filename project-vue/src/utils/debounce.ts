/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: number | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timer) {
      clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
