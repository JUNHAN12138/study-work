/**
 * 帧工厂函数 —— 每次都深拷贝，避免所有帧指向同一引用
 */
export function frame(array, colors, desc, stats) {
  return {
    array: [...array],
    colors: { ...colors },
    desc,
    stats: { ...stats }
  }
}
