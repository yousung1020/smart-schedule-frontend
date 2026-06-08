
interface ColorPickerPanelProps {
  color: string;
  onChangeColor: (newColor: string) => void;
  presets: string[];
}

export const ColorPickerPanel = ({ color, onChangeColor, presets }: ColorPickerPanelProps) => {
  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#475569';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1e293b' : '#ffffff';
  };

  return (
    <div className="flex items-center gap-3 flex-wrap bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
      {presets.map(preset => (
        <button
          key={preset}
          type="button"
          onClick={() => onChangeColor(preset)}
          className={`w-9 h-9 rounded-full border transition-all ${color === preset ? 'border-slate-800 scale-110 shadow-md ring-4 ring-indigo-400/20' : 'border-slate-200 hover:scale-105'
            }`}
          style={{ backgroundColor: preset }}
        />
      ))}

      {/* 캘린더 일정 전용 커스텀 컬러 피커 조작 소자 */}
      <div className="relative w-9 h-9 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-white cursor-pointer hover:scale-105 transition-all shadow-sm ml-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChangeColor(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
        <div
          className="w-6 h-6 rounded-full border border-slate-200/50 shadow-inner"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* 가독성 보장형 대비 헥사코드 실시간 프리뷰 뱃지 */}
      <span
        className="ml-auto px-4 py-2 rounded-xl text-sm font-black border uppercase tracking-wider shadow-sm transition-all duration-300"
        style={{
          backgroundColor: color,
          color: getContrastColor(color),
          borderColor: 'transparent'
        }}
      >
        {color}
      </span>
    </div>
  );
};
