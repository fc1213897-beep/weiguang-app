"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
};

export default function TaskInput({
  value,
  onChange,
  onAdd,
  placeholder = "例如：背50个英语单词",
}: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <input
        className="w-full min-w-0 flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-orange-400 sm:px-5 sm:py-4"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        type="button"
        className="w-full shrink-0 rounded-2xl bg-orange-500 px-6 py-3 text-white transition hover:bg-orange-600 sm:w-auto sm:py-4"
        onClick={onAdd}
      >
        添加任务
      </button>
    </div>
  );
}
