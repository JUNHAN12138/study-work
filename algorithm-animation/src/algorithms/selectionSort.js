import { frame } from './frame'

/**
 * 选择排序 —— 边算边打帧
 */
export function selectionSort(input) {
  const arr = [...input]
  const n = arr.length
  const steps = []
  const stats = { comparisons: 0, swaps: 0 }
  const sorted = {}

  steps.push(frame(arr, {}, '开始选择排序：每轮从未排序部分选出最小值，放到已排序末尾。', stats))

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    steps.push(frame(arr, { ...sorted, [i]: 'min' },
      `第 ${i + 1} 轮：假设 a[${i}]=${arr[i]} 为最小值`, stats))

    for (let j = i + 1; j < n; j++) {
      stats.comparisons++
      steps.push(frame(arr, { ...sorted, [minIdx]: 'min', [j]: 'compare' },
        `比较 a[${j}]=${arr[j]} 与当前最小值 a[${minIdx}]=${arr[minIdx]}`, stats))

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push(frame(arr, { ...sorted, [minIdx]: 'min' },
          `更新最小值为 a[${minIdx}]=${arr[minIdx]}`, stats))
      }
    }

    if (minIdx !== i) {
      stats.swaps++
      const temp = arr[i]
      arr[i] = arr[minIdx]
      arr[minIdx] = temp
      steps.push(frame(arr, { ...sorted, [i]: 'swap', [minIdx]: 'swap' },
        `将最小值 ${arr[i]} 交换到位置 ${i}`, stats))
    }

    sorted[i] = 'sorted'
    steps.push(frame(arr, { ...sorted }, `第 ${i + 1} 轮结束，位置 ${i} 已归位`, stats))
  }

  sorted[n - 1] = 'sorted'
  steps.push(frame(arr, { ...sorted }, `排序完成！共比较 ${stats.comparisons} 次，交换 ${stats.swaps} 次。`, stats))
  return steps
}
