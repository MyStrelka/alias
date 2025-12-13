// Добавлены 'click' и 'win' в типы
type ToneName = 'start' | 'tick' | 'correct' | 'skip' | 'timeout' | 'click' | 'win'

const toneDefinitions: Record<ToneName, number[]> = {
  start: [880, 660, 990],
  tick: [1200],
  correct: [660, 880],
  skip: [330],
  timeout: [220, 196, 174],
  click: [1400], // Короткий высокий звук
  win: [523, 659, 783, 1046], // Мажорный аккорд (До мажор)
}

export class SoundManager {
  private audioCtx?: AudioContext
  private _muted: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
       this._muted = localStorage.getItem('alias_muted') === 'true'
    }
  }

  // Сеттер для синхронизации с состоянием React/Zustand
  set muted(value: boolean) {
    this._muted = value
    localStorage.setItem('alias_muted', String(value))
  }

  get muted() {
    return this._muted
  }

  private ensureCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  play(tone: ToneName) {
    if (this._muted) return

    try {
      this.ensureCtx()
      const ctx = this.audioCtx!
      
      // Если контекст был приостановлен (политика автозапуска браузеров)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const freqs = toneDefinitions[tone]
      const now = ctx.currentTime

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        // Немного разная длительность для разных типов звуков
        const noteDuration = tone === 'click' ? 0.05 : 0.18
        const overlap = tone === 'win' ? 0.1 : 0.08

        const startAt = now + idx * overlap
        
        gain.gain.setValueAtTime(0.12, startAt)
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + noteDuration)
        
        osc.start(startAt)
        osc.stop(startAt + noteDuration + 0.05)
      })
    } catch (err) {
      console.warn('Audio blocked or error', err)
    }
  }
}

export const soundManager = new SoundManager()