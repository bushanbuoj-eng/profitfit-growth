interface ContentOutput {
  script: string;
  caption: string;
  cta: string;
  dm: string;
}

const enTemplates: ((idea: string) => ContentOutput)[] = [
  (idea) => ({
    script: `[HOOK] "Stop scrolling if you want to ${idea}..."\n\n[BODY] Here's the truth nobody tells you about ${idea}. Most people get it wrong because they skip the fundamentals. Let me break it down for you in 30 seconds.\n\n[CLOSE] Follow for more tips and DM me 'START' to begin your transformation.`,
    caption: `🔥 The secret to ${idea} that 99% of people miss.\n\nI've helped hundreds of clients achieve this, and it always comes down to ONE thing...\n\nSave this post. You'll need it. 💪`,
    cta: `Ready to master ${idea}? Drop a 🔥 in the comments and I'll send you my free guide!`,
    dm: `Hey! Thanks for reaching out about ${idea}. I'd love to help you get started. Here's what I recommend: let's book a quick 15-min call to create your personalized plan. When works best for you?`,
  }),
  (idea) => ({
    script: `[HOOK] "If you're struggling with ${idea}, watch this."\n\n[BODY] I used to struggle with the same thing. Then I discovered a method that changed everything. It's simple, but most coaches won't share it because it's too effective.\n\n[CLOSE] Comment 'INFO' and I'll share the full method with you.`,
    caption: `💡 ${idea} doesn't have to be complicated.\n\nHere are 3 things I wish someone told me earlier:\n1. Start with consistency\n2. Focus on progressive results\n3. Trust the process\n\nWhich one do you struggle with most? 👇`,
    cta: `Want a custom plan for ${idea}? Link in bio to book your free consultation! 🚀`,
    dm: `Hey! I saw you're interested in ${idea}. That's awesome! I've put together a simple 3-step framework that could help. Want me to walk you through it? It takes about 10 minutes.`,
  }),
  (idea) => ({
    script: `[HOOK] "This ${idea} tip will change your life..."\n\n[BODY] After working with over 500 clients, I've found that the biggest mistake people make with ${idea} is overcomplicating it. Here's the simple approach that actually works.\n\n[CLOSE] Share this with someone who needs to hear it. And follow for daily tips.`,
    caption: `🎯 Master ${idea} with this ONE simple change.\n\nYour competition isn't doing this. That's exactly why you should.\n\nDouble tap if you're ready to level up! ❤️`,
    cta: `Stop guessing, start growing. DM me '${idea.toUpperCase().slice(0, 10)}' for exclusive access to my proven system!`,
    dm: `Hey there! Great to connect about ${idea}. I help people just like you get real results without the guesswork. My next group starts soon — would you like to grab one of the last spots?`,
  }),
];

const arTemplates: ((idea: string) => ContentOutput)[] = [
  (idea) => ({
    script: `[مقدمة] "توقف عن التصفح إذا كنت تريد ${idea}..."\n\n[المحتوى] إليك الحقيقة التي لا يخبرك بها أحد عن ${idea}. معظم الناس يخطئون لأنهم يتجاوزون الأساسيات. دعني أشرح لك في 30 ثانية.\n\n[الخاتمة] تابعني للمزيد من النصائح وأرسل لي 'ابدأ' لبدء تحولك.`,
    caption: `🔥 السر في ${idea} الذي يفوته 99% من الناس.\n\nلقد ساعدت مئات العملاء على تحقيق ذلك، والأمر يعود دائماً لشيء واحد...\n\nاحفظ هذا المنشور. ستحتاجه. 💪`,
    cta: `مستعد لإتقان ${idea}؟ ضع 🔥 في التعليقات وسأرسل لك دليلي المجاني!`,
    dm: `مرحباً! شكراً لتواصلك بخصوص ${idea}. أود مساعدتك في البدء. إليك ما أنصح به: لنحجز مكالمة سريعة مدتها 15 دقيقة لإنشاء خطتك المخصصة. متى يناسبك؟`,
  }),
  (idea) => ({
    script: `[مقدمة] "إذا كنت تعاني مع ${idea}، شاهد هذا."\n\n[المحتوى] كنت أعاني من نفس الشيء. ثم اكتشفت طريقة غيرت كل شيء. إنها بسيطة، لكن معظم المدربين لن يشاركوها لأنها فعالة جداً.\n\n[الخاتمة] اكتب 'معلومات' وسأشارك الطريقة الكاملة معك.`,
    caption: `💡 ${idea} لا يجب أن يكون معقداً.\n\nإليك 3 أشياء أتمنى لو أخبرني بها أحد مبكراً:\n1. ابدأ بالاستمرارية\n2. ركز على النتائج التدريجية\n3. ثق بالعملية\n\nأيهم تعاني معه أكثر؟ 👇`,
    cta: `تريد خطة مخصصة لـ ${idea}؟ الرابط في البايو لحجز استشارتك المجانية! 🚀`,
    dm: `مرحباً! رأيت أنك مهتم بـ ${idea}. هذا رائع! لقد أعددت إطار عمل بسيط من 3 خطوات يمكن أن يساعدك. هل تريد أن أشرحه لك؟ يستغرق حوالي 10 دقائق.`,
  }),
];

export function generateContent(idea: string, language: "en" | "ar"): ContentOutput {
  const templates = language === "ar" ? arTemplates : enTemplates;
  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx](idea);
}
