"use client";

const SHIMMER_BG = "linear-gradient(90deg, rgba(133,200,255,0.04) 0%, rgba(133,200,255,0.10) 50%, rgba(133,200,255,0.04) 100%)";

const SHIMMER_STYLE: React.CSSProperties = {
  background: SHIMMER_BG,
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s linear infinite",
};

export function SkeletonLine({ width = "100%", height = 10 }: { width?: number | string; height?: number }) {
  return (
    <div
      className="rounded"
      style={{ ...SHIMMER_STYLE, width, height }}
    />
  );
}

export function SkeletonBlock({ width = "100%", height = 80, radius = 12 }: { width?: number | string; height?: number; radius?: number }) {
  return (
    <div style={{ ...SHIMMER_STYLE, width, height, borderRadius: radius }} />
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        ...SHIMMER_STYLE,
        width: size,
        height: size,
        borderRadius: size / 4,
      }}
    />
  );
}

export function SkeletonProjectRow() {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{ borderBottom: "1px solid rgba(133,200,255,0.05)" }}
    >
      <div style={{ ...SHIMMER_STYLE, width: 80, height: 22, borderRadius: 8 }} />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine width="55%" height={11} />
        <SkeletonLine width="30%" height={9} />
      </div>
      <div style={{ ...SHIMMER_STYLE, width: 60, height: 14, borderRadius: 6 }} />
      <div style={{ ...SHIMMER_STYLE, width: 40, height: 14, borderRadius: 6 }} />
    </div>
  );
}

export function SkeletonCandidateCard() {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "rgba(10,22,40,0.55)", border: "1px solid rgba(133,200,255,0.07)" }}
    >
      <div className="flex items-start gap-3">
        <SkeletonAvatar size={40} />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine width="70%" height={11} />
          <SkeletonLine width="50%" height={9} />
        </div>
        <div style={{ ...SHIMMER_STYLE, width: 56, height: 56, borderRadius: 28 }} />
      </div>
      <SkeletonLine width="100%" height={9} />
      <SkeletonLine width="85%" height={9} />
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ ...SHIMMER_STYLE, width: 50 + i * 8, height: 18, borderRadius: 6 }} />
        ))}
      </div>
      <SkeletonBlock height={36} radius={12} />
    </div>
  );
}

export function SkeletonCandidateRow() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl"
      style={{ background: "rgba(133,200,255,0.02)", border: "1px solid rgba(133,200,255,0.05)" }}
    >
      <div style={{ ...SHIMMER_STYLE, width: 18, height: 18, borderRadius: 4 }} />
      <SkeletonAvatar size={36} />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine width="60%" height={10} />
        <SkeletonLine width="35%" height={8} />
      </div>
      <div style={{ ...SHIMMER_STYLE, width: 60, height: 16, borderRadius: 6 }} />
      <div style={{ ...SHIMMER_STYLE, width: 40, height: 14, borderRadius: 4 }} />
    </div>
  );
}
