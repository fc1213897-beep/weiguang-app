"use client";

type Props = { message: string };

export default function Toast({ message }: Props) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[120] -translate-x-1/2 rounded-full bg-stone-900 px-3 py-1.5 text-xs text-white shadow-lg">
      {message}
    </div>
  );
}
