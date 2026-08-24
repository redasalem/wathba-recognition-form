// كتالوج الطلاب المعتمد لكروت الدعوات وتكريم الكُتّاب 2026
// يشمل كافة التفاصيل: الأكواد المحدثة، الأجزاء والدرجات، وروابط الـ QR المباشرة
// تم تحديث الكتالوج ليشمل 146 طالباً مع تصحيح الدرجات وإضافة طلاب جزء الكهف

export const STUDENTS_CATALOG = [
  // 1. القرآن كاملاً (8 طلاب)
  { idx: 1, code: "#001", studentId: "STU-2026-001", name: "تسنيم أحمد سويلم", part: "القرآن كاملاً", score: 91.66, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },
  { idx: 2, code: "#002", studentId: "STU-2026-002", name: "روان طه شعيب", part: "القرآن كاملاً", score: 90.33, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },
  { idx: 3, code: "#003", studentId: "STU-2026-003", name: "محمد حسينى عكاز", part: "القرآن كاملاً", score: 89.83, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },
  { idx: 4, code: "#004", studentId: "STU-2026-004", name: "محمد وائل ناجى", part: "القرآن كاملاً", score: 89.33, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },
  { idx: 5, code: "#005", studentId: "STU-2026-005", name: "إبراهيم حسينى ناجى", part: "القرآن كاملاً", score: 85.83, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },
  { idx: 6, code: "#006", studentId: "STU-2026-006", name: "معاذ كيلانى الباجورى", part: "القرآن كاملاً", score: 85.66, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },
  { idx: 7, code: "#007", studentId: "STU-2026-007", name: "بسمة عبد الحميد الديهي", part: "القرآن كاملاً", score: 79.83, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },
  { idx: 8, code: "#008", studentId: "STU-2026-008", name: "محمد سعيد الجزار", part: "القرآن كاملاً", score: 76.0, tier: "👑 الفئة الأولى الذهبية (تاج الوقار)", gift: "شهادة تقدير + درع التكريم", totalParts: 30 },

  // 2. جزء الأعراف (4 طلاب)
  { idx: 9, code: "#055", studentId: "STU-2026-009", name: "نادين وليد بحيرى", part: "جزء الأعراف", score: 81.5, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 7 },
  { idx: 10, code: "#067", studentId: "STU-2026-010", name: "لوسندا عبد الرحمن الديهى", part: "جزء الأعراف", score: 79.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 7 },
  { idx: 11, code: "#070", studentId: "STU-2026-011", name: "محمد وليد بحيرى", part: "جزء الأعراف", score: 76.5, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 7 },
  { idx: 12, code: "#110", studentId: "STU-2026-012", name: "محمد مصطفى الشاعر", part: "جزء الأعراف", score: 65.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 7 },

  // 3. جزء التوبة (4 طلاب)
  { idx: 13, code: "#071", studentId: "STU-2026-013", name: "لارا عبد الرحمن الديهى", part: "جزء التوبة", score: 76.5, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 10 },
  { idx: 14, code: "#096", studentId: "STU-2026-014", name: "الروميثاء حسن الديهى", part: "جزء التوبة", score: 71.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 10 },
  { idx: 15, code: "#097", studentId: "STU-2026-015", name: "محمد فرج عبد المنعم", part: "جزء التوبة", score: 70.5, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 10 },
  { idx: 16, code: "#105", studentId: "STU-2026-016", name: "إسلام رزق البريمى", part: "جزء التوبة", score: 66.5, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 10 },

  // 4. جزء يوسف (4 طلاب)
  { idx: 17, code: "#027", studentId: "STU-2026-017", name: "عامر محمد العالم", part: "جزء يوسف", score: 89.5, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 12 },
  { idx: 18, code: "#057", studentId: "STU-2026-018", name: "مروان أحمد سويلم", part: "جزء يوسف", score: 80.5, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 12 },
  { idx: 19, code: "#098", studentId: "STU-2026-019", name: "عبد الملك علاء عبد الرازق", part: "جزء يوسف", score: 70.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 12 },
  { idx: 20, code: "#109", studentId: "STU-2026-020", name: "عبدالرحمن إبراهيم عربود", part: "جزء يوسف", score: 65.5, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 12 },

  // 5. جزء الكهف (12 طالباً)
  { idx: 21, code: "#018", studentId: "STU-2026-021", name: "نور حسيني عكاز", part: "جزء الكهف", score: 95.5, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 15 },
  { idx: 22, code: "#019", studentId: "STU-2026-022", name: "آدم خالد الطحان", part: "جزء الكهف", score: 94.5, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 15 },
  { idx: 23, code: "#025", studentId: "STU-2026-023", name: "روفيدا عبد المجيد عكاز", part: "جزء الكهف", score: 91.5, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 15 },
  { idx: 24, code: "#028", studentId: "STU-2026-024", name: "إنجي عبد المجيد عكاز", part: "جزء الكهف", score: 89.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 15 },
  { idx: 25, code: "#058", studentId: "STU-2026-025", name: "الآء ياسر ناجى", part: "جزء الكهف", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 15 },
  { idx: 26, code: "#084", studentId: "STU-2026-026", name: "جويرية وائل ناجي", part: "جزء الكهف", score: 75.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 15 },
  { idx: 27, code: "#144", studentId: "STU-2026-144", name: "مي فرحات سالم", part: "جزء الكهف", score: 75.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 15 },
  { idx: 28, code: "#145", studentId: "STU-2026-145", name: "محمد سامح شاهين", part: "جزء الكهف", score: 75.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 15 },
  { idx: 29, code: "#146", studentId: "STU-2026-146", name: "أسيل سامح شاهين", part: "جزء الكهف", score: 75.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 15 },
  { idx: 30, code: "#111", studentId: "STU-2026-027", name: "أسماء محمد الغول", part: "جزء الكهف", score: 65.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 15 },
  { idx: 31, code: "#113", studentId: "STU-2026-028", name: "حسن طه النجار", part: "جزء الكهف", score: 64.5, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 15 },
  { idx: 32, code: "#112", studentId: "STU-2026-029", name: "محمد طه النجار", part: "جزء الكهف", score: 64.5, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 15 },

  // 6. جزء الأنبياء (طالبان)
  { idx: 33, code: "#059", studentId: "STU-2026-030", name: "إبراهيم أحمد الديهى", part: "جزء الأنبياء", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 17 },
  { idx: 34, code: "#123", studentId: "STU-2026-031", name: "آدم تامر الغول", part: "جزء الأنبياء", score: 60.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 17 },

  // 7. جزء الفرقان (5 طلاب)
  { idx: 35, code: "#009", studentId: "STU-2026-032", name: "ريماس رضا شلبي", part: "جزء الفرقان", score: 100.0, tier: "🌟 فئة الأوائل 100%", gift: "شهادة تقدير وميدالية ذهبية", totalParts: 18 },
  { idx: 36, code: "#029", studentId: "STU-2026-033", name: "وفاء هاني راجح", part: "جزء الفرقان", score: 88.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 18 },
  { idx: 37, code: "#060", studentId: "STU-2026-034", name: "حذيفة حسن الديهى", part: "جزء الفرقان", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 18 },
  { idx: 38, code: "#072", studentId: "STU-2026-035", name: "يوسف بصيلة", part: "جزء الفرقان", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 18 },
  { idx: 39, code: "#124", studentId: "STU-2026-036", name: "مصطفى جنيدي", part: "جزء الفرقان", score: 60.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 18 },

  // 8. جزء العنكبوت (9 طلاب)
  { idx: 40, code: "#010", studentId: "STU-2026-037", name: "حسناء حسن الديهى", part: "جزء العنكبوت", score: 100.0, tier: "🌟 فئة الأوائل 100%", gift: "شهادة تقدير وميدالية ذهبية", totalParts: 20 },
  { idx: 41, code: "#020", studentId: "STU-2026-038", name: "هنا مبروك السمدوني", part: "جزء العنكبوت", score: 92.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 20 },
  { idx: 42, code: "#030", studentId: "STU-2026-039", name: "حسن عرفه الديهى", part: "جزء العنكبوت", score: 88.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 20 },
  { idx: 43, code: "#073", studentId: "STU-2026-040", name: "فيفي عشره", part: "جزء العنكبوت", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 20 },
  { idx: 44, code: "#099", studentId: "STU-2026-041", name: "عبد الرحمن البربري", part: "جزء العنكبوت", score: 68.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 20 },
  { idx: 45, code: "#125", studentId: "STU-2026-042", name: "ساره بصيلة", part: "جزء العنكبوت", score: 60.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 20 },
  { idx: 46, code: "#129", studentId: "STU-2026-043", name: "يوسف عشره", part: "جزء العنكبوت", score: 56.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 20 },
  { idx: 47, code: "#139", studentId: "STU-2026-044", name: "روضه بصيله", part: "جزء العنكبوت", score: 40.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 20 },
  { idx: 48, code: "#138", studentId: "STU-2026-045", name: "مريم تليمه", part: "جزء العنكبوت", score: 40.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 20 },

  // 9. جزء يس (10 طلاب)
  { idx: 49, code: "#011", studentId: "STU-2026-046", name: "محمد السعيد شخيخة", part: "جزء يس", score: 100.0, tier: "🌟 فئة الأوائل 100%", gift: "شهادة تقدير وميدالية ذهبية", totalParts: 22 },
  { idx: 50, code: "#015", studentId: "STU-2026-047", name: "محمود إبراهيم الديهي", part: "جزء يس", score: 96.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 22 },
  { idx: 51, code: "#031", studentId: "STU-2026-048", name: "أحمد عبد الشهيد عكاز", part: "جزء يس", score: 88.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 22 },
  { idx: 52, code: "#037", studentId: "STU-2026-049", name: "ريتاج مصطفي الهنداوي", part: "جزء يس", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 22 },
  { idx: 53, code: "#061", studentId: "STU-2026-050", name: "أحمد فرج عبد المنعم", part: "جزء يس", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 22 },
  { idx: 54, code: "#085", studentId: "STU-2026-051", name: "خالد زين القزاز", part: "جزء يس", score: 75.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 22 },
  { idx: 55, code: "#086", studentId: "STU-2026-052", name: "جودي الشوري", part: "جزء يس", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 22 },
  { idx: 56, code: "#100", studentId: "STU-2026-053", name: "ريتال عبد الحكيم بدوي", part: "جزء يس", score: 68.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 22 },
  { idx: 57, code: "#140", studentId: "STU-2026-054", name: "سندس مصطفي الشاعر", part: "جزء يس", score: 40.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 22 },
  { idx: 58, code: "#142", studentId: "STU-2026-055", name: "علياء مصطفي القبلاوي", part: "جزء يس", score: 28.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 22 },

  // 10. جزء الشورى (10 طلاب)
  { idx: 59, code: "#014", studentId: "STU-2026-056", name: "الشيماء عبد الغني شاهين", part: "جزء الشورى", score: 97.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 25 },
  { idx: 60, code: "#016", studentId: "STU-2026-057", name: "رحمة مهنا جمعة", part: "جزء الشورى", score: 96.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 25 },
  { idx: 61, code: "#035", studentId: "STU-2026-058", name: "رانسى سامح شاهين", part: "جزء الشورى", score: 86.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 25 },
  { idx: 62, code: "#074", studentId: "STU-2026-059", name: "على حسن الفقي", part: "جزء الشورى", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 25 },
  { idx: 63, code: "#087", studentId: "STU-2026-060", name: "روجين بصيلة", part: "جزء الشورى", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 25 },
  { idx: 64, code: "#130", studentId: "STU-2026-061", name: "ياسين الغول", part: "جزء الشورى", score: 56.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 25 },
  { idx: 65, code: "#135", studentId: "STU-2026-062", name: "جنى حسام الديهي", part: "جزء الشورى", score: 48.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 25 },
  { idx: 66, code: "#136", studentId: "STU-2026-063", name: "نورة مصطفى جنيدى", part: "جزء الشورى", score: 44.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 25 },
  { idx: 67, code: "#141", studentId: "STU-2026-064", name: "مى محمد الشال", part: "جزء الشورى", score: 40.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 25 },
  { idx: 68, code: "#143", studentId: "STU-2026-065", name: "أحمد سعد الطويل", part: "جزء الشورى", score: 24.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 25 },

  // 11. جزء الاحقاف (12 طالباً)
  { idx: 69, code: "#021", studentId: "STU-2026-066", name: "مودة محمود الشيشيني", part: "جزء الاحقاف", score: 92.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 26 },
  { idx: 70, code: "#026", studentId: "STU-2026-067", name: "الروميثاء عبدالحق مراد", part: "جزء الاحقاف", score: 90.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 26 },
  { idx: 71, code: "#036", studentId: "STU-2026-068", name: "عبدالحميد زين القزاز", part: "جزء الاحقاف", score: 85.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 26 },
  { idx: 72, code: "#038", studentId: "STU-2026-069", name: "حلا عبد الرحيم الزيات", part: "جزء الاحقاف", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 26 },
  { idx: 73, code: "#051", studentId: "STU-2026-070", name: "يوسف محمد سلامة", part: "جزء الاحقاف", score: 83.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 26 },
  { idx: 74, code: "#053", studentId: "STU-2026-071", name: "أحمد عماد مراد", part: "جزء الاحقاف", score: 82.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 26 },
  { idx: 75, code: "#056", studentId: "STU-2026-072", name: "محمد محمود أبوسكينة", part: "جزء الاحقاف", score: 81.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 26 },
  { idx: 76, code: "#075", studentId: "STU-2026-073", name: "ماجد عمار الصيفى", part: "جزء الاحقاف", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 26 },
  { idx: 77, code: "#089", studentId: "STU-2026-074", name: "ريماس حسام العالم", part: "جزء الاحقاف", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 26 },
  { idx: 78, code: "#088", studentId: "STU-2026-075", name: "مارية علاء عبد الرازق", part: "جزء الاحقاف", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 26 },
  { idx: 79, code: "#101", studentId: "STU-2026-076", name: "هنا محمد العالم", part: "جزء الاحقاف", score: 68.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 26 },
  { idx: 80, code: "#132", studentId: "STU-2026-077", name: "بلال حسام الديهي", part: "جزء الاحقاف", score: 52.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 26 },

  // 12. جزء الذاريات (10 طلاب)
  { idx: 81, code: "#022", studentId: "STU-2026-078", name: "آسيل السيد بدوي", part: "جزء الذاريات", score: 92.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 27 },
  { idx: 82, code: "#032", studentId: "STU-2026-079", name: "جويرية مصطفي كامل", part: "جزء الذاريات", score: 88.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 27 },
  { idx: 83, code: "#039", studentId: "STU-2026-080", name: "إبراهيم وائل ناجي", part: "جزء الذاريات", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 27 },
  { idx: 84, code: "#054", studentId: "STU-2026-081", name: "مريم عبد الحق مراد", part: "جزء الذاريات", score: 82.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 27 },
  { idx: 85, code: "#063", studentId: "STU-2026-082", name: "جنى عبد المجيد عكاز", part: "جزء الذاريات", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 27 },
  { idx: 86, code: "#062", studentId: "STU-2026-083", name: "يمنى إبراهيم بصيله", part: "جزء الذاريات", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 27 },
  { idx: 87, code: "#077", studentId: "STU-2026-084", name: "روان محمد الجوهري", part: "جزء الذاريات", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 27 },
  { idx: 88, code: "#076", studentId: "STU-2026-085", name: "يمنى محمد سلامه", part: "جزء الذاريات", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 27 },
  { idx: 89, code: "#090", studentId: "STU-2026-086", name: "حنين وليد بحيرى", part: "جزء الذاريات", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 27 },
  { idx: 90, code: "#114", studentId: "STU-2026-087", name: "محمد أحمد البربري", part: "جزء الذاريات", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 27 },

  // 13. جزء قد سمع (15 طالباً)
  { idx: 91, code: "#017", studentId: "STU-2026-088", name: "عمر أحمد أبوجلالة", part: "جزء قد سمع", score: 96.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 28 },
  { idx: 92, code: "#033", studentId: "STU-2026-089", name: "مريم محمد ناجي", part: "جزء قد سمع", score: 88.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 28 },
  { idx: 93, code: "#052", studentId: "STU-2026-090", name: "محمد علاء فايد", part: "جزء قد سمع", score: 83.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 28 },
  { idx: 94, code: "#069", studentId: "STU-2026-091", name: "رحمة زين القزاز", part: "جزء قد سمع", score: 77.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 28 },
  { idx: 95, code: "#068", studentId: "STU-2026-092", name: "رودينه محمد مطاوع", part: "جزء قد سمع", score: 77.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 28 },
  { idx: 96, code: "#078", studentId: "STU-2026-093", name: "ياسمين شريف أيوب", part: "جزء قد سمع", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 28 },
  { idx: 97, code: "#091", studentId: "STU-2026-094", name: "إياد عماد الصيفي", part: "جزء قد سمع", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 98, code: "#103", studentId: "STU-2026-095", name: "بسام سعد الطويل", part: "جزء قد سمع", score: 68.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 99, code: "#102", studentId: "STU-2026-096", name: "ريناد إبراهيم عكاز", part: "جزء قد سمع", score: 68.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 100, code: "#115", studentId: "STU-2026-097", name: "أحمد أحمد هنو", part: "جزء قد سمع", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 101, code: "#126", studentId: "STU-2026-098", name: "ريان علاء شرف الدين", part: "جزء قد سمع", score: 60.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 102, code: "#131", studentId: "STU-2026-099", name: "يحي إبراهيم بصيله", part: "جزء قد سمع", score: 56.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 103, code: "#134", studentId: "STU-2026-100", name: "لين أحمد الصباغ", part: "جزء قد سمع", score: 52.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 104, code: "#133", studentId: "STU-2026-101", name: "محمد صبحي أيوب", part: "جزء قد سمع", score: 52.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },
  { idx: 105, code: "#137", studentId: "STU-2026-102", name: "مريم مصطفي الشاعر", part: "جزء قد سمع", score: 44.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 28 },

  // 14. جزء تبارك (26 طالباً)
  { idx: 106, code: "#024", studentId: "STU-2026-103", name: "رقية رمضان شرشر", part: "جزء تبارك", score: 92.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 29 },
  { idx: 107, code: "#023", studentId: "STU-2026-104", name: "محمود عاطف الطحان", part: "جزء تبارك", score: 92.0, tier: "✨ فئة التفوق", gift: "شهادة تقدير وميدالية تكريم", totalParts: 29 },
  { idx: 108, code: "#034", studentId: "STU-2026-105", name: "مريم محمد نصر الدين", part: "جزء تبارك", score: 88.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 109, code: "#046", studentId: "STU-2026-106", name: "إبراهيم عاطف الطحان", part: "جزء تبارك", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 110, code: "#045", studentId: "STU-2026-107", name: "رغد رمضان شرشر", part: "جزء تبارك", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 111, code: "#044", studentId: "STU-2026-108", name: "سجدة عرفة نصر الدين", part: "جزء تبارك", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 112, code: "#043", studentId: "STU-2026-109", name: "عبد الرحمن أحمد الصباغ", part: "جزء تبارك", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 113, code: "#042", studentId: "STU-2026-110", name: "عبدالله عماد البربرى", part: "جزء تبارك", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 114, code: "#041", studentId: "STU-2026-111", name: "فرح وليد العالم", part: "جزء تبارك", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 115, code: "#040", studentId: "STU-2026-112", name: "يوسف مصطفي الهنداوي", part: "جزء تبارك", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 116, code: "#066", studentId: "STU-2026-113", name: "جني أحمد أبو ناجي", part: "جزء تبارك", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 117, code: "#065", studentId: "STU-2026-114", name: "سمر حامد زيد", part: "جزء تبارك", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 118, code: "#064", studentId: "STU-2026-115", name: "ليليان محمد بحري", part: "جزء تبارك", score: 80.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 119, code: "#079", studentId: "STU-2026-116", name: "عبد الله محمد فريج", part: "جزء تبارك", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 29 },
  { idx: 120, code: "#093", studentId: "STU-2026-117", name: "أحمد محمد الشال", part: "جزء تبارك", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 121, code: "#092", studentId: "STU-2026-118", name: "أمل أحمد الصاوي", part: "جزء تبارك", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 122, code: "#104", studentId: "STU-2026-119", name: "يارا حامد زيد", part: "جزء تبارك", score: 68.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 123, code: "#106", studentId: "STU-2026-120", name: "ريماس عبد التواب ناجي", part: "جزء تبارك", score: 66.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 124, code: "#122", studentId: "STU-2026-121", name: "جويرية عمر شرف الدين", part: "جزء تبارك", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 125, code: "#121", studentId: "STU-2026-122", name: "حاتم عادل شهاب", part: "جزء تبارك", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 126, code: "#120", studentId: "STU-2026-123", name: "ريتال ضياء الفوال", part: "جزء تبارك", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 127, code: "#119", studentId: "STU-2026-124", name: "ريتال عبد العال الفقى", part: "جزء تبارك", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 128, code: "#118", studentId: "STU-2026-125", name: "عمر أحمد الديهى", part: "جزء تبارك", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 129, code: "#117", studentId: "STU-2026-126", name: "مكه محمد ناجى", part: "جزء تبارك", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 130, code: "#116", studentId: "STU-2026-127", name: "نوران أيمن الطحان", part: "جزء تبارك", score: 64.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },
  { idx: 131, code: "#127", studentId: "STU-2026-128", name: "ياسمين فتحي سالم", part: "جزء تبارك", score: 60.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 29 },

  // 15. جزء عم وقصار السور (15 طالباً)
  { idx: 132, code: "#013", studentId: "STU-2026-129", name: "آدم حسن الفقى", part: "جزء عم وقصار السور", score: 100.0, tier: "🌟 فئة الأوائل 100%", gift: "شهادة تقدير وميدالية ذهبية", totalParts: 30 },
  { idx: 133, code: "#012", studentId: "STU-2026-130", name: "عمر رضا شرف الدين", part: "جزء عم وقصار السور", score: 100.0, tier: "🌟 فئة الأوائل 100%", gift: "شهادة تقدير وميدالية ذهبية", totalParts: 30 },
  { idx: 134, code: "#050", studentId: "STU-2026-131", name: "حمدى السيد أيوب", part: "جزء عم وقصار السور", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 135, code: "#049", studentId: "STU-2026-132", name: "رهف محمد نصر الدين", part: "جزء عم وقصار السور", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 136, code: "#048", studentId: "STU-2026-133", name: "يسر مصطفى كامل", part: "جزء عم وقصار السور", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 137, code: "#047", studentId: "STU-2026-134", name: "يوسف علي شرف الدين", part: "جزء عم وقصار السور", score: 84.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 138, code: "#083", studentId: "STU-2026-135", name: "أسينات على شرف الدين", part: "جزء عم وقصار السور", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 139, code: "#082", studentId: "STU-2026-136", name: "أشرف محمد ناجى", part: "جزء عم وقصار السور", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 140, code: "#081", studentId: "STU-2026-137", name: "جنات على الحلفاوى", part: "جزء عم وقصار السور", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 141, code: "#080", studentId: "STU-2026-138", name: "زهراء ياسر أبوناجى", part: "جزء عم وقصار السور", score: 76.0, tier: "📜 فئة الإجادة", gift: "شهادة تقدير وتكريم الكُتّاب", totalParts: 30 },
  { idx: 142, code: "#095", studentId: "STU-2026-139", name: "كريم جمعه شلبى", part: "جزء عم وقصار السور", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 30 },
  { idx: 143, code: "#094", studentId: "STU-2026-140", name: "محمود وليد العالم", part: "جزء عم وقصار السور", score: 72.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 30 },
  { idx: 144, code: "#108", studentId: "STU-2026-141", name: "إبراهيم إبراهيم فايد", part: "جزء عم وقصار السور", score: 66.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 30 },
  { idx: 145, code: "#107", studentId: "STU-2026-142", name: "فيروز عبد المجيد عكاز", part: "جزء عم وقصار السور", score: 66.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 30 },
  { idx: 146, code: "#128", studentId: "STU-2026-143", name: "محمد عباده العربي", part: "جزء عم وقصار السور", score: 60.0, tier: "🎁 فئة التشجيع والمواظبة", gift: "شهادة تقدير ومصحف شريف", totalParts: 30 }
];

// قائمة الأجزاء القرآنية الرسمية المعتمدة للترتيب والتصفية
export const QURAN_PARTS_ORDER = [
  "القرآن كاملاً",
  "جزء الأعراف",
  "جزء التوبة",
  "جزء يوسف",
  "جزء الكهف",
  "جزء الأنبياء",
  "جزء الفرقان",
  "جزء العنكبوت",
  "جزء يس",
  "جزء الشورى",
  "جزء الاحقاف",
  "جزء الذاريات",
  "جزء قد سمع",
  "جزء تبارك",
  "جزء عم وقصار السور"
];

// دالة لتوليد رابط ذكي ورمز QR لكل طالب
const defaultCatalogBaseUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app';
STUDENTS_CATALOG.forEach(s => {
  s.smart_url = `${defaultCatalogBaseUrl}/#/student/form?name=${encodeURIComponent(s.name)}`;
  s.qr_code_url = s.smart_url;
  s.qr_img_url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(s.smart_url)}&color=041915&bgcolor=ffffff`;
});

// دالة لتنظيف وتوحيد النصوص والأرقام العربية للبحث والمطابقة
export function normalizeArabic(text) {
  if (!text) return '';
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[٠-٩]/g, (w) => String(arabicNumbers.indexOf(w))) // تحويل الأرقام العربية إلى إنجليزية
    .replace(/[ًٌٍَُِّْـ]/g, '') // حذف التشكيل والتطويل
    .replace(/[أإآٱ]/g, 'ا') // توحيد الألف
    .replace(/ة/g, 'ه') // توحيد التاء المربوطة
    .replace(/ى/g, 'ي') // توحيد الياء
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // حذف الحروف المخفية
    .replace(/\s+/g, ' ') // توحيد المسافات
    .replace(/عبد\s+/g, 'عبد'); // توحيد الأسماء المركبة (عبد الرحمن -> عبدالرحمن)
}

// دالة الفحص والبحث الشامل للطلاب (اسم، كود، معرف، جزء، هاتف، شيخ، مدرسة)
export function matchesStudentSearch(student, searchStr) {
  if (!searchStr || !searchStr.trim()) return true;
  if (!student) return false;

  const rawQuery = searchStr.trim();
  const normQuery = normalizeArabic(rawQuery);
  const cleanCodeQuery = normQuery.replace(/^#/, '');

  // 1. مطابقة الاسم
  const normName = normalizeArabic(student.studentName || student.name || '');
  if (normName.includes(normQuery)) return true;

  // 2. مطابقة الكود التكريمي (مثال: #001، 001، 1، ٠٠١)
  const studentCodeRaw = String(student.studentCode || student.code || '');
  const cleanStudentCode = normalizeArabic(studentCodeRaw).replace(/^#/, '');
  if (cleanStudentCode && (
    cleanStudentCode.includes(cleanCodeQuery) ||
    (parseInt(cleanStudentCode, 10) === parseInt(cleanCodeQuery, 10) && !isNaN(parseInt(cleanCodeQuery, 10)))
  )) {
    return true;
  }
  if (studentCodeRaw.toLowerCase().includes(rawQuery.toLowerCase())) return true;

  // 3. مطابقة المعرف الرقمي STU-2026-XXX
  const studentId = String(student.studentId || student.id || '').toLowerCase();
  if (studentId.includes(rawQuery.toLowerCase()) || studentId.includes(normQuery)) return true;

  // 4. مطابقة رقم الهاتف
  const phone = normalizeArabic(student.fatherPhone || student.phone || '');
  if (phone && (phone.includes(normQuery) || phone.includes(cleanCodeQuery))) return true;

  // 5. مطابقة اسم الجزء والمستوى القرآني
  const part = normalizeArabic(student.partName || student.part || '');
  if (part && (part.includes(normQuery) || normQuery.includes(part))) return true;

  // 6. مطابقة اسم الشيخ المشرف
  const sheikh = normalizeArabic(student.sheikhName || '');
  if (sheikh && sheikh.includes(normQuery)) return true;

  // 7. مطابقة اسم المدرسة
  const school = normalizeArabic(student.schoolName || '');
  if (school && school.includes(normQuery)) return true;

  // 8. مطابقة اسم ولي الأمر
  const parent = normalizeArabic(student.parentName || student.fatherName || '');
  if (parent && parent.includes(normQuery)) return true;

  // 9. مطابقة الكلمات المتعددة بالاسم المركب
  const qWords = normQuery.split(' ').filter(Boolean);
  if (qWords.length >= 2) {
    const sWords = normName.split(' ').filter(Boolean);
    const matchedCount = qWords.filter(qw => sWords.some(sw => sw.includes(qw) || qw.includes(sw))).length;
    if (matchedCount === qWords.length) return true;
  }

  return false;
}

// دالة البحث المخصص بالاسم في الكتالوج مع المعالجة الدقيقة للغة العربية
export function findStudentByName(name) {
  if (!name) return null;
  const rawName = String(name).trim();
  if (!rawName) return null;
  const normalizedQuery = normalizeArabic(rawName);
  if (!normalizedQuery) return null;

  // 1. مطابقة تامة بالاسم الموحد
  let match = STUDENTS_CATALOG.find(s => {
    return normalizeArabic(s.name) === normalizedQuery;
  });
  if (match) return match;

  // 2. مطابقة بالاسم المتضمن إذا كان كافياً (>= 3 أحرف)
  if (normalizedQuery.length >= 3) {
    match = STUDENTS_CATALOG.find(s => {
      const sNorm = normalizeArabic(s.name);
      return sNorm.includes(normalizedQuery) || normalizedQuery.includes(sNorm);
    });
    if (match) return match;
  }

  // 3. مطابقة ذكية بالكلمات المركبة (الاسم الأول واسم الأب أو تطابق أغلب الكلمات)
  const qWords = normalizedQuery.split(' ').filter(Boolean);
  if (qWords.length >= 2) {
    match = STUDENTS_CATALOG.find(s => {
      const sWords = normalizeArabic(s.name).split(' ').filter(Boolean);
      if (sWords.length < 2) return false;
      const firstMatch = sWords[0] === qWords[0];
      const fatherMatch = sWords[1] === qWords[1];
      if (!firstMatch || !fatherMatch) return false;

      const lastMatch = sWords[sWords.length - 1] === qWords[qWords.length - 1];
      const matchedWordsCount = sWords.filter(w => qWords.includes(w)).length;
      return lastMatch || matchedWordsCount >= Math.min(sWords.length, qWords.length);
    });
    if (match) return match;
  }

  return null;
}

// دالة البحث الذكي عن الطالب في الكتالوج
export function findStudentInCatalog(identifier) {
  if (!identifier) return null;
  const rawId = String(identifier).trim();
  if (!rawId) return null;

  // 1. إذا كان يحتوي على أحرف عربية، ابحث بالاسم أولاً
  if (/[\u0600-\u06FF]/.test(rawId)) {
    const nameMatch = findStudentByName(rawId);
    if (nameMatch) return nameMatch;
  }

  // 2. مطابقة بمعرف الطالب STU-2026-XXX
  let match = STUDENTS_CATALOG.find(s => 
    s.studentId && s.studentId.toUpperCase() === rawId.toUpperCase()
  );
  if (match) return match;

  // 3. مطابقة بالكود التكريمي مثل #001 أو 001 أو 1 (فقط إذا كان رقماً)
  const cleanCode = rawId.replace(/^#/, '').trim();
  const parsedCodeNum = parseInt(cleanCode, 10);
  if (!isNaN(parsedCodeNum) && parsedCodeNum > 0 && parsedCodeNum <= 200 && /^\d+$/.test(cleanCode)) {
    match = STUDENTS_CATALOG.find(s => {
      const sCode = s.code.replace(/^#/, '');
      const sNum = parseInt(sCode, 10);
      return sCode === cleanCode || sNum === parsedCodeNum;
    });
    if (match) return match;
  }

  // 4. مطابقة بالاسم كخيار أخير لأي نص آخر
  return findStudentByName(rawId);
}

// دالة فحص مطابقة سجل طالب مع طالب في الكتالوج (Strict & Exact Matching)
export function isStudentMatch(rec, catStudent) {
  if (!rec || !catStudent) return false;

  const recStudentId = String(rec.studentId || rec.id || '').trim().toUpperCase();
  const catStudentId = String(catStudent.studentId || '').trim().toUpperCase();

  // 1. مطابقة قطعية بمعرف الطالب المعتمد STU-2026-XXX
  if (recStudentId && catStudentId && recStudentId === catStudentId) {
    return true;
  }

  const recName = normalizeArabic(rec.studentName || rec.name || '');
  const catName = normalizeArabic(catStudent.name || '');

  // 2. مطابقة بالاسم الموحد التام
  if (recName && catName && recName === catName) {
    return true;
  }

  // 3. مطابقة بالكود التكريمي المعتمد (#001) مع التحقق من عدم التعارض الجسيم بالاسم
  const cleanRec = String(rec.studentCode || '').replace(/^#/, '').trim();
  const cleanCat = String(catStudent.code || '').replace(/^#/, '').trim();
  const numRec = parseInt(cleanRec, 10);
  const numCat = parseInt(cleanCat, 10);

  if (cleanRec && cleanCat) {
    const isCodeMatch = cleanRec === cleanCat || (!isNaN(numRec) && !isNaN(numCat) && numRec === numCat && /^\d+$/.test(cleanRec) && /^\d+$/.test(cleanCat));
    if (isCodeMatch) {
      // إذا كان الكود متطابقاً، نتحقق أن الاسم في السجل لا يخص طالباً آخر في الكتالوج
      if (!recName) return true;
      const otherCatMatch = STUDENTS_CATALOG.find(s => s.studentId !== catStudent.studentId && normalizeArabic(s.name) === recName);
      if (!otherCatMatch) {
        return true;
      }
    }
  }

  // 4. مطابقة مشددة بالأسماء: تشترط تطابق الاسم الأول واسم الأب (الكلمة الثانية)
  const rWords = recName.split(' ').filter(Boolean);
  const cWords = catName.split(' ').filter(Boolean);
  if (rWords.length >= 2 && cWords.length >= 2) {
    const firstMatch = rWords[0] === cWords[0];
    const fatherMatch = rWords[1] === cWords[1];
    if (firstMatch && fatherMatch) {
      const commonWords = cWords.filter(w => rWords.includes(w)).length;
      if (commonWords >= Math.min(rWords.length, cWords.length)) {
        return true;
      }
    }
  }

  return false;
}

// دالة حساب عدد الأجزاء المحفوظة بناءً على اسم الجزء أو المستوى
export function getMemorizedPartsCount(partName) {
  if (!partName) return 1;
  const p = normalizeArabic(partName);
  if (p.includes('كامل') || p.includes('30')) return 30;
  if (p.includes('اعراف')) return 24;
  if (p.includes('توبه')) return 21;
  if (p.includes('يوسف')) return 18;
  if (p.includes('كهف')) return 15;
  if (p.includes('انبياء')) return 14;
  if (p.includes('فرقان')) return 12;
  if (p.includes('عنكبوت')) return 10;
  if (p.includes('يس')) return 8;
  if (p.includes('شوري')) return 6;
  if (p.includes('احقاف')) return 5;
  if (p.includes('ذاريات')) return 4;
  if (p.includes('قد سمع') || p.includes('سمع')) return 3;
  if (p.includes('تبارك')) return 2;
  if (p.includes('عم')) return 1;
  return 1;
}

// دالة توحيد اسم الجزء إلى المسمى القياسي المعتمد
export function getCanonicalPartName(rawPart) {
  if (!rawPart) return 'القرآن الكريم';
  const norm = normalizeArabic(rawPart);

  if (norm.includes('كامل') || norm.includes('30')) return 'القرآن كاملاً';
  if (norm.includes('اعراف')) return 'جزء الأعراف';
  if (norm.includes('توبه')) return 'جزء التوبة';
  if (norm.includes('يوسف')) return 'جزء يوسف';
  if (norm.includes('كهف')) return 'جزء الكهف';
  if (norm.includes('انبياء')) return 'جزء الأنبياء';
  if (norm.includes('فرقان')) return 'جزء الفرقان';
  if (norm.includes('عنكبوت')) return 'جزء العنكبوت';
  if (norm.includes('يس')) return 'جزء يس';
  if (norm.includes('شوري')) return 'جزء الشورى';
  if (norm.includes('احقاف')) return 'جزء الاحقاف';
  if (norm.includes('ذاريات')) return 'جزء الذاريات';
  if (norm.includes('قد سمع') || norm.includes('سمع')) return 'جزء قد سمع';
  if (norm.includes('تبارك')) return 'جزء تبارك';
  if (norm.includes('عم')) return 'جزء عم وقصار السور';

  return rawPart;
}

// دالة المطابقة القياسية الدقيقة للأجزاء القرآنية لتجنب الأخطاء
export function matchesQuranPartCanonical(studentPart, targetPart) {
  if (!targetPart || targetPart === 'ALL') return true;
  if (!studentPart) return false;

  const studentCanonical = getCanonicalPartName(studentPart);
  const targetCanonical = getCanonicalPartName(targetPart);

  if (studentCanonical === targetCanonical) return true;

  const normStudent = normalizeArabic(studentPart);
  const normTarget = normalizeArabic(targetPart);

  return normStudent === normTarget;
}

// ترتيب الأجزاء بالأرقام للفرز حسب القائمة الرسمية المعتمدة
export function getPartOrderRank(partName) {
  if (!partName) return 999;
  const canonical = getCanonicalPartName(partName);
  const idx = QURAN_PARTS_ORDER.indexOf(canonical);
  if (idx !== -1) return idx;

  const normPart = normalizeArabic(partName);
  const fallbackIdx = QURAN_PARTS_ORDER.findIndex((p) => {
    const normP = normalizeArabic(p);
    return normP === normPart;
  });
  return fallbackIdx !== -1 ? fallbackIdx : 999;
}

