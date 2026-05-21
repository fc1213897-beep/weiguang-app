"use client";

import { useEffect, useState } from "react";
import { getRandomTimeGreeting } from "@/lib/time-greeting";

type Props = {
  className?: string;
};

/** 进入页面后展示小光的时间段随机问候语 */
export default function TimeGreeting({ className }: Props) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setGreeting(getRandomTimeGreeting());
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <p className={className}>
      {greeting ?? "今天也慢慢来，不用一下子做到完美。"}
    </p>
  );
}
