/**
 * CropCard — Displays a crop with its stage, sowing date, and optional actions.
 */
import { cropStageColors } from '../design/tokens';

export default function CropCard({ cropName, stage = 'Sowing', sowingDate, emoji, onClick }) {
  const stageStyle = cropStageColors[stage] || cropStageColors.Sowing;

  return (
    <div
      onClick={onClick}
      className="group relative bg-krushi-card rounded-xl p-4 shadow-card hover:shadow-card-hover 
                 transition-all duration-250 cursor-pointer border border-transparent 
                 hover:border-krushi-green-light/30"
    >
      {/* Crop emoji / icon */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0
                     transition-transform duration-250 group-hover:scale-110"
          style={{ background: stageStyle.bg }}
        >
          {emoji || stageStyle.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-krushi-text truncate text-[0.95rem]">{cropName}</h3>

          {/* Stage chip */}
          <span
            className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: stageStyle.bg, color: stageStyle.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: stageStyle.text }} />
            {stage}
          </span>

          {sowingDate && (
            <p className="text-xs text-krushi-muted mt-1.5">
              Sown: {sowingDate}
            </p>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-krushi-green/[0.02] opacity-0 
                      group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
