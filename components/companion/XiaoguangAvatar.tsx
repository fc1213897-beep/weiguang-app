import TimeGreeting from "@/components/companion/TimeGreeting";
import { Card } from "@/components/ui/card";
import { wgTokens } from "@/lib/tokens";

type Props = {
  compact?: boolean;
};

/** 小光角色区：呼吸动画 + 时段问候 */
export default function XiaoguangAvatar({ compact = false }: Props) {
  if (compact) {
    return (
      <Card variant="inner" className="flex min-w-0 items-start gap-2.5 p-2.5">
        <span
          className={`${wgTokens.motion.breathe} shrink-0 text-2xl`}
          aria-hidden
        >
          🌙
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-700">小光</p>
          <TimeGreeting className="mt-0.5 line-clamp-3 text-xs leading-5 text-stone-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="inner" className="shrink-0 px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`${wgTokens.motion.breathe} shrink-0 text-3xl lg:text-4xl`}
          aria-hidden
        >
          🌙
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-stone-700">小光</p>
          <TimeGreeting className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6" />
        </div>
      </div>
    </Card>
  );
}
