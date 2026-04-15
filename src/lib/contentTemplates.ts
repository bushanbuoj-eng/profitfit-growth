export type Platform = "instagram" | "tiktok" | "youtube" | "facebook" | "twitter";

export interface ContentOutput {
  script: string;
  caption: string;
  cta: string;
  dm: string;
}

const platformLabels: Record<Platform, { en: string; ar: string }> = {
  instagram: { en: "Instagram", ar: "إنستغرام" },
  tiktok: { en: "TikTok", ar: "تيك توك" },
  youtube: { en: "YouTube", ar: "يوتيوب" },
  facebook: { en: "Facebook", ar: "فيسبوك" },
  twitter: { en: "X (Twitter)", ar: "إكس (تويتر)" },
};

export function getPlatformLabel(platform: Platform, language: "en" | "ar"): string {
  return platformLabels[platform][language];
}

export function getAllPlatforms(): Platform[] {
  return ["instagram", "tiktok", "youtube", "facebook", "twitter"];
}

// --- English templates by platform ---

const enTemplates: Record<Platform, ((idea: string) => ContentOutput)[]> = {
  instagram: [
    (idea) => ({
      script: `[HOOK] "Stop scrolling if you want to ${idea}..."\n\n[BODY] Here's the truth nobody tells you about ${idea}. Most people get it wrong because they skip the fundamentals. Let me break it down in 30 seconds.\n\n[CLOSE] Follow for more tips and DM me 'START' to begin your transformation.`,
      caption: `🔥 The secret to ${idea} that 99% of people miss.\n\nI've helped hundreds of clients achieve this, and it always comes down to ONE thing...\n\nSave this post. You'll need it. 💪\n\n#fitness #coaching #${idea.replace(/\s+/g, "")}`,
      cta: `Ready to master ${idea}? Drop a 🔥 in the comments and I'll send you my free guide!`,
      dm: `Hey! Thanks for reaching out about ${idea}. I'd love to help you get started. Let's book a quick 15-min call to create your personalized plan. When works best for you?`,
    }),
    (idea) => ({
      script: `[HOOK] "This ${idea} tip changed everything for my clients..."\n\n[BODY] After working with 500+ clients, I found the #1 mistake people make with ${idea} is overcomplicating it. Here's the simple approach that works.\n\n[CLOSE] Share this with someone who needs it. Follow for daily tips.`,
      caption: `🎯 Master ${idea} with this ONE simple change.\n\nYour competition isn't doing this. That's exactly why you should.\n\nDouble tap if you're ready to level up! ❤️\n\n#fitnesstips #gymlife #${idea.replace(/\s+/g, "")}`,
      cta: `Stop guessing, start growing. DM me '${idea.toUpperCase().slice(0, 10)}' for exclusive access to my proven system!`,
      dm: `Hey there! Great to connect about ${idea}. I help people just like you get real results without the guesswork. My next group starts soon — want to grab one of the last spots?`,
    }),
  ],
  tiktok: [
    (idea) => ({
      script: `[HOOK - 0-3s] "POV: You finally figured out ${idea}..."\n\n[BODY - 3-25s] Here's the 3-step method I teach all my clients:\n1. Start with the basics\n2. Stay consistent for 21 days\n3. Track everything\n\n[CLOSE - 25-30s] Follow for part 2! Comment 'MORE' for the full guide.`,
      caption: `POV: ${idea} just clicked 🧠💪\n\nThis 3-step method works EVERY time.\n\n#fyp #fitness #${idea.replace(/\s+/g, "")} #gymtok #fitnesstips`,
      cta: `Comment 'MORE' and I'll DM you the full ${idea} guide for FREE 🔥`,
      dm: `Hey! Saw you commented on my ${idea} video. Here's the full breakdown I promised. Want me to walk you through it on a quick call?`,
    }),
    (idea) => ({
      script: `[HOOK - 0-3s] "Nobody talks about this ${idea} hack..."\n\n[BODY - 3-25s] I've been a coach for 5 years and this is the one thing that separates people who get results from those who don't. It's simpler than you think.\n\n[CLOSE - 25-30s] Stitch this with your results! Follow for more.`,
      caption: `The ${idea} hack nobody talks about 🤫\n\nSave this before it blows up.\n\n#fyp #gymtok #fitnesshack #${idea.replace(/\s+/g, "")}`,
      cta: `Stitch this video with your results! DM me 'PLAN' for a free custom strategy.`,
      dm: `Hey! Thanks for the interest in ${idea}. I put together a quick custom plan idea for you — want me to send it over?`,
    }),
  ],
  youtube: [
    (idea) => ({
      script: `[INTRO] What's up everyone! Today I'm going to show you exactly how to ${idea} — and I promise, by the end of this video, you'll have a clear action plan.\n\n[BODY] Let's break this into 3 phases...\nPhase 1: Foundation — get the basics right\nPhase 2: Build momentum — consistency is key\nPhase 3: Scale up — this is where the magic happens\n\n[OUTRO] If this helped, smash that subscribe button and hit the bell. Drop a comment with your biggest takeaway!`,
      caption: `How to ${idea} — The Complete Guide (2024)\n\nIn this video, I break down the exact 3-phase method I use with my clients to achieve incredible results with ${idea}.\n\n⏱️ Timestamps:\n0:00 Intro\n1:30 Phase 1: Foundation\n5:00 Phase 2: Momentum\n9:00 Phase 3: Scale\n12:00 Final thoughts`,
      cta: `📌 FREE resource in the description! Download my complete ${idea} blueprint and start seeing results this week.`,
      dm: `Hey! Thanks for watching my ${idea} video. I noticed you've been engaging with my content — would love to learn more about your goals. Let's connect!`,
    }),
  ],
  facebook: [
    (idea) => ({
      script: `[HOOK] Are you tired of struggling with ${idea}? You're not alone.\n\n[BODY] I asked my community what their #1 challenge was, and ${idea} came up over and over. Here's what I tell every single one of my clients...\n\nThe key is simplicity. Stop overcomplicating it.\n\n[CLOSE] Share this post with someone who needs to hear this today.`,
      caption: `💡 Real talk about ${idea}.\n\nI've worked with hundreds of people on this exact topic, and here's what I've learned:\n\n✅ Keep it simple\n✅ Stay consistent\n✅ Get accountability\n\nWho else needed to hear this? Tag them below! 👇`,
      cta: `Want personalized help with ${idea}? Comment 'READY' and I'll reach out with a free strategy session link!`,
      dm: `Hi! I saw your comment about ${idea}. I'd love to help you create a plan that actually works. Would you be open to a quick chat this week?`,
    }),
  ],
  twitter: [
    (idea) => ({
      script: `Thread: How to ${idea} (a step-by-step breakdown) 🧵\n\n1/ Most people overcomplicate ${idea}. Here's the simple framework I use with every client.\n\n2/ Step 1: Define your goal clearly. Vague goals = vague results.\n\n3/ Step 2: Build a daily routine around it. Consistency beats intensity.\n\n4/ Step 3: Track your progress weekly. What gets measured gets managed.\n\n5/ Step 4: Get a coach or accountability partner. You'll 3x your results.\n\n6/ That's it. Simple, not easy. But it works every single time.\n\nRepost if this helped ♻️`,
      caption: `The truth about ${idea} that nobody wants to hear:\n\nIt's not complicated. You just need to start.\n\n🔁 Repost if you agree`,
      cta: `Want my free ${idea} guide? Reply 'SEND' and I'll DM it to you.`,
      dm: `Hey! Sending over that ${idea} guide as promised. Let me know if you want help creating a custom plan — happy to jump on a quick call.`,
    }),
  ],
};

// --- Arabic templates by platform ---

const arTemplates: Record<Platform, ((idea: string) => ContentOutput)[]> = {
  instagram: [
    (idea) => ({
      script: `[مقدمة] "توقف عن التصفح إذا كنت تريد ${idea}..."\n\n[المحتوى] إليك الحقيقة التي لا يخبرك بها أحد عن ${idea}. معظم الناس يخطئون لأنهم يتجاوزون الأساسيات. دعني أشرح لك في 30 ثانية.\n\n[الخاتمة] تابعني للمزيد من النصائح وأرسل لي 'ابدأ' لبدء تحولك.`,
      caption: `🔥 السر في ${idea} الذي يفوته 99% من الناس.\n\nلقد ساعدت مئات العملاء على تحقيق ذلك، والأمر يعود دائماً لشيء واحد...\n\nاحفظ هذا المنشور. ستحتاجه. 💪\n\n#لياقة #تدريب #${idea.replace(/\s+/g, "_")}`,
      cta: `مستعد لإتقان ${idea}؟ ضع 🔥 في التعليقات وسأرسل لك دليلي المجاني!`,
      dm: `مرحباً! شكراً لتواصلك بخصوص ${idea}. أود مساعدتك في البدء. لنحجز مكالمة سريعة مدتها 15 دقيقة لإنشاء خطتك المخصصة. متى يناسبك؟`,
    }),
    (idea) => ({
      script: `[مقدمة] "هذه النصيحة عن ${idea} غيرت كل شيء لعملائي..."\n\n[المحتوى] بعد العمل مع أكثر من 500 عميل، وجدت أن أكبر خطأ يرتكبه الناس مع ${idea} هو تعقيده. إليك الطريقة البسيطة التي تعمل فعلاً.\n\n[الخاتمة] شارك هذا مع شخص يحتاجه. تابعني للنصائح اليومية.`,
      caption: `🎯 أتقن ${idea} بتغيير واحد بسيط.\n\nمنافسوك لا يفعلون هذا. لهذا يجب عليك أنت أن تفعله.\n\nاضغط مرتين إذا كنت مستعداً للارتقاء! ❤️\n\n#نصائح_لياقة #حياة_الجيم #${idea.replace(/\s+/g, "_")}`,
      cta: `توقف عن التخمين، وابدأ بالنمو. أرسل لي '${idea.slice(0, 10)}' للحصول على وصول حصري لنظامي المُثبت!`,
      dm: `مرحباً! سعيد بالتواصل معك بخصوص ${idea}. أساعد أشخاصاً مثلك في الحصول على نتائج حقيقية. مجموعتي القادمة تبدأ قريباً — هل تريد حجز مقعد؟`,
    }),
  ],
  tiktok: [
    (idea) => ({
      script: `[مقدمة - 0-3 ثواني] "تخيل أنك أخيراً فهمت ${idea}..."\n\n[المحتوى - 3-25 ثانية] إليك طريقة الـ 3 خطوات التي أعلمها لكل عملائي:\n1. ابدأ بالأساسيات\n2. التزم لمدة 21 يوماً\n3. تتبع كل شيء\n\n[الخاتمة - 25-30 ثانية] تابعني للجزء الثاني! اكتب 'المزيد' للدليل الكامل.`,
      caption: `تخيل: ${idea} أصبح واضحاً 🧠💪\n\nهذه الطريقة تنجح في كل مرة.\n\n#fyp #لياقة #${idea.replace(/\s+/g, "_")} #جيم_توك`,
      cta: `اكتب 'المزيد' وسأرسل لك دليل ${idea} الكامل مجاناً 🔥`,
      dm: `مرحباً! رأيت تعليقك على فيديو ${idea}. إليك الشرح الكامل الذي وعدتك به. هل تريد أن أشرحه لك في مكالمة سريعة؟`,
    }),
  ],
  youtube: [
    (idea) => ({
      script: `[المقدمة] أهلاً بالجميع! اليوم سأوضح لكم بالضبط كيف تحققون ${idea} — وأعدكم أنه بنهاية هذا الفيديو سيكون لديكم خطة عمل واضحة.\n\n[المحتوى] لنقسم هذا إلى 3 مراحل...\nالمرحلة 1: الأساس — ضبط الأساسيات\nالمرحلة 2: بناء الزخم — الاستمرارية هي المفتاح\nالمرحلة 3: التوسع — هنا يحدث السحر\n\n[الخاتمة] إذا استفدت، اضغط على زر الاشتراك وفعّل الجرس. اكتب في التعليقات أهم نقطة استفدت منها!`,
      caption: `كيف تحقق ${idea} — الدليل الشامل\n\nفي هذا الفيديو، أشرح طريقة الـ 3 مراحل التي أستخدمها مع عملائي لتحقيق نتائج مذهلة.\n\n⏱️ الفهرس:\n0:00 المقدمة\n1:30 المرحلة 1: الأساس\n5:00 المرحلة 2: الزخم\n9:00 المرحلة 3: التوسع\n12:00 الخلاصة`,
      cta: `📌 مورد مجاني في الوصف! حمّل خطة ${idea} الكاملة وابدأ بتحقيق النتائج هذا الأسبوع.`,
      dm: `مرحباً! شكراً لمشاهدة فيديو ${idea}. لاحظت تفاعلك مع محتواي — أحب أن أعرف المزيد عن أهدافك. لنتواصل!`,
    }),
  ],
  facebook: [
    (idea) => ({
      script: `[مقدمة] هل سئمت من المعاناة مع ${idea}؟ لست وحدك.\n\n[المحتوى] سألت مجتمعي عن أكبر تحدٍ يواجههم، و${idea} ظهر مراراً وتكراراً. إليك ما أقوله لكل عميل...\n\nالمفتاح هو البساطة. توقف عن التعقيد.\n\n[الخاتمة] شارك هذا المنشور مع شخص يحتاج أن يسمع هذا اليوم.`,
      caption: `💡 كلام صريح عن ${idea}.\n\nعملت مع مئات الأشخاص في هذا الموضوع بالذات، وإليك ما تعلمته:\n\n✅ اجعله بسيطاً\n✅ كن مستمراً\n✅ احصل على محاسبة\n\nمن يحتاج أن يسمع هذا؟ أشر إليه أدناه! 👇`,
      cta: `تريد مساعدة مخصصة في ${idea}؟ اكتب 'مستعد' وسأتواصل معك برابط جلسة استراتيجية مجانية!`,
      dm: `مرحباً! رأيت تعليقك عن ${idea}. أحب أن أساعدك في إنشاء خطة تعمل فعلاً. هل أنت مستعد لمحادثة سريعة هذا الأسبوع؟`,
    }),
  ],
  twitter: [
    (idea) => ({
      script: `ثريد: كيف تحقق ${idea} (شرح خطوة بخطوة) 🧵\n\n1/ معظم الناس يعقّدون ${idea}. إليك الإطار البسيط الذي أستخدمه مع كل عميل.\n\n2/ الخطوة 1: حدد هدفك بوضوح. أهداف غامضة = نتائج غامضة.\n\n3/ الخطوة 2: ابنِ روتيناً يومياً. الاستمرارية تتفوق على الشدة.\n\n4/ الخطوة 3: تتبع تقدمك أسبوعياً. ما يُقاس يُدار.\n\n5/ الخطوة 4: احصل على مدرب أو شريك محاسبة. ستضاعف نتائجك 3 مرات.\n\n6/ هذا كل شيء. بسيط، لكن ليس سهلاً. لكنه ينجح في كل مرة.\n\nأعد التغريد إذا استفدت ♻️`,
      caption: `الحقيقة عن ${idea} التي لا يريد أحد أن يسمعها:\n\nليست معقدة. فقط تحتاج أن تبدأ.\n\n🔁 أعد التغريد إذا توافق`,
      cta: `تريد دليل ${idea} المجاني؟ رد بـ 'أرسل' وسأرسله لك في رسالة.`,
      dm: `مرحباً! أرسل لك دليل ${idea} كما وعدت. أخبرني إذا تريد مساعدة في إنشاء خطة مخصصة — سعيد بإجراء مكالمة سريعة.`,
    }),
  ],
};

export function generateContent(idea: string, language: "en" | "ar", platform: Platform): ContentOutput {
  const templates = language === "ar" ? arTemplates[platform] : enTemplates[platform];
  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx](idea);
}
