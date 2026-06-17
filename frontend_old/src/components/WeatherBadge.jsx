/**
 * WeatherBadge — Illustrated weather condition badge.
 * Usage: <WeatherBadge condition="sunny" temp={32} label="Sunny" />
 */

const weatherIcons = {
  sunny: { emoji: '☀️', bg: 'from-amber-50 to-orange-50', border: 'border-amber-200' },
  cloudy: { emoji: '⛅', bg: 'from-gray-50 to-blue-50', border: 'border-gray-200' },
  rainy: { emoji: '🌧️', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200' },
  storm: { emoji: '⛈️', bg: 'from-gray-100 to-purple-50', border: 'border-purple-200' },
  windy: { emoji: '💨', bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200' },
  hot: { emoji: '🔥', bg: 'from-red-50 to-orange-50', border: 'border-red-200' },
  cold: { emoji: '❄️', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200' },
  humid: { emoji: '💧', bg: 'from-teal-50 to-emerald-50', border: 'border-teal-200' },
};

export default function WeatherBadge({ condition = 'sunny', temp, label, humidity, wind }) {
  const w = weatherIcons[condition] || weatherIcons.sunny;

  return (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl 
                  bg-gradient-to-br ${w.bg} border ${w.border}
                  transition-all duration-250 hover:scale-[1.02]`}
    >
      <span className="text-2xl">{w.emoji}</span>

      <div className="flex flex-col">
        {temp !== undefined && (
          <span className="text-lg font-bold text-krushi-text leading-tight">
            {temp}°C
          </span>
        )}
        {label && (
          <span className="text-xs text-krushi-muted leading-tight">{label}</span>
        )}
      </div>

      {(humidity || wind) && (
        <div className="flex flex-col text-xs text-krushi-muted border-l border-gray-200 pl-3 ml-1">
          {humidity && <span>💧 {humidity}%</span>}
          {wind && <span>🌬️ {wind} km/h</span>}
        </div>
      )}
    </div>
  );
}
