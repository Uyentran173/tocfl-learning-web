import type { UiLocale } from "./i18n";

export const exploreRoutes = [
  { id: "about", href: "/explore/about" },
  { id: "features", href: "/explore/features" },
  { id: "faq", href: "/explore/faq" },
  { id: "contact", href: "/explore/contact" },
] as const;

export const featureRoutes = [
  { id: "academy", href: "/academy", status: "available", symbol: "冊" },
  { id: "vocabulary", href: "/vocabulary", status: "available", symbol: "字" },
  { id: "flashcards", href: "/vocabulary/band", status: "available", symbol: "↻" },
  { id: "personalized", href: "/vocabulary/topic", status: "available", symbol: "✦" },
  { id: "tocfl", href: "/tocfl", status: "available", symbol: "題" },
  { id: "skills", href: "/tocfl", status: "available", symbol: "♫" },
  { id: "reviews", href: "/tocfl", status: "available", symbol: "✓" },
  { id: "progress", href: "/account", status: "conditional", symbol: "◌" },
] as const;

export const feedbackUrl = "https://github.com/Uyentran173/tocfl-learning-web/issues/new?labels=feedback&title=G%C3%B3p%20%C3%BD%20cho%20Tai%20W%C3%A9n";

type Feature = { title: string; purpose: string; audience: string; steps: [string, string, string]; action: string };
type Faq = { category: "start" | "academy" | "tocfl" | "account"; question: string; answer: string };
type ExploreContent = {
  nav: { explore: string; about: string; features: string; faq: string; contact: string; exam: string; home: string };
  common: { available: string; conditional: string; planned: string; open: string; readMore: string; back: string };
  home: { eyebrow: string; title: string; lead: string; intro: string; about: string; features: string; faq: string };
  about: { eyebrow: string; title: string; lead: string; missionLabel: string; missionTitle: string; mission: string; methodLabel: string; methodTitle: string; method: string; mascotLabel: string; mascotTitle: string; mascot: string; bioLabel: string; bioTitle: string; bio1: string; bio2: string; next: string };
  guide: { eyebrow: string; title: string; lead: string; startLabel: string; startTitle: string; startLead: string; startSteps: [string, string, string]; availability: string; plannedNote: string; sections: [string, string, string]; audienceLabel: string; howLabel: string; features: Feature[] };
  faq: { eyebrow: string; title: string; lead: string; search: string; searchLabel: string; noResults: string; clear: string; categories: { all: string; start: string; academy: string; tocfl: string; account: string }; items: Faq[]; helpTitle: string; helpText: string };
  contact: { eyebrow: string; title: string; lead: string; reportTitle: string; reportBody: string; reportSteps: [string, string, string]; openIssue: string; requirement: string; privacyTitle: string; privacyBody: string; quickTitle: string; quickBody: string; quickAction: string };
};

export const exploreContent: Record<UiLocale, ExploreContent> = {
  vi: {
    nav: { explore: "Khám phá Tai Wén", about: "Về Tai Wén", features: "Hướng dẫn tính năng", faq: "Câu hỏi thường gặp", contact: "Liên hệ & góp ý", exam: "Hướng dẫn kỳ thi", home: "Trang chủ" },
    common: { available: "Đang dùng được", conditional: "Đồng bộ cần đăng nhập", planned: "Sắp ra mắt", open: "Mở tính năng", readMore: "Tìm hiểu thêm", back: "Khám phá Tai Wén" },
    home: { eyebrow: "BẮT ĐẦU TỪ ĐÂU?", title: "Một góc nhỏ để hiểu Tai Wén.", lead: "Gặp người tạo ra trang học, xem cách dùng từng tính năng và tìm câu trả lời trước khi bắt đầu.", intro: "Tìm đường học phù hợp với bạn", about: "Câu chuyện phía sau Tai Wén", features: "Xem cách học trên Tai Wén", faq: "Giải đáp nhanh những băn khoăn" },
    about: {
      eyebrow: "VỀ TAI WÉN", title: "Học tiếng Hoa theo nhịp của bạn.", lead: "Tai Wén gom bài học, từ vựng và đề luyện TOCFL vào một chỗ dễ tìm, dễ quay lại. Bạn có thể bắt đầu từ một bài rất nhỏ rồi đi tiếp khi sẵn sàng.",
      missionLabel: "01 / MỤC ĐÍCH", missionTitle: "Ít tìm tài liệu hơn, học được nhiều hơn.", mission: "Chọn giáo trình để học có lộ trình, ôn từ theo chủ đề hoặc luyện đề khi muốn kiểm tra mình đã hiểu đến đâu. Mỗi phần có đường đi riêng, nhưng tiến độ học vẫn theo bạn.",
      methodLabel: "02 / CÁCH HỌC", methodTitle: "Học, thử, rồi xem lại.", method: "Đọc bài khóa, nghe, luyện từ và ngữ pháp; sau đó tự kiểm tra. Với đề TOCFL, bạn chọn phần Nghe, Đọc hoặc toàn bộ đề và xem lại đáp án sau khi nộp.",
      mascotLabel: "NGƯỜI BẠN ĐỒNG HÀNH", mascotTitle: "Gấu đen Formosan", mascot: "Chú gấu nhỏ xuất hiện dọc hành trình học như một lời nhắc: cứ học từng bước, không cần vội.",
      bioLabel: "NGƯỜI PHÁT TRIỂN", bioTitle: "Chào bạn, mình là Uyên Trần.",
      bio1: "Mình là Uyên Trần, hiện đang tự học tiếng Trung phồn thể tại Việt Nam và hướng tới việc du học Đài Loan. Trong quá trình học, mình nhận ra tài liệu dành cho người Việt, đặc biệt là tài liệu luyện TOCFL, thường nằm rải rác ở nhiều nơi.",
      bio2: "Vì vậy, mình xây dựng Tai Wén như một nơi để học, luyện tập và chuẩn bị cho TOCFL theo cách gọn gàng và dễ dùng hơn. Mình vẫn đang trên hành trình học tiếng Trung, và website này cũng sẽ tiếp tục được hoàn thiện cùng hành trình đó.",
      next: "Xem Tai Wén có gì để học",
    },
    guide: {
      eyebrow: "HƯỚNG DẪN TÍNH NĂNG", title: "Chọn một cách học. Bắt đầu ngay.", lead: "Mỗi công cụ giải quyết một nhu cầu khác nhau. Dưới đây là những gì bạn có thể làm ngay trên Tai Wén, kèm đường đi ngắn nhất để bắt đầu.",
      startLabel: "LẦN ĐẦU ĐẾN TAI WÉN", startTitle: "Bạn nên bắt đầu ở đâu?", startLead: "Nếu chưa biết chọn gì, thử lộ trình ba bước này. Bạn luôn có thể đổi cách học.",
      startSteps: ["Mở Academy và chọn một bài phù hợp với trình độ hiện tại.", "Ôn từ mới bằng thẻ từ hoặc tạo bộ từ theo tình huống bạn cần.", "Khi muốn tự kiểm tra, chọn một đề TOCFL và làm phần Nghe hoặc Đọc."],
      availability: "Những công cụ bên dưới đang sử dụng được. Đồng bộ tiến độ giữa thiết bị cần đăng nhập và kết nối mạng.", plannedNote: "Giáo trình mới ngoài hai tập hiện có sẽ chỉ xuất hiện khi nội dung được hoàn thiện.",
      sections: ["Học theo bài", "Luyện đúng nhu cầu", "Nhìn lại tiến bộ"], audienceLabel: "Phù hợp với", howLabel: "Bắt đầu trong 3 bước",
      features: [
        { title: "Tai Wén Academy", purpose: "Học theo Giáo trình tiếng Hoa đương đại, Tập 1 và Tập 2. Mỗi bài kết hợp bài khóa, từ vựng, ngữ pháp, nghe, luyện tập và đánh giá.", audience: "Người muốn học theo lộ trình rõ ràng.", steps: ["Vào Academy và chọn tập.", "Chọn bài học; bạn không bị khóa vào một thứ tự cố định.", "Mở hoạt động đang học hoặc tiếp tục từ nơi đã dừng."], action: "Mở Academy" },
        { title: "Học từ vựng", purpose: "Học theo chủ đề, giáo trình hoặc Band TOCFL. Từ có phiên âm, nghĩa và ví dụ khi dữ liệu đã được biên soạn.", audience: "Người cần mở rộng và ôn lại vốn từ.", steps: ["Chọn một trong ba cách học.", "Chọn chủ đề, bài học hoặc Band.", "Đánh dấu từ đã học để quay lại ôn."], action: "Chọn cách học từ" },
        { title: "Thẻ từ", purpose: "Nhìn chữ Hán trước, tự nhớ nghĩa rồi lật thẻ để xem giải thích và ví dụ.", audience: "Người muốn ôn nhanh mà vẫn tự kiểm tra trí nhớ.", steps: ["Vào Học theo Band TOCFL.", "Chọn Band và mở Học từ.", "Lật thẻ, chuyển từ và đánh dấu đã học."], action: "Ôn bằng thẻ từ" },
        { title: "Bộ từ cá nhân hóa", purpose: "Tạo một bộ từ từ những kho từ đang có theo chủ đề, mục đích và trình độ bạn chọn.", audience: "Người đang chuẩn bị cho một tình huống cụ thể.", steps: ["Mở Học theo ngữ cảnh.", "Chọn chủ đề, mục đích học và cấp độ.", "Tạo bộ từ rồi học hoặc ôn lại."], action: "Tạo bộ từ" },
        { title: "Luyện đề TOCFL", purpose: "Chọn đề theo Band, chọn Luyện tập hoặc Mô phỏng, rồi chọn phần Nghe, Đọc hoặc toàn bộ đề.", audience: "Người muốn làm quen dạng đề và tự kiểm tra.", steps: ["Mở thư viện đề và lọc Band.", "Chọn chế độ, phần thi và kiểu chữ.", "Làm bài rồi nộp để xem kết quả."], action: "Xem thư viện đề" },
        { title: "Luyện Nghe & Đọc", purpose: "Làm riêng một phần hoặc cả hai. Phần Nghe phát âm thanh theo đề; phần Đọc hiển thị nội dung và đáp án tương ứng.", audience: "Người muốn tập trung vào một kỹ năng trước.", steps: ["Chọn một đề trong thư viện.", "Chọn chỉ Nghe, chỉ Đọc hoặc toàn bộ.", "Chọn Phồn thể hoặc Giản thể và bắt đầu."], action: "Chọn phần thi" },
        { title: "Xem lại đáp án", purpose: "Sau khi nộp, xem câu đã chọn, đáp án đúng và phần dịch hoặc transcript khi dữ liệu có sẵn.", audience: "Người muốn hiểu lỗi sai để ôn đúng chỗ.", steps: ["Hoàn thành và nộp một bài luyện đề.", "Mở kết quả, rồi chọn Xem lại đáp án.", "Đi từng câu và đọc nội dung giải thích có sẵn."], action: "Làm đề để xem lại" },
        { title: "Tiến độ học", purpose: "Xem từ đã học, bài đang làm và lịch sử luyện đề. Khi đăng nhập, tiến độ có thể đồng bộ giữa các thiết bị.", audience: "Người muốn tiếp tục học mà không phải nhớ mình dừng ở đâu.", steps: ["Học hoặc làm một đề để tạo tiến độ.", "Mở Hồ sơ để xem lại.", "Đăng nhập nếu muốn đồng bộ giữa thiết bị."], action: "Mở hồ sơ" },
      ],
    },
    faq: {
      eyebrow: "CÂU HỎI THƯỜNG GẶP", title: "Có điều gì bạn đang thắc mắc?", lead: "Tìm câu trả lời ngắn gọn về cách học, luyện đề và lưu tiến độ trên Tai Wén.", search: "Tìm trong câu hỏi và câu trả lời…", searchLabel: "Tìm câu hỏi thường gặp", noResults: "Chưa thấy câu hỏi phù hợp. Thử từ khóa khác nhé.", clear: "Xóa bộ lọc", categories: { all: "Tất cả", start: "Bắt đầu", academy: "Academy & từ vựng", tocfl: "Luyện đề TOCFL", account: "Tài khoản & hỗ trợ" },
      items: [
        { category: "start", question: "Mình nên bắt đầu từ đâu?", answer: "Nếu muốn học có lộ trình, hãy mở Academy và chọn bài phù hợp. Nếu chỉ có ít phút, thử thẻ từ. Khi muốn tự kiểm tra, vào thư viện đề TOCFL." },
        { category: "start", question: "Có cần tạo tài khoản trước khi học không?", answer: "Không. Bạn có thể học ở chế độ khách. Đăng nhập khi muốn lưu tiến độ vào tài khoản và tiếp tục trên thiết bị khác." },
        { category: "academy", question: "Academy hiện có những giáo trình nào?", answer: "Hiện có Giáo trình tiếng Hoa đương đại, Tập 1 và Tập 2. Mỗi tập có 15 bài. Các giáo trình mới chỉ được mở khi nội dung đã hoàn thiện." },
        { category: "academy", question: "Mình có phải học bài theo đúng thứ tự không?", answer: "Không. Bạn có thể vào bài đang mở phù hợp với mình. Tai Wén lưu hoạt động bạn đang học để bạn quay lại sau." },
        { category: "academy", question: "Phồn thể và Giản thể khác gì trong ứng dụng?", answer: "Bạn có thể chọn kiểu chữ cho nội dung học và đề thi nơi tính năng hỗ trợ. Ngôn ngữ giao diện là lựa chọn riêng: giao diện tiếng Anh vẫn có thể đi cùng đề Phồn thể." },
        { category: "academy", question: "Thẻ từ hoạt động thế nào?", answer: "Mặt trước chỉ hiện từ để bạn tự nhớ. Nhấn vào thẻ để xem nghĩa và ví dụ, rồi chuyển sang từ tiếp theo. Bạn có thể đánh dấu từ đã học." },
        { category: "tocfl", question: "Band Novice, A, B và C là gì?", answer: "Đó là các cấp dùng để nhóm tài liệu và đề TOCFL trên Tai Wén. Hãy chọn Band phù hợp với mục tiêu và trình độ hiện tại; bạn có thể đổi bộ lọc bất kỳ lúc nào." },
        { category: "tocfl", question: "Luyện tập khác Mô phỏng thế nào?", answer: "Luyện tập cho phép bạn chủ động di chuyển giữa các câu theo cách học. Mô phỏng dùng giao diện tập trung và phát phần Nghe theo luồng âm thanh của đề. Cả hai đều cho xem kết quả sau khi nộp." },
        { category: "tocfl", question: "Có thể chỉ làm phần Nghe hoặc Đọc không?", answer: "Có. Sau khi chọn chế độ, bạn chọn chỉ Nghe, chỉ Đọc hoặc toàn bộ đề. Kết quả sẽ tương ứng với phần bạn đã chọn." },
        { category: "tocfl", question: "Điểm thi thử có phải kết quả TOCFL chính thức không?", answer: "Không. Điểm được tính theo thang điểm của đề thi thử và chỉ để tham khảo. Kết quả chính thức do đơn vị tổ chức kỳ thi công bố." },
        { category: "account", question: "Tiến độ có theo mình sang thiết bị khác không?", answer: "Có thể, khi bạn đăng nhập cùng một tài khoản và kết nối mạng. Tiến độ của khách vẫn nằm trên thiết bị hiện tại cho tới khi bạn đồng ý nhập vào tài khoản." },
        { category: "account", question: "Nếu đồng bộ gặp lỗi thì dữ liệu khách có mất không?", answer: "Tai Wén không tự xóa tiến độ khách khi bạn đăng nhập. Nếu đồng bộ chưa xong, hãy giữ nguyên trình duyệt và thử lại khi mạng ổn định." },
        { category: "account", question: "Mình báo lỗi hoặc góp ý ở đâu?", answer: "Mở trang Liên hệ & góp ý để gửi báo cáo qua GitHub Issues. Bạn cần tài khoản GitHub; vui lòng không đăng mật khẩu hay dữ liệu cá nhân vào báo cáo công khai." },
      ],
      helpTitle: "Chưa tìm được câu trả lời?", helpText: "Gửi lỗi hoặc góp ý để Tai Wén được hoàn thiện hơn.",
    },
    contact: { eyebrow: "LIÊN HỆ & GÓP Ý", title: "Thấy điều gì chưa ổn? Hãy nói mình biết.", lead: "Một báo cáo rõ ràng giúp mình tìm và sửa vấn đề nhanh hơn. Bạn cũng có thể góp ý về cách học hoặc nội dung chưa dễ hiểu.", reportTitle: "Gửi góp ý qua GitHub", reportBody: "Tai Wén đang nhận báo lỗi và đề xuất ở trang Issues của dự án. Báo cáo được hiển thị công khai và cần tài khoản GitHub.", reportSteps: ["Ghi tên trang hoặc bài học đang gặp vấn đề.", "Mô tả điều bạn làm và kết quả bạn thấy; ảnh chụp màn hình sẽ hữu ích.", "Nếu là lỗi đề thi, ghi Band, số đề và số câu. Đừng gửi mật khẩu hoặc thông tin riêng tư."], openIssue: "Mở trang gửi góp ý", requirement: "Cần đăng nhập GitHub để đăng báo cáo.", privacyTitle: "Giữ thông tin cá nhân an toàn", privacyBody: "GitHub Issues là nơi công khai. Đừng chia sẻ email cá nhân, mật khẩu, mã đăng nhập hoặc dữ liệu học tập riêng tư trong báo cáo.", quickTitle: "Cần giải đáp trước?", quickBody: "Nhiều câu hỏi về tài khoản, tiến độ và luyện đề đã có lời giải ngắn ở trang FAQ.", quickAction: "Xem câu hỏi thường gặp" },
  },
  en: {
    nav: { explore: "Explore Tai Wén", about: "About Tai Wén", features: "Feature guides", faq: "FAQ", contact: "Contact & feedback", exam: "Exam guide", home: "Home" },
    common: { available: "Available", conditional: "Sign in to sync", planned: "Coming later", open: "Open feature", readMore: "Learn more", back: "Explore Tai Wén" },
    home: { eyebrow: "WHERE TO BEGIN", title: "Get to know Tai Wén.", lead: "Meet the creator, find your way through the learning tools, and get answers before you start.", intro: "Find a path that fits you", about: "The story behind Tai Wén", features: "See how learning works", faq: "Quick answers to common questions" },
    about: { eyebrow: "ABOUT TAI WÉN", title: "Learn Chinese at your own pace.", lead: "Tai Wén brings lessons, vocabulary, and TOCFL practice into one easy-to-use space. Start small and keep going when you are ready.", missionLabel: "01 / PURPOSE", missionTitle: "Spend less time searching. More time learning.", mission: "Follow a textbook path, review words by topic, or take a mock test when you want to check your understanding. Each tool has its own purpose, and your progress stays with you.", methodLabel: "02 / APPROACH", methodTitle: "Learn, try, then review.", method: "Read and listen to a lesson, study words and grammar, then check yourself. In TOCFL practice, choose Listening, Reading, or a full test and review your answers after submitting.", mascotLabel: "YOUR LEARNING COMPANION", mascotTitle: "The Formosan black bear", mascot: "Our little bear appears along the way as a reminder that steady steps matter more than rushing.", bioLabel: "THE CREATOR", bioTitle: "Hi, I'm Uyên Trần.", bio1: "I'm Uyên Trần, learning Traditional Chinese on my own in Vietnam and hoping to study in Taiwan. While learning, I noticed that Vietnamese-language resources, especially TOCFL practice materials, were scattered across many places.", bio2: "That's why I built Tai Wén: one tidy, approachable place to learn, practice, and prepare for TOCFL. I'm still learning Chinese myself, and this website will keep growing alongside that journey.", next: "Explore the learning tools" },
    guide: { eyebrow: "FEATURE GUIDES", title: "Choose a way to learn. Start today.", lead: "Each tool serves a different need. Here is what you can use now, with the shortest path to get started.", startLabel: "NEW TO TAI WÉN", startTitle: "Where should I start?", startLead: "If you're unsure, try these three steps. You can always change direction.", startSteps: ["Open Academy and choose a lesson at your level.", "Review new words with flashcards or build a set for a situation you care about.", "When you're ready to check yourself, choose a TOCFL test and try Listening or Reading."], availability: "The tools below are available now. Cross-device progress sync requires sign-in and a network connection.", plannedNote: "Textbook series beyond the two current volumes will appear only when their lessons are ready.", sections: ["Learn by lesson", "Practice your way", "Review your progress"], audienceLabel: "Good for", howLabel: "Get started in 3 steps", features: [
      { title: "Tai Wén Academy", purpose: "Study A Course in Contemporary Chinese, Volumes 1 and 2. Lessons combine texts, vocabulary, grammar, listening, practice, and assessment.", audience: "Learners who want a clear course path.", steps: ["Open Academy and choose a volume.", "Choose a lesson; you are not locked into a fixed order.", "Open an activity or resume where you stopped."], action: "Open Academy" },
      { title: "Vocabulary", purpose: "Learn by topic, textbook, or TOCFL Band. Entries show pronunciation, meanings, and examples where prepared.", audience: "Learners building and reviewing word knowledge.", steps: ["Choose one of the three paths.", "Pick a topic, lesson, or Band.", "Mark learned words to revisit later."], action: "Choose a vocabulary path" },
      { title: "Flashcards", purpose: "See the Chinese word first, recall its meaning, then flip for the explanation and example.", audience: "Learners who like quick active recall.", steps: ["Open TOCFL Band vocabulary.", "Choose a Band and start learning.", "Flip, move on, and mark learned words."], action: "Study flashcards" },
      { title: "Personalized word sets", purpose: "Create a set from existing vocabulary based on your topic, goal, and level.", audience: "Learners preparing for a specific situation.", steps: ["Open contextual vocabulary.", "Choose a topic, goal, and level.", "Build the set and start learning."], action: "Build a word set" },
      { title: "TOCFL practice", purpose: "Choose a test by Band, then Practice or Simulation and Listening, Reading, or the full test.", audience: "Learners getting familiar with test formats.", steps: ["Open the test library and filter by Band.", "Choose mode, section, and script.", "Complete and submit the test."], action: "Browse tests" },
      { title: "Listening & Reading", purpose: "Focus on one section or take both. Listening follows the test audio; Reading shows the matching content and choices.", audience: "Learners focusing on one skill at a time.", steps: ["Choose a test.", "Select Listening, Reading, or the full test.", "Choose Traditional or Simplified and begin."], action: "Choose a section" },
      { title: "Answer review", purpose: "After submission, see your choice, the correct answer, and translations or transcripts where available.", audience: "Learners who want to understand mistakes.", steps: ["Complete and submit a mock test.", "Open your result, then answer review.", "Move through questions and read the available guidance."], action: "Take a test first" },
      { title: "Learning progress", purpose: "See learned words, active tests, and test history. Sign in to sync progress across devices.", audience: "Learners who want to pick up where they left off.", steps: ["Study or take a test to create progress.", "Open your profile.", "Sign in for cross-device sync."], action: "Open profile" },
    ] },
    faq: { eyebrow: "FREQUENTLY ASKED QUESTIONS", title: "What would you like to know?", lead: "Short answers about learning, test practice, and progress on Tai Wén.", search: "Search questions and answers…", searchLabel: "Search frequently asked questions", noResults: "No matching questions. Try another keyword.", clear: "Clear filters", categories: { all: "All", start: "Getting started", academy: "Academy & vocabulary", tocfl: "TOCFL practice", account: "Account & support" }, items: [
      { category: "start", question: "Where should I begin?", answer: "For a guided path, open Academy and choose a lesson. For a few spare minutes, try flashcards. To check yourself, browse the TOCFL tests." },
      { category: "start", question: "Do I need an account to learn?", answer: "No. Guest mode works. Sign in if you want account-based progress and to continue on another device." },
      { category: "academy", question: "Which textbooks are in Academy?", answer: "A Course in Contemporary Chinese, Volumes 1 and 2, is available now. Each has 15 lessons. More series will open only when their content is ready." },
      { category: "academy", question: "Do I have to follow lesson order?", answer: "No. Open any available lesson that suits you. Tai Wén saves the activity you were working on so you can return." },
      { category: "academy", question: "How are Traditional and Simplified different here?", answer: "You can choose the script for supported lesson and test content. Interface language is separate: an English interface can still show a Traditional Chinese test." },
      { category: "academy", question: "How do flashcards work?", answer: "The front shows the word for recall. Tap to see the meaning and example, move to the next word, and mark words as learned." },
      { category: "tocfl", question: "What are Novice, Band A, B, and C?", answer: "They group TOCFL materials and tests on Tai Wén by level. Choose a Band for your current goal; you can change the filter any time." },
      { category: "tocfl", question: "Practice or Simulation?", answer: "Practice lets you move through questions as you study. Simulation uses a focused interface and follows the test's Listening audio flow. Both show results after submission." },
      { category: "tocfl", question: "Can I take only Listening or Reading?", answer: "Yes. Choose Listening, Reading, or the full test after selecting a mode. Results reflect the scope you chose." },
      { category: "tocfl", question: "Are mock scores official TOCFL results?", answer: "No. They use the mock test's score scale and are for reference only. Official results come from the test organizer." },
      { category: "account", question: "Does progress sync across devices?", answer: "It can when you sign in to the same account and have a network connection. Guest progress stays on the current device until you approve importing it." },
      { category: "account", question: "Will a sync error delete guest data?", answer: "Signing in does not automatically delete guest progress. If sync has not finished, keep the browser data and retry when the connection is stable." },
      { category: "account", question: "How can I report a problem?", answer: "Use Contact & feedback to create a GitHub Issue. You need a GitHub account. Do not post passwords or private information in a public report." },
    ], helpTitle: "Still need help?", helpText: "Report a problem or share an idea to help improve Tai Wén." },
    contact: { eyebrow: "CONTACT & FEEDBACK", title: "Something not quite right? Let me know.", lead: "A clear report helps me find and fix problems faster. Ideas about learning and unclear content are welcome too.", reportTitle: "Send feedback on GitHub", reportBody: "Tai Wén receives bug reports and suggestions through the project's Issues page. Reports are public and require a GitHub account.", reportSteps: ["Name the page or lesson where it happened.", "Describe what you did and what you saw; a screenshot helps.", "For a test issue, include the Band, test, and question number. Never post passwords or private details."], openIssue: "Open feedback page", requirement: "A GitHub account is required to post.", privacyTitle: "Protect your personal information", privacyBody: "GitHub Issues are public. Do not share email addresses, passwords, login codes, or private learning data in a report.", quickTitle: "Want a quick answer first?", quickBody: "The FAQ already covers many questions about accounts, progress, and tests.", quickAction: "Read the FAQ" },
  },
  "zh-CN": {
    nav: { explore: "探索 Tai Wén", about: "关于 Tai Wén", features: "功能指南", faq: "常见问题", contact: "联系与反馈", exam: "考试指南", home: "首页" },
    common: { available: "现已开放", conditional: "登录后同步", planned: "后续开放", open: "打开功能", readMore: "了解更多", back: "探索 Tai Wén" },
    home: { eyebrow: "从哪里开始？", title: "认识 Tai Wén。", lead: "了解网站背后的故事、各项学习功能，以及开始前可能遇到的问题。", intro: "找到适合自己的学习路线", about: "Tai Wén 背后的故事", features: "了解学习功能", faq: "快速解答常见问题" },
    about: { eyebrow: "关于 TAI WÉN", title: "按照自己的节奏学习华语。", lead: "Tai Wén 把课程、词汇和 TOCFL 模拟练习放在同一个空间。先从一小课开始，准备好了再继续。", missionLabel: "01 / 初衷", missionTitle: "少花时间找资料，多花时间学习。", mission: "按教材循序学习、按主题复习词语，或通过模拟题检验理解。每种工具都有自己的用途，学习进度则始终属于你。", methodLabel: "02 / 学习方式", methodTitle: "学习、尝试，再回顾。", method: "阅读课文、听音频、学习词汇和语法，再完成练习。TOCFL 模拟练习可以选择听力、阅读或整份试题，交卷后再查看答案。", mascotLabel: "学习伙伴", mascotTitle: "台湾黑熊", mascot: "这只小熊陪伴你的学习旅程，提醒你一步一步来，不必着急。", bioLabel: "开发者", bioTitle: "你好，我是 Uyên Trần。", bio1: "我叫 Uyên Trần，目前在越南自学繁体中文，也希望将来到台湾留学。学习过程中，我发现面向越南人的资料，尤其是 TOCFL 练习资料，常常分散在不同地方。", bio2: "因此，我建立了 Tai Wén，希望提供一个简洁、易用的地方，让大家学习、练习并准备 TOCFL。我自己也还在学习中文，这个网站会随着这段旅程继续完善。", next: "看看有哪些学习工具" },
    guide: { eyebrow: "功能指南", title: "选一种方式，开始学习。", lead: "每种工具解决不同的学习需求。这里介绍目前可用的功能，以及最简单的开始方法。", startLabel: "第一次来到 TAI WÉN", startTitle: "应该从哪里开始？", startLead: "如果还不确定，可以试试这三步。之后随时可以换一种学习方式。", startSteps: ["打开 Academy，选择适合自己程度的一课。", "用词卡复习新词，或按需要的情境创建词语集。", "想检验成果时，选择一份 TOCFL 模拟题，先做听力或阅读。"], availability: "以下工具现已开放。跨设备同步进度需要登录并连接网络。", plannedNote: "目前两个分册之外的新教材，将在内容完成后开放。", sections: ["按课程学习", "按需要练习", "回顾学习成果"], audienceLabel: "适合", howLabel: "三步开始", features: [
      { title: "Tai Wén Academy", purpose: "学习《当代中文课程》第一、二册。每课包括课文、词汇、语法、听力、练习和测验。", audience: "希望按清晰路线学习的人。", steps: ["打开 Academy 并选择分册。", "选择一课，无须按照固定顺序。", "进入学习活动，或从上次停下的地方继续。"], action: "打开 Academy" },
      { title: "词汇学习", purpose: "按主题、教材或 TOCFL 级别学习。已整理的词条提供拼音、释义和例句。", audience: "想积累和复习词汇的人。", steps: ["选择一种学习路线。", "选择主题、课次或级别。", "标记已学词语，之后再复习。"], action: "选择词汇路线" },
      { title: "词卡", purpose: "先看汉字并回想词义，再翻卡查看解释与例句。", audience: "喜欢主动回忆、快速复习的人。", steps: ["打开 TOCFL 分级词汇。", "选择级别并开始学习。", "翻卡、切换词语并标记已学。"], action: "使用词卡" },
      { title: "个性化词语集", purpose: "根据所选主题、目标和程度，从现有词库建立词语集。", audience: "准备特定生活情境的人。", steps: ["打开情境词汇。", "选择主题、目标和程度。", "建立词语集并开始学习。"], action: "建立词语集" },
      { title: "TOCFL 模拟练习", purpose: "按级别选题，再选择练习或模拟模式，以及听力、阅读或整份试题。", audience: "想熟悉题型并自我检测的人。", steps: ["打开题库并筛选级别。", "选择模式、部分和文字形式。", "完成并提交试题。"], action: "浏览题库" },
      { title: "听力与阅读", purpose: "可以只练一部分，也可以完成整份试题。听力按试题音频播放，阅读显示对应内容和选项。", audience: "想集中练习某项技能的人。", steps: ["选择一份试题。", "选择听力、阅读或整份试题。", "选择繁体或简体后开始。"], action: "选择考试部分" },
      { title: "答案回顾", purpose: "交卷后查看自己的答案、正确答案，以及已有的翻译或听力文字。", audience: "想弄清错题原因的人。", steps: ["完成并提交模拟题。", "打开成绩页并选择答案回顾。", "逐题查看已有的说明。"], action: "先做一份试题" },
      { title: "学习进度", purpose: "查看已学词语、正在做的试题和成绩记录。登录后可在不同设备间同步。", audience: "希望从上次进度继续的人。", steps: ["先学习或完成一份试题。", "打开个人资料查看进度。", "如需跨设备同步，请登录。"], action: "打开个人资料" },
    ] },
    faq: { eyebrow: "常见问题", title: "你想了解什么？", lead: "关于学习、模拟练习和进度保存的简明解答。", search: "搜索问题和答案…", searchLabel: "搜索常见问题", noResults: "没有找到相关问题，试试其他关键词。", clear: "清除筛选", categories: { all: "全部", start: "入门", academy: "课程与词汇", tocfl: "TOCFL 练习", account: "账户与支持" }, items: [
      { category: "start", question: "我应该从哪里开始？", answer: "想按路线学习，可以打开 Academy 选择一课；只有几分钟，可以用词卡；想自我检测，可以浏览 TOCFL 试题。" },
      { category: "start", question: "学习前必须注册账户吗？", answer: "不需要。访客模式可以学习。如需将进度保存到账户并在其他设备继续，再登录即可。" },
      { category: "academy", question: "Academy 有哪些教材？", answer: "目前开放《当代中文课程》第一册和第二册，每册 15 课。新教材将在内容完成后开放。" },
      { category: "academy", question: "必须按顺序学习吗？", answer: "不必。你可以选择适合自己的已开放课程。Tai Wén 会保存当前学习活动，方便返回。" },
      { category: "academy", question: "繁体和简体与界面语言有关吗？", answer: "两者是独立设置。支持的课程和试题可以选择文字形式；即使界面使用英语，也可以做繁体试题。" },
      { category: "academy", question: "词卡怎么用？", answer: "正面先显示词语，让你自己回想；点击后查看词义和例句，再切换下一词，并可标记已学。" },
      { category: "tocfl", question: "Novice、Band A、B、C 是什么？", answer: "Tai Wén 用这些级别整理 TOCFL 词汇和模拟题。选择适合当前目标的级别，之后随时可以更改筛选。" },
      { category: "tocfl", question: "练习模式和模拟模式有什么区别？", answer: "练习模式方便自主切换题目。模拟模式采用更专注的界面，并按试题音频顺序播放听力。两种模式交卷后都可查看结果。" },
      { category: "tocfl", question: "可以只做听力或阅读吗？", answer: "可以。选好模式后，可选择只做听力、只做阅读或完成整份试题；成绩按所选范围显示。" },
      { category: "tocfl", question: "模拟题分数是 TOCFL 官方成绩吗？", answer: "不是。分数按模拟题的换算表计算，仅供参考。正式成绩由考试主办方公布。" },
      { category: "account", question: "进度能在不同设备间同步吗？", answer: "使用同一账户登录并保持联网时可以同步。访客进度会留在当前设备，直到你同意导入账户。" },
      { category: "account", question: "同步出错会删除访客数据吗？", answer: "登录不会自动删除访客进度。若同步尚未完成，请保留浏览器数据，网络稳定后再试。" },
      { category: "account", question: "如何反馈问题？", answer: "前往联系与反馈页面，通过 GitHub Issues 提交。需要 GitHub 账户；请勿在公开报告中填写密码或私人信息。" },
    ], helpTitle: "还有疑问？", helpText: "提交问题或建议，帮助 Tai Wén 继续改进。" },
    contact: { eyebrow: "联系与反馈", title: "发现问题？欢迎告诉我。", lead: "清楚的描述有助于更快找到和修复问题。也欢迎提出学习体验或内容方面的建议。", reportTitle: "通过 GitHub 反馈", reportBody: "Tai Wén 在项目 Issues 页面接收问题和建议。内容公开可见，提交时需要 GitHub 账户。", reportSteps: ["写明出现问题的页面或课程。", "描述操作步骤和看到的结果；截图会更有帮助。", "如果是试题问题，请写明级别、试卷和题号。不要提供密码或私人信息。"], openIssue: "打开反馈页面", requirement: "发布报告需要 GitHub 账户。", privacyTitle: "保护个人信息", privacyBody: "GitHub Issues 是公开页面。请勿提交个人邮箱、密码、登录验证码或私人学习数据。", quickTitle: "先看看常见问题？", quickBody: "账户、进度和模拟练习的许多疑问，常见问题页已有简明解答。", quickAction: "查看常见问题" },
  },
  "zh-TW": {
    nav: { explore: "探索 Tai Wén", about: "關於 Tai Wén", features: "功能指南", faq: "常見問題", contact: "聯絡與回饋", exam: "考試指南", home: "首頁" },
    common: { available: "現已開放", conditional: "登入後同步", planned: "日後開放", open: "開啟功能", readMore: "了解更多", back: "探索 Tai Wén" },
    home: { eyebrow: "從哪裡開始？", title: "認識 Tai Wén。", lead: "了解網站背後的故事、各項學習功能，以及開始前可能遇到的問題。", intro: "找到適合自己的學習路線", about: "Tai Wén 背後的故事", features: "了解學習功能", faq: "快速解答常見問題" },
    about: { eyebrow: "關於 TAI WÉN", title: "按照自己的步調學華語。", lead: "Tai Wén 把課程、詞彙和 TOCFL 模擬練習放在同一個空間。先從一小課開始，準備好再繼續。", missionLabel: "01 / 初衷", missionTitle: "少花時間找資料，多花時間學習。", mission: "按教材循序學習、按主題複習詞語，或透過模擬題檢驗理解。每種工具都有自己的用途，學習進度則始終屬於你。", methodLabel: "02 / 學習方式", methodTitle: "學習、嘗試，再回顧。", method: "閱讀課文、聽音檔、學詞彙和語法，再完成練習。TOCFL 模擬練習可以選擇聽力、閱讀或整份試題，交卷後再查看答案。", mascotLabel: "學習夥伴", mascotTitle: "臺灣黑熊", mascot: "這隻小熊陪伴你的學習旅程，提醒你一步一步來，不必著急。", bioLabel: "開發者", bioTitle: "你好，我是 Uyên Trần。", bio1: "我叫 Uyên Trần，目前在越南自學繁體中文，也希望將來到臺灣留學。學習過程中，我發現面向越南人的資料，尤其是 TOCFL 練習資料，常常分散在不同地方。", bio2: "因此，我建立了 Tai Wén，希望提供一個簡潔、好用的地方，讓大家學習、練習並準備 TOCFL。我自己也還在學中文，這個網站會隨著這段旅程繼續完善。", next: "看看有哪些學習工具" },
    guide: { eyebrow: "功能指南", title: "選一種方式，開始學習。", lead: "每種工具解決不同的學習需求。這裡介紹目前可用的功能，以及最簡單的開始方法。", startLabel: "第一次來到 TAI WÉN", startTitle: "應該從哪裡開始？", startLead: "如果還不確定，可以試試這三步。之後隨時可以換一種學習方式。", startSteps: ["開啟 Academy，選擇適合自己程度的一課。", "用詞卡複習新詞，或依需要的情境建立詞語集。", "想檢驗成果時，選一份 TOCFL 模擬題，先做聽力或閱讀。"], availability: "以下工具現已開放。跨裝置同步進度需要登入並連接網路。", plannedNote: "目前兩冊之外的新教材，將在內容完成後開放。", sections: ["按課程學習", "按需要練習", "回顧學習成果"], audienceLabel: "適合", howLabel: "三步開始", features: [
      { title: "Tai Wén Academy", purpose: "學習《當代中文課程》第一、二冊。每課包括課文、詞彙、語法、聽力、練習和測驗。", audience: "希望按清晰路線學習的人。", steps: ["開啟 Academy 並選擇冊別。", "選擇一課，無須按照固定順序。", "進入學習活動，或從上次停下的地方繼續。"], action: "開啟 Academy" },
      { title: "詞彙學習", purpose: "按主題、教材或 TOCFL 級別學習。已整理的詞條提供拼音、釋義和例句。", audience: "想累積和複習詞彙的人。", steps: ["選擇一種學習路線。", "選擇主題、課次或級別。", "標記已學詞語，之後再複習。"], action: "選擇詞彙路線" },
      { title: "詞卡", purpose: "先看漢字並回想詞義，再翻卡查看解釋與例句。", audience: "喜歡主動回憶、快速複習的人。", steps: ["開啟 TOCFL 分級詞彙。", "選擇級別並開始學習。", "翻卡、切換詞語並標記已學。"], action: "使用詞卡" },
      { title: "個人化詞語集", purpose: "根據所選主題、目標和程度，從現有詞庫建立詞語集。", audience: "準備特定生活情境的人。", steps: ["開啟情境詞彙。", "選擇主題、目標和程度。", "建立詞語集並開始學習。"], action: "建立詞語集" },
      { title: "TOCFL 模擬練習", purpose: "按級別選題，再選擇練習或模擬模式，以及聽力、閱讀或整份試題。", audience: "想熟悉題型並自我檢測的人。", steps: ["開啟題庫並篩選級別。", "選擇模式、部分和文字形式。", "完成並提交試題。"], action: "瀏覽題庫" },
      { title: "聽力與閱讀", purpose: "可以只練一部分，也可以完成整份試題。聽力按試題音檔播放，閱讀顯示對應內容和選項。", audience: "想集中練習某項技能的人。", steps: ["選擇一份試題。", "選擇聽力、閱讀或整份試題。", "選擇繁體或簡體後開始。"], action: "選擇考試部分" },
      { title: "答案回顧", purpose: "交卷後查看自己的答案、正確答案，以及已有的翻譯或聽力文字。", audience: "想弄清錯題原因的人。", steps: ["完成並提交模擬題。", "開啟成績頁並選擇答案回顧。", "逐題查看已有的說明。"], action: "先做一份試題" },
      { title: "學習進度", purpose: "查看已學詞語、正在做的試題和成績紀錄。登入後可在不同裝置間同步。", audience: "希望從上次進度繼續的人。", steps: ["先學習或完成一份試題。", "開啟個人資料查看進度。", "如需跨裝置同步，請登入。"], action: "開啟個人資料" },
    ] },
    faq: { eyebrow: "常見問題", title: "你想了解什麼？", lead: "關於學習、模擬練習和進度保存的簡明解答。", search: "搜尋問題和答案…", searchLabel: "搜尋常見問題", noResults: "找不到相關問題，試試其他關鍵字。", clear: "清除篩選", categories: { all: "全部", start: "入門", academy: "課程與詞彙", tocfl: "TOCFL 練習", account: "帳戶與支援" }, items: [
      { category: "start", question: "我應該從哪裡開始？", answer: "想按路線學習，可以開啟 Academy 選擇一課；只有幾分鐘，可以用詞卡；想自我檢測，可以瀏覽 TOCFL 試題。" },
      { category: "start", question: "學習前必須註冊帳戶嗎？", answer: "不需要。訪客模式可以學習。如需將進度保存到帳戶並在其他裝置繼續，再登入即可。" },
      { category: "academy", question: "Academy 有哪些教材？", answer: "目前開放《當代中文課程》第一冊和第二冊，每冊 15 課。新教材將在內容完成後開放。" },
      { category: "academy", question: "必須按順序學習嗎？", answer: "不必。你可以選擇適合自己的已開放課程。Tai Wén 會保存目前學習活動，方便返回。" },
      { category: "academy", question: "繁體和簡體與介面語言有關嗎？", answer: "兩者是獨立設定。支援的課程和試題可以選擇文字形式；即使介面使用英語，也可以做繁體試題。" },
      { category: "academy", question: "詞卡怎麼用？", answer: "正面先顯示詞語，讓你自己回想；點擊後查看詞義和例句，再切換下一詞，並可標記已學。" },
      { category: "tocfl", question: "Novice、Band A、B、C 是什麼？", answer: "Tai Wén 用這些級別整理 TOCFL 詞彙和模擬題。選擇適合目前目標的級別，之後隨時可以更改篩選。" },
      { category: "tocfl", question: "練習模式和模擬模式有什麼區別？", answer: "練習模式方便自主切換題目。模擬模式採用更專注的介面，並按試題音檔順序播放聽力。兩種模式交卷後都可查看結果。" },
      { category: "tocfl", question: "可以只做聽力或閱讀嗎？", answer: "可以。選好模式後，可選擇只做聽力、只做閱讀或完成整份試題；成績按所選範圍顯示。" },
      { category: "tocfl", question: "模擬題分數是 TOCFL 官方成績嗎？", answer: "不是。分數按模擬題的換算表計算，僅供參考。正式成績由考試主辦方公布。" },
      { category: "account", question: "進度能在不同裝置間同步嗎？", answer: "使用同一帳戶登入並保持連網時可以同步。訪客進度會留在目前裝置，直到你同意匯入帳戶。" },
      { category: "account", question: "同步出錯會刪除訪客資料嗎？", answer: "登入不會自動刪除訪客進度。若同步尚未完成，請保留瀏覽器資料，網路穩定後再試。" },
      { category: "account", question: "如何回饋問題？", answer: "前往聯絡與回饋頁面，透過 GitHub Issues 提交。需要 GitHub 帳戶；請勿在公開報告中填寫密碼或私人資訊。" },
    ], helpTitle: "還有疑問？", helpText: "提交問題或建議，幫助 Tai Wén 繼續改進。" },
    contact: { eyebrow: "聯絡與回饋", title: "發現問題？歡迎告訴我。", lead: "清楚的描述有助於更快找到並修復問題。也歡迎提出學習體驗或內容方面的建議。", reportTitle: "透過 GitHub 回饋", reportBody: "Tai Wén 在專案 Issues 頁面接收問題和建議。內容公開可見，提交時需要 GitHub 帳戶。", reportSteps: ["寫明出現問題的頁面或課程。", "描述操作步驟和看到的結果；截圖會更有幫助。", "如果是試題問題，請寫明級別、試卷和題號。不要提供密碼或私人資訊。"], openIssue: "開啟回饋頁面", requirement: "發布報告需要 GitHub 帳戶。", privacyTitle: "保護個人資訊", privacyBody: "GitHub Issues 是公開頁面。請勿提交個人電子郵件、密碼、登入驗證碼或私人學習資料。", quickTitle: "先看看常見問題？", quickBody: "帳戶、進度和模擬練習的許多疑問，常見問題頁已有簡明解答。", quickAction: "查看常見問題" },
  },
};
