import React from 'react'

/**
 * 播放器控制面板 —— 播放/暂停/单步/调速/进度条
 */
export function PlayerControls({ player }) {
  const speedOptions = [0.25, 0.5, 1, 2, 4]

  return (
    <div className="player-controls">
      <div className="control-buttons">
        <button onClick={player.reset} title="重置">⏮</button>
        <button onClick={player.prev} title="单步后退">⏪</button>
        {player.playing ? (
          <button onClick={player.pause} title="暂停">⏸</button>
        ) : (
          <button onClick={player.play} title="播放">▶️</button>
        )}
        <button onClick={player.next} title="单步前进">⏩</button>
      </div>

      <div className="progress-bar">
        <input
          type="range"
          min={0}
          max={player.total - 1}
          value={player.index}
          onChange={(e) => player.seek(Number(e.target.value))}
        />
        <span className="progress-text">
          {player.index + 1} / {player.total}
        </span>
      </div>

      <div className="speed-control">
        <span>速度：</span>
        {speedOptions.map(s => (
          <button
            key={s}
            className={player.speed === s ? 'active' : ''}
            onClick={() => player.setSpeed(s)}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  )
}
