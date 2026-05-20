/** API 失败时的温柔兜底回复 */

const DEFAULT_REPLIES = [
  "今天先完成一个小目标就很好。",
  "累的话可以慢一点，我们一点点来。",
  "哪怕只是背 5 个单词，也是在前进。",
  "不用一下子做到完美，有在努力就够了。",
  "我在这儿陪你，一步一步来。",
];

export function getGentleFallbackReply(userText: string, index: number): string {
  const t = userText;

  if (/累|疲|困|睡/.test(t)) {
    return "累的话就歇一歇也没关系，缓过来了我们再慢慢开始。";
  }
  if (/焦虑|烦|压力|慌|内耗/.test(t)) {
    return "别急，我们先做眼前这一小步，就已经很好了。";
  }
  if (/不想|摆烂|放弃|学不动/.test(t)) {
    return "那今天先完成一个最小的任务吧，也算是在往前走。";
  }
  if (/难|学不会|看不懂|跟不上/.test(t)) {
    return "难的时候很正常，拆成小一点，就会轻松很多。";
  }
  if (/坚持|长期|备考|考研/.test(t)) {
    return "长期的事本来就需要耐心，你能走到这里已经很棒了。";
  }

  return DEFAULT_REPLIES[index % DEFAULT_REPLIES.length];
}
