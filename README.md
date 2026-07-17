# 算法动画设计规范（可复用方法论）

> 本文档提炼了一套「让算法动画**看得懂、又好看**」的完整方法论。
> 你可以把它整份丢给任意大模型，让它按这套规范来生成动画代码。
> 技术栈以 React + SVG 为例，但**核心思想与框架无关**（Vue / 原生 JS / Canvas 同样适用）。

---

## 0. 为什么"看得懂"？——三条根本原因

大多数 AI 生成的动画"能跑但看不懂"，是因为它们只展示**结果的变化**（数组突然重排了），却不展示**过程中的意图**。本规范能看懂，靠的是三点：

1. **每一个"有意义的判断"都单独成一帧。** 比较 a 和 b 是一帧、决定交换是另一帧、交换完成又是一帧。不要把"比较+交换"挤成一步。
2. **每一帧都带一句"人话"解说 + 高亮 + 统计。** 用户不需要读代码，看高亮的格子 + 底部那句话就知道现在在干嘛、为什么。
3. **永远保留"上下文记忆"。** 已经排好的元素一直保持绿色、已访问的结点一直变灰——用户能一眼看出"进度到哪了"，而不是每帧都从零辨认。

> 一句话总结：**动画不是给结果做特效，而是把算法的"决策流"逐帧翻译成视觉 + 文字。**

---

## 1. 两种动画范式

根据对象不同，用两套不同的架构。**先判断你要做的属于哪一类。**

| 范式                  | 适用对象                                               | 核心机制                                                 | 交互                         |
| --------------------- | ------------------------------------------------------ | -------------------------------------------------------- | ---------------------------- |
| **A. 帧序列播放器**   | 排序、查找、图遍历、DP 等**一次性跑完的算法**          | 先算出完整 `steps[]`，再用播放器逐帧回放                 | 播放/暂停/单步/调速/拖进度条 |
| **B. 交互式操作动画** | 树、链表、栈、堆、散列表等**用户随时增删改的数据结构** | 每次操作即时用 `await sleep()` 播放，快照逐帧 `setState` | 输入值 → 点"插入/删除/查找"  |

**判断口诀**：

- 「给我一个数组，跑一遍给我看」→ 用范式 A。
- 「我要反复往里插入、删除，看它怎么变」→ 用范式 B。

---

## 2. 范式 A：帧序列播放器

### 2.1 核心数据结构——"帧（frame）"

算法**不直接操作 DOM**，而是把执行过程记录成一个数组 `steps`，每个元素是一"帧"，描述**那一瞬间的完整可视状态**：

```js
// 一帧的标准结构
{
  array: [5, 2, 8, 1],        // 当前数据快照（必须深拷贝！）
  colors: { 0: 'compare', 1: 'compare' },  // 哪些下标高亮成什么语义
  desc: '比较 a[0]=5 与 a[1]=2',           // 一句人话解说
  stats: { comparisons: 3, swaps: 1 }      // 累计统计量
}
```

关键：一个 `frame()` 工厂函数，**每次都深拷贝**，否则所有帧会指向同一个引用、回放时全变成最终状态：

```js
function frame(array, colors, desc, stats) {
  return {
    array: [...array],        // ← 深拷贝，血泪教训
    colors: { ...colors },
    desc,
    stats: { ...stats }
  }
}
```

### 2.2 算法怎么写——"边算边打帧"

把普通算法改造成"产帧算法"：**在每个关键决策点 `steps.push(frame(...))`**。以冒泡排序为例：

```js
export function bubbleSort(input) {
  const arr = [...input]
  const n = arr.length
  const steps = []
  const stats = { comparisons: 0, swaps: 0 }
  const sorted = {}   // 记忆：已归位的下标（保持绿色的关键）

  // 开场帧：说明这个算法要干嘛
  steps.push(frame(arr, {}, '开始冒泡排序：反复比较相邻元素，把较大值往后"冒泡"。', stats))

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      stats.comparisons++
      // ① 比较帧：高亮正在比的两个，注意 ...sorted 保留已排好的绿色
      steps.push(frame(arr, { ...sorted, [j]: 'compare', [j + 1]: 'compare' },
        `比较 a[${j}]=${arr[j]} 与 a[${j + 1}]=${arr[j + 1]}`, stats))

      if (arr[j] > arr[j + 1]) {
        stats.swaps++
        const left = arr[j]
        const right = arr[j + 1]
        arr[j] = right
        arr[j + 1] = left
        // ② 交换帧：交换动作单独成帧，用 'swap' 语义
        steps.push(frame(arr, { ...sorted, [j]: 'swap', [j + 1]: 'swap' },
          `${left} > ${right}，交换两者`, stats))
      }
    }
    sorted[n - 1 - i] = 'sorted'   // ③ 本轮最大值归位
    steps.push(frame(arr, { ...sorted }, `第 ${i + 1} 轮结束，位置 ${n - 1 - i} 已归位`, stats))
  }
  sorted[0] = 'sorted'
  // 收尾帧：报告总成果
  steps.push(frame(arr, { ...sorted }, `排序完成！共比较 ${stats.comparisons} 次，交换 ${stats.swaps} 次。`, stats))
  return steps
}
```

**打帧的黄金粒度**（最重要的经验）：

- ✅ 比较是一帧，交换是另一帧 —— 让用户看清"因为 A>B，所以才换"。
- ✅ 每帧的 `colors` 都 `{ ...sorted, ...本帧高亮 }` —— 已排好的元素**不会掉色**。
- ✅ `desc` 里带**具体数值**（`a[0]=5`），不要只说"比较元素"。
- ❌ 不要一个循环只 push 一帧最终结果。
- ❌ 不要在一帧里同时改动多处又不解释。

### 2.3 播放器 Hook（框架无关的核心逻辑）

播放器只做一件事：**持有一个 `index`，定时 `+1`，取 `steps[index]` 给视图渲染。**

```js
export function usePlayer(steps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)          // 0.25× ~ 4×
  const timerRef = useRef(null)

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [steps])

  useEffect(() => {
    if (!playing) return
    if (index >= steps.length - 1) { setPlaying(false); return }
    const safeSpeed = Math.min(4, Math.max(0.25, speed))
    const delay = 600 / safeSpeed                 // 倍速 = 改间隔（0.25x ~ 4x）
    timerRef.current = setTimeout(() => setIndex(i => i + 1), delay)
    return () => clearTimeout(timerRef.current)
  }, [playing, index, speed, steps.length])

  return {
    index, playing, speed, setSpeed,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    next: () => setIndex(i => Math.min(i + 1, steps.length - 1)),  // 单步前进
    prev: () => setIndex(i => Math.max(i - 1, 0)),                 // 单步后退
    reset: () => setIndex(0),
    seek: (i) => setIndex(i),                                      // 拖进度条
    frame: steps[index],
    total: steps.length
  }
}
```

因为帧是**预先算好的纯数据**，所以"单步后退""拖动进度条"天然免费——直接改 `index` 即可。这是范式 A 相比"实时动画"的最大优势。

### 2.4 视图层——把帧画出来

视图**只读当前帧**，无任何算法逻辑：

```jsx
const frame = player.frame
const maxVal = Math.max(...frame.array)

<div className="bars">
  {frame.array.map((v, i) => {
    const type = frame.colors[i] || 'default'    // 查这一格的语义
    return (
      <div className={`bar bar-${type}`}          // 用 CSS class 上色
           style={{ height: `${(v / maxVal) * 100}%` }}>
        <span>{v}</span>
      </div>
    )
  })}
</div>

<div className="desc-bar">
  <span>{frame.desc}</span>                        {/* 那句人话 */}
  <span>比较 {frame.stats.comparisons} · 交换 {frame.stats.swaps}</span>
</div>
```

### 2.5 帧模型的图版（Prim/Kruskal/拓扑/关键路径/Floyd）

图论算法同样用范式 A（预生成帧 + 播放器），只是帧结构换成“图状态”：

```js
// 一帧
{
  desc,
  nodes: { 3: 'in-tree', 5: 'active' },        // 顶点 id → 语义
  edges: { '2-4': 'chosen', '1-3': 'reject' },  // 边 key → 语义
  extra: { matrix, order, ve, vl }              // 附加面板数据（可选）
}
```

要点：

- **边 key 统一**：无向边用排序后的 `min-max`，有向边用 `u>v`；产帧与渲染必须用同一套 key。
- **已选边持续高亮**：和排序的 `sorted` 一样，用一个 `chosen` 对象累积，每帧 `{...chosen, ...本帧候选}`。
- **extra 面板**：图之外的信息（Floyd 距离矩阵、拓扑序列、关键路径 ve/vl 表）放进 `extra`，视图侧渲染成表格并高亮当前行列（如 Floyd 的中转点 k）。
- 顶点用固定坐标（手工摆位），边按两点连线；有向图加箭头 marker、并按半径缩短端点避免被结点圆盖住。

---

## 3. 范式 B：交互式数据结构动画

树 / 链表 / 堆 / 散列表这类，用户会**反复插入删除**，不适合"预生成全部帧"。改用**即时播放**：一次操作里，边改状态边 `await sleep()`。

### 3.1 三大件

```js
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const busy = useRef(false)   // 防止动画播放中重复触发

// 统一包装：保证同一时刻只有一个操作在跑
const run = (fn) => (async () => {
  if (busy.current) return
  busy.current = true
  try {
    await fn()
  } finally {
    busy.current = false
  }
})()
```

### 3.2 关键技巧：`rootRef`（真实结构）+ `state`（当前展示的快照）

对树这种带旋转/分裂的结构，直接改 React state 很痛苦。做法是：

- 用 `useRef` 存**真实的、可变的**数据结构（含 parent 指针等辅助字段）。
- 操作时**在 ref 上就地修改**，在每个关键步骤 `clone()` 出一份**不含循环引用的纯快照**，push 进 `frames`。
- 最后逐帧 `setState` + `sleep` 播放这些快照。

```js
const insert = () => run(async () => {
  const frames = []
  const snap = (msg, highlightIds) =>
    frames.push({ tree: clone(rootRef.current), msg, hl: highlightIds })

  // ——在 rootRef 上就地做算法，每到关键点 snap 一次——
  // 例：下降查找路径
  snap('沿查找路径下降到叶结点', pathIds)
  // 例：插入
  snap(`将 ${val} 插入`, [newNodeId])
  // 例：旋转/分裂
  snap(`结点上溢：中间值 ${median} 上升到父结点`, [parentId])

  // ——统一回放——
  for (const f of frames) {
    setDisplay(f.tree)
    setHighlight(new Set(f.hl))
    setMsg(f.msg)
    await sleep(1000)          // 每步停留，让用户看清
  }
  setHighlight(new Set())
})
```

对**简单结构**（如 BST 查找、栈、队列），可以省去 frames 数组，直接在循环里 `setState + await sleep`：

```js
const search = () => run(async () => {
  const path = []
  let cur = root
  while (cur) {
    path.push(cur.id)
    setActive(new Set(path))              // 高亮当前路径
    setMsg(`比较 ${val} 与结点 ${cur.val}`)
    await sleep(450)                       // 停顿
    if (val === cur.val) { setMsg(`命中 ${val}！`); return }
    cur = val < cur.val ? cur.left : cur.right
  }
  setMsg(`查找失败：不存在 ${val}`)
})
```

### 3.3 clone 一定要断开引用

带 parent 指针的结构，clone 时**只保留渲染需要的字段**，否则 setState 会因循环引用出问题：

```js
function clone(n) {
  if (!n) return null
  return { id: n.id, val: n.val, color: n.color, bf: n.bf,   // 只留展示字段
           left: clone(n.left), right: clone(n.right) }       // 不带 parent
}
```

### 3.4 自动演示模式（一键连播）

交互式结构除了手动按钮，最好再给一个「自动演示」：点一下就自动连续做一串操作。关键是**不重复实现逻辑**——把单次操作抽成参数化核心，手动和自动共用：

```js
// ① 把核心逻辑抽成“接收参数、无 busy 守卫”的函数
const doInsert = async (v) => { /* 在 rootRef 上就地改 + 逐帧播放 */ }

// ② 手动按钮：包一层 busy 守卫
const insert = () => run(() => doInsert(val))

// ③ 自动演示：同一把锁内 for 循环连播
const autoDemo = () => run(async () => {
  rootRef.current = null
  for (const v of [50, 30, 70, 20, 40, 10]) {
    await doInsert(v)          // 复用同一核心，动画完全一致
    await sleep(500)
  }
})
```

**为什么能连播？** 因为结构存在 `rootRef`（ref 跨 await 持久），每次 `doInsert` 都从最新的树接着做。

**state-based 结构（数组/栈/堆/散列表）的坑**：`useState` 的值在同一次 `run` 里不会随 `await` 更新（闭包捕获的是旧值）。两个解法：

1. 也改用 ref 作为唯一真相源（树类推荐）；
2. 在 `autoDemo` 内维护一个**本地工作副本** `let work = [...]`，每步 `setXxx([...work])` 渲染——简单结构用这个最省事。

务必**保留所有手动按钮**，自动演示是“额外的一个按钮”，不是替代。

---

## 4. 渲染约定

### 4.1 颜色语义表（务必全局统一）

**同一种颜色在整个应用里永远代表同一件事**，这是"看得懂"的视觉基础：

| 语义 class           | 含义                | 建议色   |
| -------------------- | ------------------- | -------- |
| `default`            | 未处理              | 灰蓝     |
| `compare`            | 正在比较            | 黄色     |
| `swap`               | 正在交换/写入       | 红/橙    |
| `sorted` / `visited` | 已完成/已访问       | 绿色     |
| `pivot`              | 基准点              | 紫色     |
| `min` / `key`        | 当前最小 / 待插入值 | 青色     |
| `active`             | 当前聚焦结点        | 高亮描边 |
| `path`               | 最终路径            | 亮绿     |

配色写在 CSS 变量里，`.bar-compare`、`.tree-node.active` 这样按 class 上色，**视图层不写颜色判断逻辑**。

### 4.2 树的布局算法（BST/AVL/红黑树通用）

核心思想：**中序遍历序号定 x，深度定 y**——中序序号天然保证左子树在左、右子树在右、不重叠。

```js
function layoutTree(root) {
  const nodes = [], edges = []
  const padX = 40, padY = 40, hGap = 72, vGap = 84
  let col = 0
  function dfs(node, depth) {
    if (!node) return
    dfs(node.left, depth + 1)
    const x = padX + col * hGap; col++     // 中序第几个 → x
    const y = padY + depth * vGap          // 深度 → y
    node._pos = { x, y }
    nodes.push({ id: node.id, val: node.val, x, y })
    dfs(node.right, depth + 1)
  }
  function collectEdges(node) {
    if (!node) return
    if (node.left) {
      edges.push({ x1: node._pos.x, y1: node._pos.y, x2: node.left._pos.x, y2: node.left._pos.y })
      collectEdges(node.left)
    }
    if (node.right) {
      edges.push({ x1: node._pos.x, y1: node._pos.y, x2: node.right._pos.x, y2: node.right._pos.y })
      collectEdges(node.right)
    }
  }
  dfs(root, 0)
  collectEdges(root)
  const width = Math.max(padX * 2, padX * 2 + Math.max(0, col - 1) * hGap)
  const height = Math.max(padY * 2, ...nodes.map(node => node.y + padY))
  return { nodes, edges, width, height }
}
```

多路树（B 树）不同：**叶子按顺序占位，内部结点居中于其孩子的 x 跨度**。

用 SVG 画：`<line>` 画边（先画，在底层），`<circle>+<text>` 画结点（后画，在上层）。

### 4.3 更多布局套路

不同结构的坐标算法：

- **森林（并查集）**：先按 `parent` 建 children 列表找出所有根，对每棵树跑“中序序号定 x / 深度定 y”，树与树之间留间隔。
- **B 树（多路）**：叶子按顺序占位累加 x；内部结点 `x = (第一个孩子.x + 最后一个孩子.x) / 2`，居中于孩子跨度；结点是含多个关键字的方框，用竖线分隔。
- **堆（数组↔完全二叉树）**：不用递归，直接由下标算坐标。结点 i（从 1 计）：`depth = ⌊log2(i)⌋`（JavaScript 可写作 `Math.floor(Math.log2(i))`），层内序号 `i - 2 ** depth`，`x = (序号 + 0.5) / 2 ** depth × 宽度`。同时并排画一行数组，下标与树结点一一对应联动高亮。
- **哈夫曼构造过程**：构造阶段把“森林”画成一排 chip（字符+权值），每步高亮被合并的两个最小权；构造完成后再切换成完整树（边标 0/1）+ 编码表 + WPL。
- **线索/前驱后继箭头**：在树布局之上叠加带弧度的虚线（`Q` 二次贝塞尔），前驱/后继用不同颜色 + 箭头 marker，和实线树边区分开。

---

## 5. 各类算法"打帧配方"速查

| 算法类型         | 每帧高亮什么                | 关键帧节点                                            |
| ---------------- | --------------------------- | ----------------------------------------------------- |
| **冒泡/插入**    | 相邻两元素                  | 比较→交换/后移→本轮归位                               |
| **选择**         | 当前最小 `min` + 扫描位     | 更新最小值→轮末交换                                   |
| **快排**         | `pivot` + 双指针            | 选基准→分区扫描→交换→递归边界                         |
| **归并**         | 左右两段 + 写回位           | 分割→比较两段头→写回                                  |
| **堆排序**       | 父结点 + 较大孩子           | 建堆下沉→堆顶换尾→归位                                |
| **希尔/基数**    | 分组/桶                     | 希尔：按 gap 分组插入；基数：按位分配到桶→收集        |
| **二分查找**     | low/mid/high 三点           | 算 mid→比较→折半缩范围                                |
| **BFS/DFS**      | `frontier` 队列 + `visited` | 出队→扩展邻居→标记访问→回溯路径                       |
| **Dijkstra**     | 当前最短结点 + 松弛边       | 选最小 dist→松弛→更新                                 |
| **堆（结构）**   | 当前结点 + 父/孩子          | 插入：表尾上浮；删顶：表尾填顶后下沉                  |
| **树旋转(AVL)**  | 失衡结点 + 平衡因子         | 定位最小不平衡子树→判 LL/RR/LR/RL→旋转                |
| **红黑树**       | 新结点 + 叔/祖父            | 插入染红→看叔结点颜色→变色/旋转修复→根染黑            |
| **B树分裂**      | 上溢结点 + 中间值           | 找叶子→插入→溢出→中值上升→分裂右兄弟                  |
| **散列冲突**     | 探测的槽位                  | 算 H(key)→冲突→探测下一位/挂链→落位                   |
| **哈夫曼树**     | 最小的两棵树                | 取二最小权→合并生成新结点→放回森林                    |
| **并查集**       | Find 路径 / 两根            | 向上找根→按规模合并→（Find 时）路径压缩               |
| **线索化**       | 当前结点                    | 按先/中/后序：空左→前驱线索、空右→后继线索            |
| **Prim/Kruskal** | 横切边 / 待考察边           | Prim：选最小横切边并点；Kruskal：按权取边、并查集判环 |
| **拓扑排序**     | 入度 0 结点                 | 取入度 0→输出→删出边、邻接点入度-1                    |
| **关键路径**     | 关键活动边                  | 正拓扑求 ve→逆拓扑求 vl→余量 0 的即关键               |
| **Floyd**        | 中转点 k 行列               | 每轮固定 k→检查 d[i][k]+d[k][j] < d[i][j] 则更新      |

**通用配方**：找出算法里所有的 `if 判断` 和 `循环体的一次迭代`，每一个都值得一帧 + 一句解说。

---

## 6. 给大模型的 Prompt 模板（可直接复制）

> 把下面这段连同本文档一起发给你的模型：

```text
请按「算法动画设计规范」实现 <算法名> 的可视化，严格遵守：

1. 【架构】用"帧序列 + 播放器"范式（若是可交互数据结构则用"即时 sleep 播放"范式）。
2. 【产帧】算法不直接操作视图，而是返回 steps[] 数组；在每个"比较""交换""写入""判断分支"处都 push 一帧。宁可帧多，不要帧少。
3. 【每帧四要素】必须包含：
   - 数据快照（深拷贝！）
   - colors：{下标: 语义}，语义用固定词表 compare/swap/sorted/pivot/min/key/active/path
   - desc：一句中文人话解说，必须带具体数值（如"比较 a[2]=8 与 a[3]=1"）
   - stats：累计比较/交换次数
4. 【上下文记忆】已完成的元素（已排好/已访问）在后续所有帧里保持其完成态颜色，不要掉色。用一个 sorted/visited 对象累积，每帧展开 {...sorted, ...本帧高亮}。
5. 【颜色语义全局统一】同一颜色在任何算法里含义一致，用 CSS class 上色，视图层不写颜色判断逻辑。
6. 【播放器】支持 播放/暂停/单步前进/单步后退/调速(0.25~4×)/拖动进度条。因为帧是预生成的纯数据，后退和拖动只需改 index。
7. 【解说优先】用户不看代码，只看"高亮 + 底部那句话"就要懂现在在干嘛、为什么这么做。

先给出产帧函数（含详细打帧点），再给出视图渲染，最后给出播放器。
```

---

## 7. 一句话心法

> **好动画 = 把算法的每一次"思考"（比较、判断、决策）都翻译成一帧"看得见的高亮 + 听得懂的话"，并且永远让用户知道"已经完成了多少"。**

AI 默认只翻译"数据的变化"，你要它翻译的是"**决策的过程**"——这就是能看懂和看不懂的全部区别。