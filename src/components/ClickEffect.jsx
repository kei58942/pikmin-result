import { useState, useCallback } from 'react';

// 各色のエモジ演出
const EFFECTS = {
  red: { emoji: '\u{1F339}', label: 'バラ' },       // 🌹
  yellow: { emoji: '\u{1F436}', label: 'ポメラニアン' }, // 🐶
  blue: { emoji: '\u{1F41F}', label: 'ニジマス' },   // 🐟
};

function Particle({ id, emoji, x, y, onDone }) {
  return (
    <span
      key={id}
      className="pointer-events-none fixed text-2xl z-50 animate-float-up"
      style={{ left: x, top: y }}
      onAnimationEnd={() => onDone(id)}
    >
      {emoji}
    </span>
  );
}

export function useClickEffect() {
  const [particles, setParticles] = useState([]);

  const spawnEffect = useCallback((type, event) => {
    const effect = EFFECTS[type];
    if (!effect) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top;

    // 3〜5個のパーティクルを生成
    const count = 3 + Math.floor(Math.random() * 3);
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      emoji: effect.emoji,
      x: centerX + (Math.random() - 0.5) * 60,
      y: centerY - Math.random() * 20,
    }));

    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const removeParticle = useCallback((id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const EffectLayer = () => (
    <>
      {particles.map((p) => (
        <Particle
          key={p.id}
          id={p.id}
          emoji={p.emoji}
          x={p.x}
          y={p.y}
          onDone={removeParticle}
        />
      ))}
    </>
  );

  return { spawnEffect, EffectLayer };
}
