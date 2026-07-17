import { type Frame, frame } from './frame'

/** 插入排序 —— 边算边打帧 */
export function insertionSort(input: number[]): Frame[] {
  const arr = [...input]
  const n = arr.length
  const steps: Frame[] = []
  const stats = { comparisons: 0, swaps: 0 }
  const sorted: Record<number, string> = { 0: 'sorted' }

  steps.push(frame(arr, { 0: 'sorted' }, '开始插入排序：将第一个元素视为已排序，逐个将后续元素插入正确位置。', stats))

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    steps.push(frame(arr, { ...sorted, [i]: 'key' },
      `取出 a[${i}]=${key} 作为待插入值`, stats))

    let j = i - 1
    while (j >= 0) {
      stats.comparisons++
      steps.push(frame(arr, { ...sorted, [j]: 'compare', [i]: 'key' },
        `比较待插入值 ${key} 与 a[${j}]=${arr[j]}`, stats))

      if (arr[j] > key) {
        arr[j + 1] = arr[j]
        stats.swaps++
        steps.push(frame(arr, { ...sorted, [j + 1]: 'swap', [j]: 'swap' },
          `${arr[j + 1]} > ${key}，将 a[${j}] 后移到 a[${j + 1}]`, stats))
        j--
      } else {
        break
      }
    }

    arr[j + 1] = key
    sorted[i] = 'sorted'
    steps.push(frame(arr, { ...sorted },
      `将 ${key} 插入到位置 ${j + 1}`, stats))
  }

  steps.push(frame(arr, { ...sorted }, `排序完成！共比较 ${stats.comparisons} 次，移动 ${stats.swaps} 次。`, stats))
  return steps
}
