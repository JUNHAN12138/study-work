import { type Frame, frame } from './frame'

/** 冒泡排序 —— 边算边打帧 */
export function bubbleSort(input: number[]): Frame[] {
  const arr = [...input]
  const n = arr.length
  const steps: Frame[] = []
  const stats = { comparisons: 0, swaps: 0 }
  const sorted: Record<number, string> = {}

  steps.push(frame(arr, {}, '开始冒泡排序：反复比较相邻元素，把较大值往后"冒泡"。', stats))

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      stats.comparisons++
      steps.push(frame(arr, { ...sorted, [j]: 'compare', [j + 1]: 'compare' },
        `比较 a[${j}]=${arr[j]} 与 a[${j + 1}]=${arr[j + 1]}`, stats))

      if (arr[j] > arr[j + 1]) {
        stats.swaps++
        const left = arr[j]
        const right = arr[j + 1]
        arr[j] = right
        arr[j + 1] = left
        steps.push(frame(arr, { ...sorted, [j]: 'swap', [j + 1]: 'swap' },
          `${left} > ${right}，交换两者`, stats))
      }
    }
    sorted[n - 1 - i] = 'sorted'
    steps.push(frame(arr, { ...sorted }, `第 ${i + 1} 轮结束，位置 ${n - 1 - i} 已归位`, stats))
  }
  sorted[0] = 'sorted'
  steps.push(frame(arr, { ...sorted }, `排序完成！共比较 ${stats.comparisons} 次，交换 ${stats.swaps} 次。`, stats))
  return steps
}
