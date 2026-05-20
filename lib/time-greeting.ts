/** 按时间段划分的本地问候语（不接 API） */

export type TimePeriod = "morning" | "afternoon" | "evening" | "lateNight";

/** 各时段问候语：温柔、不说教、低压力 */
const GREETINGS: Record<TimePeriod, readonly string[]> = {
  morning: [
    "早安呀，醒来就好，今天不必一开始就赶满分。",
    "早上好，先喝口水、伸个懒腰，我们再慢慢开始。",
    "新的一天来了，哪怕只背几个词，也是在往前。",
    "清晨的光很柔，你也一样可以慢慢来。",
    "早呀，今天先定一个小目标就很棒。",
  ],
  afternoon: [
    "下午好，学累了就歇一会儿，我在这儿陪你。",
    "午后时光，不必和自己较劲，一点点推进就好。",
    "下午了呢，完成一个小任务就已经很值得。",
    "如果有点困，也没关系，深呼吸再继续。",
    "下午的光暖洋洋的，我们按自己的节奏走就好。",
  ],
  evening: [
    "晚上好，今天走到这里已经很不容易了。",
    "夜幕降下，不必复盘太多，先照顾好自己。",
    "晚上还在学习的话，记得也给自己留一点休息。",
    "一天快结束了，哪怕只前进了一小步，也很棒。",
    "晚上呢，慢慢来，不用把今天补成完美。",
  ],
  lateNight: [
    "这么晚还没睡呀，别太逼自己，能歇就歇一会儿。",
    "深夜了，眼睛累了就闭眼一会儿，我陪着你。",
    "夜很深了，若还在学，记得轻一点、慢一点。",
    "这个时候还醒着，已经很辛苦了，对自己温柔些。",
    "凌晨的时光静悄悄的，不必赶进度，照顾好身体最重要。",
  ],
};

/** 各时段温柔陪伴文案（弹窗等场景使用） */
const COMPANION_LINES: Record<TimePeriod, readonly string[]> = {
  morning: [
    "我会一直陪着你，今天我们一起慢慢来。",
    "不用着急赶路，按你的节奏开始就好。",
    "有什么想说的，随时可以来找我聊聊。",
    "今天的小目标，做完一个就很值得开心。",
    "备考的路很长，但今天这一步，我们一起走。",
  ],
  afternoon: [
    "午后也别忘了照顾自己，我一直在这儿。",
    "累了就歇一歇，回来我们再继续。",
    "不必和昨天的自己比较，今天有进步就够。",
    "想倾诉的时候，小光随时在。",
    "一点一点来，这条长路你不是一个人。",
  ],
  evening: [
    "今天辛苦了，剩下的我们明天再慢慢来。",
    "晚上也别熬太晚，身体要紧。",
    "无论今天完成了多少，你都已经在前进。",
    "睡前若还想说说话，我在这儿听着。",
    "今天的你，已经做得很棒了。",
  ],
  lateNight: [
    "这么晚了，先抱抱辛苦了一天的自己。",
    "若还在学，记得温柔一点，别把自己逼太紧。",
    "困了就睡，明天醒来我们再一起开始。",
    "深夜的学习搭子，只有我和你，慢慢来。",
    "不管多晚，你都不是一个人在熬。",
  ],
};

function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * 根据当前时间判断时段
 * - 早上：5:00–11:59
 * - 下午：12:00–17:59
 * - 晚上：18:00–23:59
 * - 深夜：0:00–4:59
 */
export function getTimePeriod(date: Date = new Date()): TimePeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 17) return "afternoon";
  if (hour >= 18 && hour <= 23) return "evening";
  return "lateNight";
}

/** 从当前时段的问候语中随机取一句 */
export function getRandomTimeGreeting(date: Date = new Date()): string {
  return pickRandom(GREETINGS[getTimePeriod(date)]);
}

/** 从当前时段的陪伴文案中随机取一句 */
export function getRandomCompanionLine(date: Date = new Date()): string {
  return pickRandom(COMPANION_LINES[getTimePeriod(date)]);
}

/** 欢迎弹窗：一次性获取问候语 + 陪伴文案 */
export function getWelcomeContent(date: Date = new Date()) {
  const period = getTimePeriod(date);
  return {
    period,
    greeting: pickRandom(GREETINGS[period]),
    companion: pickRandom(COMPANION_LINES[period]),
  };
}
