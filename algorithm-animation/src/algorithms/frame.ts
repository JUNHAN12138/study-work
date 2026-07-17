/** 一帧的标准结构 */
export interface Frame {
  array: number[]
  colors: Record<number, string>
  desc: string
  stats: { comparisons: number; swaps: number }
}

/**
 * 帧工厂函数 —— 每次都深拷贝，避免所有帧指向同一引用
 */
export function frame(
  array: number[],
  colors: Record<number, string>,
  desc: string,
  stats: { comparisons: number; swaps: number }
): Frame {
  return {
    array: [...array],
    colors: { ...colors },
    desc,
    stats: { ...stats },
  }
}
