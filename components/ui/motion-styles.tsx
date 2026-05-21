/** 全局柔和动效（页面渐入、呼吸、卡片 hover、聊天动画） */
export function MotionStyles() {
  return (
    <style>{`
      @keyframes wg-page-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes wg-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
      }
      @keyframes wg-msg-fade-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes wg-thinking-pulse {
        0%, 100% { opacity: 0.45; }
        50% { opacity: 1; }
      }
      @keyframes wg-modal-in {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .wg-page-in { animation: wg-page-in 0.6s ease-out both; }
      .wg-modal-in { animation: wg-modal-in 0.5s ease-out both; }
      .wg-character-breathe {
        display: inline-block;
        animation: wg-breathe 4s ease-in-out infinite;
        will-change: transform;
      }
      .wg-panel-card, .wg-inner-card {
        transition: transform 0.45s ease, box-shadow 0.45s ease;
      }
      .wg-msg-fade-in {
        animation: wg-msg-fade-in 0.65s ease-out both;
        will-change: opacity, transform;
      }
      .wg-thinking-dot { animation: wg-thinking-pulse 1.4s ease-in-out infinite; }
      .wg-thinking-dot:nth-child(2) { animation-delay: 0.2s; }
      .wg-thinking-dot:nth-child(3) { animation-delay: 0.4s; }
      @media (hover: hover) and (pointer: fine) {
        .wg-panel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px -12px rgba(251, 146, 60, 0.18), 0 4px 16px -6px rgba(120, 113, 108, 0.08);
        }
        .wg-inner-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px -10px rgba(251, 146, 60, 0.2);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .wg-page-in, .wg-modal-in, .wg-character-breathe, .wg-msg-fade-in, .wg-thinking-dot {
          animation: none !important;
        }
        .wg-panel-card, .wg-inner-card { transition: none; }
        .wg-panel-card:hover, .wg-inner-card:hover { transform: none; }
      }
    `}</style>
  );
}
