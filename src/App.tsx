import { useState, useRef, useEffect, useMemo } from 'react'
import './App.css'

const EXAMPLE_SETS = [
  ['삼겹살', '족발', '양꼬치'],
  ['치킨', '피자', '짜장면', '초밥'],
  ['영화 보기', '산책하기', '집에서 쉬기'],
]

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function App() {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [displayText, setDisplayText] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addOption = () => {
    const trimmed = input.trim()
    if (!trimmed || options.includes(trimmed)) return
    setOptions(prev => [...prev, trimmed])
    setInput('')
    setResult(null)
    setShowResult(false)
    inputRef.current?.focus()
  }

  const removeOption = (opt: string) => {
    setOptions(prev => prev.filter(o => o !== opt))
    setResult(null)
    setShowResult(false)
  }

  const loadExample = () => {
    const ex = getRandomItem(EXAMPLE_SETS)
    setOptions(ex)
    setResult(null)
    setShowResult(false)
  }

  const ask = () => {
    if (options.length < 2 || spinning) return
    setResult(null)
    setShowResult(false)
    setSpinning(true)

    let elapsed = 0
    const totalDuration = 2200
    const fastInterval = 80
    const slowInterval = 220

    const spin = () => {
      setDisplayText(getRandomItem(options))
      elapsed += fastInterval

      if (elapsed < totalDuration * 0.6) {
        intervalRef.current = setTimeout(spin, fastInterval)
      } else if (elapsed < totalDuration) {
        intervalRef.current = setTimeout(spin, slowInterval)
      } else {
        const final = getRandomItem(options)
        setDisplayText(final)
        setResult(final)
        setSpinning(false)
        setTimeout(() => setShowResult(true), 100)
      }
    }

    spin()
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addOption()
  }

  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      size: `${Math.random() * 2 + 1}px`,
    })), [])

  return (
    <div className="app">
      <div className="stars" aria-hidden="true">
        {stars.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            animationDelay: s.delay,
            width: s.size, height: s.size,
          }} />
        ))}
      </div>

      <div className="container">
        <header className="header">
          <div className="conch-icon">🐚</div>
          <h1>마법의 소라고둥</h1>
          <p className="subtitle">무엇이든 물어보세요. 소라고둥이 결정해 드립니다.</p>
        </header>

        <div className="card input-card">
          <div className="input-row">
            <input
              ref={inputRef}
              type="text"
              placeholder="선택지를 입력하세요..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-input"
              maxLength={30}
            />
            <button className="add-btn" onClick={addOption} disabled={!input.trim()}>
              추가
            </button>
          </div>

          {options.length === 0 && (
            <button className="example-btn" onClick={loadExample}>
              예시 불러오기
            </button>
          )}

          {options.length > 0 && (
            <div className="chips">
              {options.map(opt => (
                <span key={opt} className="chip">
                  {opt}
                  <button className="chip-remove" onClick={() => removeOption(opt)} aria-label={`${opt} 삭제`}>
                    ×
                  </button>
                </span>
              ))}
              <button className="example-btn small" onClick={() => { setOptions([]); setResult(null); setShowResult(false) }}>
                초기화
              </button>
            </div>
          )}
        </div>

        <div className="conch-area">
          <button
            className={`conch-btn ${spinning ? 'spinning' : ''} ${options.length < 2 ? 'disabled' : ''}`}
            onClick={ask}
            disabled={options.length < 2 || spinning}
            aria-label="소라고둥에게 물어보기"
          >
            <span className="conch-emoji">🐚</span>
            <span className="conch-label">{spinning ? '생각 중...' : '물어보기!'}</span>
            {options.length < 2 && <span className="hint">선택지를 2개 이상 입력하세요</span>}
          </button>
        </div>

        {(spinning || result) && (
          <div className={`result-card ${showResult ? 'revealed' : ''}`}>
            <div className="result-label">소라고둥의 선택</div>
            <div className={`result-text ${spinning ? 'flickering' : ''}`}>
              {displayText}
            </div>
            {showResult && (
              <div className="result-sub">이것이 운명입니다 ✨</div>
            )}
          </div>
        )}

        {result && !spinning && (
          <button className="retry-btn" onClick={ask}>
            다시 물어보기
          </button>
        )}
      </div>
    </div>
  )
}
