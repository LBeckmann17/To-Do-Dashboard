const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f97316','#ef4444','#f59e0b','#06b6d4']

export function fireConfetti(x, y, accentColor) {
  const colors = accentColor ? [accentColor, ...COLORS] : COLORS
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('div')
    el.className = 'confetti'
    el.style.background = colors[Math.floor(Math.random() * colors.length)]
    el.style.left = x + 'px'
    el.style.top = y + 'px'
    document.body.appendChild(el)

    const angle = (Math.random() * 360) * (Math.PI / 180)
    const dist = 55 + Math.random() * 90
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist - 40

    el.animate(
      [
        { transform: `translate(0,0) rotate(0deg) scale(1)`, opacity: 1 },
        { transform: `translate(${tx}px,${ty}px) rotate(${Math.random() * 540}deg) scale(0)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }
    ).onfinish = () => el.remove()
  }
}
