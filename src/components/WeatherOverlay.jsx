import { useState, useEffect } from 'react';

// OpenWeatherMap 無料API（墨田区の座標）
const LAT = 35.7107;
const LON = 139.8134;
const API_KEY = '284b04e34572f1a77b19dee4c74ef550'; // 無料デモキー
const CACHE_KEY = 'pikmin-weather-cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30分キャッシュ

function getCachedWeather() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.ts < CACHE_DURATION) return cached.data;
  } catch {}
  return null;
}

function setCachedWeather(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
}

// 天気IDからカテゴリに変換
function categorize(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return 'thunder';
  if (weatherId >= 300 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'cloudy';
  if (weatherId === 800) return 'clear';
  return 'cloudy'; // 801-804
}

// 晴れ: キラキラ光の粒子
function SunParticles() {
  return (
    <div className="weather-layer">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="sun-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// 雨: 斜めの雨粒 + 波紋
function RainDrops() {
  return (
    <div className="weather-layer">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: `${Math.random() * 110 - 10}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.6 + Math.random() * 0.4}s`,
          }}
        />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`r${i}`}
          className="rain-ripple"
          style={{
            left: `${10 + Math.random() * 80}%`,
            bottom: `${Math.random() * 20}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// 曇り: 雲の影
function CloudShadows() {
  return (
    <div className="weather-layer">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="cloud-shadow"
          style={{
            top: `${10 + i * 30}%`,
            animationDelay: `${i * 8}s`,
            animationDuration: `${20 + i * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// 雷: フラッシュ
function ThunderFlash() {
  return (
    <div className="weather-layer">
      <div className="thunder-flash" />
      <RainDrops />
    </div>
  );
}

// 雪: 雪の結晶
function SnowFall() {
  return (
    <div className="weather-layer">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="snow-flake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
            fontSize: `${6 + Math.random() * 8}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

const EFFECTS = {
  clear: SunParticles,
  rain: RainDrops,
  cloudy: CloudShadows,
  thunder: ThunderFlash,
  snow: SnowFall,
};

export default function WeatherOverlay({ onWeatherLoad }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const cached = getCachedWeather();
    if (cached) {
      setWeather(cached);
      onWeatherLoad?.(cached);
      return;
    }

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ja`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.weather) {
          const info = {
            id: data.weather[0].id,
            category: categorize(data.weather[0].id),
            description: data.weather[0].description,
            temp: Math.round(data.main.temp),
            icon: data.weather[0].icon,
          };
          setCachedWeather(info);
          setWeather(info);
          onWeatherLoad?.(info);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!weather) return null;

  const Effect = EFFECTS[weather.category] || CloudShadows;

  return <Effect />;
}
