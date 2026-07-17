import React, { useState, useMemo } from 'react'
import { Card, Button, Input, Space, Tabs, Typography, Tag } from 'antd'
import { usePlayer } from './hooks/usePlayer'
import { BarChart } from './components/BarChart'
import { PlayerControls } from './components/PlayerControls'
import { BSTAnimation } from './components/BSTAnimation'
import { bubbleSort, selectionSort, insertionSort, quickSort } from './algorithms'
import type { Frame } from './algorithms'

const { Title, Text } = Typography

const algorithms: Record<string, { name: string; fn: (input: number[]) => Frame[] }> = {
  bubble: { name: '冒泡排序', fn: bubbleSort },
  selection: { name: '选择排序', fn: selectionSort },
  insertion: { name: '插入排序', fn: insertionSort },
  quick: { name: '快速排序', fn: quickSort },
}

function generateArray(size = 8): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10)
}

const SortingAnimation: React.FC = () => {
  const [algo, setAlgo] = useState('bubble')
  const [inputArr, setInputArr] = useState<number[]>(() => generateArray())
  const [customInput, setCustomInput] = useState('')

  const steps = useMemo(() => algorithms[algo].fn(inputArr), [algo, inputArr])
  const player = usePlayer(steps)

  const handleCustomInput = () => {
    const arr = customInput.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n) && n > 0)
    if (arr.length >= 2) {
      setInputArr(arr)
      setCustomInput('')
    }
  }

  return (
    <div>
      <Space wrap style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        {Object.entries(algorithms).map(([key, { name }]) => (
          <Button
            key={key}
            type={algo === key ? 'primary' : 'default'}
            onClick={() => setAlgo(key)}
          >
            {name}
          </Button>
        ))}
      </Space>

      <Space style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Button onClick={() => setInputArr(generateArray())}>随机生成</Button>
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onPressEnter={handleCustomInput}
          placeholder="自定义数组（逗号分隔）"
          style={{ width: 200 }}
        />
        <Button onClick={handleCustomInput}>确定</Button>
      </Space>

      <BarChart frame={player.frame} />

      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>{player.frame.desc}</Text>
          <Space>
            <Tag color="blue">比较 {player.frame.stats.comparisons}</Tag>
            <Tag color="red">交换 {player.frame.stats.swaps}</Tag>
          </Space>
        </div>
      </Card>

      <PlayerControls player={player} />
    </div>
  )
}

const App: React.FC = () => {
  const items = [
    {
      key: 'sorting',
      label: '排序算法（范式 A）',
      children: <SortingAnimation />,
    },
    {
      key: 'bst',
      label: '二叉搜索树（范式 B）',
      children: <BSTAnimation />,
    },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>算法动画可视化</Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        把算法的每一次"思考"翻译成看得见的高亮 + 听得懂的话
      </Text>
      <Card>
        <Tabs items={items} centered />
      </Card>
    </div>
  )
}

export default App
