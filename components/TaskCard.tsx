type Props = {
  text: string;
  done: boolean;
};

export default function TaskCard({
  text,
  done,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-orange-50 p-5">
      <span
        className={`text-lg ${
          done ? "line-through text-gray-400" : ""
        }`}
      >
        🌙 {text}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-sm text-white ${
          done ? "bg-green-500" : "bg-orange-400"
        }`}
      >
        {done ? "已完成" : "待完成"}
      </span>
    </div>
  );
}