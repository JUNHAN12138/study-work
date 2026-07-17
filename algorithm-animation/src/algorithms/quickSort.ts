import { type Frame, frame } from './frame'

/** 快速排序 —— 边算边打帧 */
export function quickSort(input: number[]): Frame[] {
  const arr = [...input]
  const steps: Frame[] = []
  const stats = { comparisons: 0, swaps: 0 }
  const sorted: Record<number, string> = {}

  steps.push(frame(arr, {}, '开始快速排序：选择基准元素，将小于基准的放左边，大于基准的放右边。', stats))

  function partition(low: number, high: number): number {
    const pivot = arr[high]
    steps.push(frame(arr, { ...sorted, [high]: 'pivot' },
      `选取 a[${high}]=${pivot} 作为基准`, stats))

    let i = low - 1
    for (let j = low; j < high; j++) {
      stats.comparisons++
      steps.push(frame(arr, { ...sorted, [high]: 'pivot', [j]: 'compare', ...(i >= low ? { [i]: 'min' } : {}) },
        `比较 a[${j}]=${arr[j]} 与基准 ${pivot}`, stats))

      if (arr[j] <= pivot) {
        i++
        if (i !== j) {
          stats.swaps++
          const temp = arr[i]
          arr[i] = arr[j]
          arr[j] = temp
          steps.push(frame(arr, { ...sorted, [high]: 'pivot', [i]: 'swap', [j]: 'swap' },
            `${arr[i]} <= ${pivot}，交换 a[${i}] 与 a[${j}]`, stats))
        }
      }
    }

    stats.swaps++
    const temp = arr[i + 1]
    arr[i + 1] = arr[high]
    arr[high] = temp
    steps.push(frame(arr, { ...sorted, [i + 1]: 'pivot' },
      `基准 ${pivot} 归位到位置 ${i + 1}`, stats))

    sorted[i + 1] = 'sorted'
    return i + 1
  }

  function qsort(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high)
      qsort(low, pi - 1)
      qsort(pi + 1, high)
    } else if (low === high) {
      sorted[low] = 'sorted'
      steps.push(frame(arr, { ...sorted }, `位置 ${low} 只有一个元素，已归位`, stats))
    }
  }

  qsort(0, arr.length - 1)
  steps.push(frame(arr, { ...sorted }, `排序完成！共比较 ${stats.comparisons} 次，交换 ${stats.swaps} 次。`, stats))
  return steps
}
