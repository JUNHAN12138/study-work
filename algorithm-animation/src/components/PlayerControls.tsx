import React from 'react'
import { Button, Slider, Space, Typography } from 'antd'
import {
  CaretRightOutlined,
  PauseOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import type { PlayerState } from '../hooks/usePlayer'

const { Text } = Typography

interface PlayerControlsProps {
  player: PlayerState
}

const speedOptions = [0.25, 0.5, 1, 2, 4]

/** 播放器控制面板 —— 播放/暂停/单步/调速/进度条 */
export const PlayerControls: React.FC<PlayerControlsProps> = ({ player }) => {
  return (
    <div style={{ marginTop: 16 }}>
      <Space size="middle" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <Button icon={<UndoOutlined />} onClick={player.reset} title="重置" />
        <Button icon={<StepBackwardOutlined />} onClick={player.prev} title="单步后退" />
        {player.playing ? (
          <Button type="primary" icon={<PauseOutlined />} onClick={player.pause} title="暂停" />
        ) : (
          <Button type="primary" icon={<CaretRightOutlined />} onClick={player.play} title="播放" />
        )}
        <Button icon={<StepForwardOutlined />} onClick={player.next} title="单步前进" />
      </Space>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
        <Slider
          min={0}
          max={player.total - 1}
          value={player.index}
          onChange={(v) => player.seek(v)}
          style={{ flex: 1 }}
          tooltip={{ formatter: (v) => `${(v ?? 0) + 1} / ${player.total}` }}
        />
        <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
          {player.index + 1} / {player.total}
        </Text>
      </div>

      <Space size="small" style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <Text type="secondary">速度：</Text>
        {speedOptions.map(s => (
          <Button
            key={s}
            size="small"
            type={player.speed === s ? 'primary' : 'default'}
            onClick={() => player.setSpeed(s)}
          >
            {s}×
          </Button>
        ))}
      </Space>
    </div>
  )
}
