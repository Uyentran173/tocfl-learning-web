"""Build reviewed Volume 2 Lesson 04 from textbook PDF pages 107–121."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin


ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")
PREFIX = "cc2-v2-l04"


def sentence(chinese: str, meaning: str) -> dict:
    return {"chinese": chinese, "simplified": CONVERT.convert(chinese),
            "pinyin": " ".join(lazy_pinyin(chinese, style=Style.TONE, errors=lambda value: list(value))),
            "meaningVi": meaning}


def question(group: str, number: int, prompt: str, correct: str, wrong: list[str], feedback: str, skill: str, **extra) -> dict:
    choices = [correct, *wrong]
    seed = int(hashlib.sha256(f"{PREFIX}-{group}-{number}".encode()).hexdigest()[:8], 16)
    offset = seed % len(choices)
    choices = choices[offset:] + choices[:offset]
    return {"id": f"{PREFIX}-{group}-{number:02d}", "prompt": prompt,
            "options": [{"id": "abcd"[index], "text": value} for index, value in enumerate(choices)],
            "correctOptionId": "abcd"[choices.index(correct)], "feedback": feedback, "skill": skill, **extra}


# Checked against the visible Traditional dialogue on textbook pages 80–81 (PDF 107–108).
DIALOGUE = [
    ("主任", "請坐，妳是高美玲嗎？", "Mời ngồi. Cô là Cao Mỹ Linh phải không?"),
    ("美玲", "是。您好。", "Vâng. Chào ông."),
    ("主任", "請妳先介紹一下自己。", "Cô hãy giới thiệu sơ về mình trước."),
    ("美玲", "我叫高美玲，是法國人，今年二十八歲，現在在師大學中文。我念大學的時候上過亞洲文化和語言學。", "Tôi là Cao Mỹ Linh, người Pháp, năm nay 28 tuổi và đang học tiếng Hoa ở Sư Đại. Hồi đại học tôi từng học văn hóa châu Á và ngôn ngữ học."),
    ("主任", "妳有沒有教法文的經驗？請妳談一談。", "Cô có kinh nghiệm dạy tiếng Pháp không? Mời cô kể một chút."),
    ("美玲", "有。我當過語言助教，那時候的學生都是外國人。", "Có. Tôi từng làm trợ giảng ngôn ngữ; học viên lúc đó đều là người nước ngoài."),
    ("主任", "妳一個星期能來幾天？", "Một tuần cô có thể đến mấy ngày?"),
    ("美玲", "我現在上午學中文，下午兩點以後都可以，但是我希望一個禮拜教三天就好了。", "Hiện tôi học tiếng Hoa buổi sáng. Sau hai giờ chiều lúc nào cũng được, nhưng tôi muốn dạy ba ngày mỗi tuần thôi."),
    ("主任", "妳除了法文、中文，還會什麼語言？", "Ngoài tiếng Pháp và tiếng Hoa, cô còn biết ngôn ngữ nào?"),
    ("美玲", "我還會說西班牙語和英文。", "Tôi còn nói được tiếng Tây Ban Nha và tiếng Anh."),
    ("主任", "妳教過西班牙語嗎？", "Cô từng dạy tiếng Tây Ban Nha chưa?"),
    ("美玲", "我大學三年級的暑假，當過西班牙語老師。", "Hè năm ba đại học, tôi từng dạy tiếng Tây Ban Nha."),
    ("主任", "妳的工作經驗聽起來很不錯。", "Kinh nghiệm làm việc của cô nghe khá tốt."),
    ("美玲", "謝謝您。對了，我想請教一下，貴中心老師的薪水怎麼算？", "Cảm ơn ông. À, tôi muốn hỏi lương giáo viên ở trung tâm được tính thế nào?"),
    ("主任", "我們是按照大學教授的鐘點費算的。薪水跟大學老師的一樣。", "Chúng tôi tính theo thù lao giờ của giáo sư đại học. Lương bằng với giáo viên đại học."),
    ("美玲", "我很想試試這份工作。", "Tôi rất muốn thử công việc này."),
    ("主任", "歡迎妳，妳下個月一號就可以來嗎？", "Rất hoan nghênh cô. Ngày mùng một tháng sau cô có thể bắt đầu không?"),
    ("美玲", "可以的。謝謝。", "Được ạ. Cảm ơn ông."),
]


# Three paragraphs checked against the visible Traditional reading on textbook page 84 (PDF 111).
READING = [
    ("高美玲來了一年了，按照台灣的法律，她已經可以打工了，所以她的台灣朋友給她介紹了一個在大學語言中心教法文的工作。雖然高美玲覺得自己的經驗還不夠，可是決定去試一試。所以她帶著履歷表到語言中心去跟主任面談。", "Cao Mỹ Linh đã đến đây một năm. Theo luật Đài Loan, cô đã có thể đi làm thêm, vì vậy một người bạn Đài Loan giới thiệu cho cô công việc dạy tiếng Pháp tại trung tâm ngôn ngữ của một trường đại học. Dù thấy kinh nghiệm còn thiếu, cô vẫn quyết định thử và mang CV đến phỏng vấn với người phụ trách."),
    ("這位主任姓黃，是法國華僑，在台灣住了十幾年，他也在大學工作了十年了。高美玲在辦公室跟他談話的時候，他先問高美玲在法國的工作經驗，再問她在台灣學中文跟生活的情形。黃主任覺得高美玲的經驗很適合這份工作。", "Người phụ trách họ Hoàng, là Hoa kiều ở Pháp. Ông sống tại Đài Loan hơn mười năm và cũng đã làm việc ở trường đại học mười năm. Khi hai người trò chuyện trong văn phòng, ông hỏi kinh nghiệm làm việc của Mỹ Linh ở Pháp trước, rồi hỏi về việc học tiếng Hoa và cuộc sống của cô tại Đài Loan. Ông thấy kinh nghiệm của cô rất phù hợp với công việc này."),
    ("黃主任也給高美玲介紹了上課的書，還跟她說明了工作環境。然後，黃主任告訴高美玲，薪水按照工作的時間算，每個月的月底發薪水。高美玲覺得這份工作聽起來很不錯，所以馬上就答應了。黃主任對她說，下個月一號就開始上班。高美玲沒想到這次的面談這麼順利。", "Chủ nhiệm Hoàng còn giới thiệu sách dạy học cho Mỹ Linh và giải thích môi trường làm việc. Sau đó, ông cho biết lương được tính theo thời gian làm việc và trả vào cuối mỗi tháng. Mỹ Linh thấy công việc nghe rất ổn nên đồng ý ngay. Ông bảo cô bắt đầu đi làm vào ngày mùng một tháng sau. Cô không ngờ buổi phỏng vấn lại thuận lợi đến vậy."),
]


GRAMMAR = [
    ("除了…還… — ngoài… còn…", "Dùng 除了 để nêu điều đã biết, rồi dùng 還 hoặc 也 để bổ sung một điều nữa. Nếu cả hai hành động đều phủ định, đặt từ phủ định sau 除了 và sau 還: 除了不喝茶，還不喝咖啡. Trong bài, người phỏng vấn hỏi về những ngoại ngữ khác ngoài tiếng Pháp và tiếng Hoa.", "除了 + danh từ / hành động A，(chủ ngữ) + 還 / 也 + hành động B", ("妳除了法文、中文，還會什麼語言？", "Ngoài tiếng Pháp và tiếng Hoa, cô còn biết ngôn ngữ nào?"), ("除了法文，她還會說西班牙語。", "Ngoài tiếng Pháp, cô ấy còn nói được tiếng Tây Ban Nha."), "Đừng dừng câu ở 除了… khi muốn nói thêm; vế sau cần 還 hoặc 也 để nối ý.", "除了法文，她＿＿會說英文。", "還", ["過", "按照"]),
    ("按照 — theo; dựa theo", "按照 là giới từ chỉ căn cứ để làm một việc. Cụm 按照 + căn cứ có thể đứng đầu câu hoặc đứng trước động từ. Trong bài, lương được tính theo mức thù lao theo giờ của giáo sư. Nếu phủ định, đặt 沒 hoặc 不 trước 按照.", "按照 + căn cứ，+ hành động / chủ ngữ + 按照 + căn cứ + động từ", ("我們是按照大學教授的鐘點費算的。", "Chúng tôi tính theo thù lao giờ của giáo sư đại học."), ("薪水按照工作的時間算。", "Lương được tính theo thời gian làm việc."), "Không đặt 按照 sau động từ 算 trong câu này; căn cứ đứng trước hành động tính.", "薪水＿＿工作的時間算。", "按照", ["除了", "當過"]),
    ("跟 — cùng; với; từ", "跟 mang nghĩa khác nhau tùy động từ: 跟朋友去 là đi cùng bạn; 跟主任談 là nói chuyện với người phụ trách; 跟老師學 là học từ thầy cô. Trong bài đọc, Mỹ Linh đến phỏng vấn với chủ nhiệm và trò chuyện với ông. Khi phủ định, đặt 沒 hoặc 不 trước 跟.", "跟 + người + động từ; ý nghĩa xác định theo động từ", ("她帶著履歷表去跟主任面談。", "Cô ấy mang CV đến phỏng vấn với người phụ trách."), ("我想跟老師學法文。", "Tôi muốn học tiếng Pháp từ thầy giáo."), "Đừng dịch 跟 thành 'cùng' trong mọi câu; 跟老師學 nghĩa là học từ thầy cô.", "她帶著履歷表去＿＿主任面談。", "跟", ["按照", "除了"]),
    ("給 — cho; vì ai đó", "給 đứng trước người nhận hành động hoặc người được hưởng lợi: 給她介紹工作 là giới thiệu công việc cho cô ấy; 給她準備書 là chuẩn bị sách cho cô ấy. Khi 給 mang nghĩa 'cho ai', tiếng Hoa Đài Loan cũng thường đặt cụm 給 + người sau động từ. Phủ định đứng trước 給.", "給 + người + động từ + tân ngữ / động từ + tân ngữ + 給 + người", ("朋友給她介紹了一份工作。", "Bạn giới thiệu cho cô ấy một công việc."), ("黃主任也給高美玲介紹了上課的書。", "Chủ nhiệm Hoàng cũng giới thiệu sách dạy học cho Mỹ Linh."), "Phân biệt 給 là động từ 'đưa/cho' với 給 là giới từ chỉ người nhận hoặc người được lợi.", "朋友＿＿她介紹了一份工作。", "給", ["按照", "除了"]),
    ("對 — đối với; hướng tới", "對 nêu đối tượng của lời nói, thái độ hoặc trạng thái. Trong bài, 黃主任對她說 là chủ nhiệm Hoàng nói với cô ấy. Với từ chỉ thái độ, 對…很好 nghĩa là đối xử tốt với ai. Đặt từ phủ định trước 對. Các động từ có thể đi với 對, 跟 hoặc 給 theo thói quen dùng từ; không thể thay tự do trong mọi câu.", "對 + người / sự việc + động từ hoặc tính từ", ("黃主任對她說，下個月一號就開始上班。", "Chủ nhiệm Hoàng nói với cô ấy rằng mùng một tháng sau bắt đầu làm việc."), ("他對學生很客氣。", "Ông ấy rất lịch sự với học viên."), "Không dùng 對 để thay mọi 跟 hoặc 給; hãy nhìn động từ đi kèm và ý nghĩa của câu.", "黃主任＿＿她說，下個月開始上班。", "對", ["按照", "除了"]),
]


def build() -> dict:
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson04-vocabulary.json").read_text())
    grammar = []
    for index, (title, explanation, pattern, first, second, mistake, blank, correct, wrong) in enumerate(GRAMMAR, 1):
        grammar.append({"id": f"{PREFIX}-grammar-{index:02d}", "title": title,
                        "audioTrackId": f"cc2-textbook-l04-t{index + 4:02d}", "explanation": explanation,
                        "structure": pattern, "examples": [sentence(*first), sentence(*second)],
                        "commonMistake": mistake,
                        "check": question("grammar-check", index, f"Điền vào câu: {blank}", correct, wrong, explanation.split(".")[0] + ".", title)})
    practice = [
        question("practice", 1, "‘打工’ nghĩa là gì?", "làm thêm", ["nghỉ học", "đi du lịch"], "打工 là làm thêm, thường ngoài giờ học hoặc công việc chính.", "Từ vựng"),
        question("practice", 2, "Điền: 除了法文，她＿＿會說英文。", "還", ["過", "按照"], "除了…還… nêu thêm một khả năng ngoài điều đã nhắc.", "Ngữ pháp"),
        question("practice", 3, "Mỹ Linh muốn dạy mấy ngày mỗi tuần?", "Ba ngày", ["Hai ngày", "Năm ngày"], "Cô nói 希望一個禮拜教三天.", "Hội thoại"),
        question("practice", 4, "Điền: 薪水＿＿工作的時間算。", "按照", ["除了", "對"], "按照 nêu căn cứ để tính lương.", "Ngữ pháp"),
        question("practice", 5, "Chủ nhiệm hỏi kinh nghiệm nào của Mỹ Linh trước?", "Kinh nghiệm làm việc ở Pháp", ["Kinh nghiệm nấu ăn", "Việc đi du lịch ở Đài Loan"], "Bài đọc ghi 先問高美玲在法國的工作經驗.", "Bài đọc"),
        question("practice", 6, "Điền: 她去＿＿主任面談。", "跟", ["按照", "除了"], "跟主任面談 là phỏng vấn với người phụ trách.", "Ngữ pháp"),
        question("practice", 7, "Công việc được trả lương khi nào?", "Cuối mỗi tháng", ["Mỗi sáng", "Mùng một mỗi tuần"], "Bài đọc ghi 每個月的月底發薪水.", "Bài đọc"),
        question("practice", 8, "Điền: 朋友＿＿她介紹了一份工作。", "給", ["除了", "按照"], "給她介紹 là giới thiệu cho cô ấy.", "Ngữ pháp"),
    ]
    assessment = [
        question("assessment", 1, "‘履歷表’ là gì?", "CV; bản lý lịch", ["tiền lương", "bảng giờ học"], "履歷表 là bản lý lịch dùng khi xin việc.", "Từ vựng"),
        question("assessment", 2, "Mỹ Linh đã từng làm công việc gì?", "Trợ giảng ngôn ngữ", ["Chủ nhiệm trung tâm", "Giáo sư đại học"], "Cô nói 我當過語言助教.", "Hội thoại"),
        question("assessment", 3, "Điền: 我＿＿老師學中文。", "跟", ["按照", "除了"], "跟老師學 là học từ thầy cô.", "Ngữ pháp"),
        question("assessment", 4, "Ngoài tiếng Pháp và tiếng Hoa, Mỹ Linh nói được những tiếng nào?", "Tiếng Tây Ban Nha và tiếng Anh", ["Tiếng Nhật và tiếng Hàn", "Tiếng Đức và tiếng Nga"], "Cô nói 我還會說西班牙語和英文.", "Hội thoại"),
        question("assessment", 5, "Điền: 按照法律，她＿＿可以打工了。", "已經", ["除了", "跟"], "已經…了 nhấn mạnh việc hiện đã được phép.", "Bài đọc"),
        question("assessment", 6, "Mỹ Linh mang gì đến buổi phỏng vấn?", "CV", ["Bản đồ", "Ảnh du lịch"], "Bài đọc ghi 帶著履歷表…面談.", "Bài đọc"),
        question("assessment", 7, "Điền: 主任＿＿她說，下個月開始上班。", "對", ["按照", "除了"], "對她說 là nói với cô ấy.", "Ngữ pháp"),
        question("assessment", 8, "Tiền lương được tính theo điều gì?", "Thời gian làm việc", ["Số năm sống ở Đài Loan", "Số ngoại ngữ biết nói"], "Bài đọc ghi 薪水按照工作的時間算.", "Bài đọc"),
        question("assessment", 9, "Điền: 除了法文，她＿＿會說西班牙語。", "還", ["過", "對"], "除了…還… nối điều đã biết với điều bổ sung.", "Ngữ pháp"),
        question("assessment", 10, "Mỹ Linh bắt đầu đi làm khi nào?", "Mùng một tháng sau", ["Ngay ngày phỏng vấn", "Cuối năm"], "Chủ nhiệm nói 下個月一號就開始上班.", "Đọc hiểu"),
    ]
    return {
        "contentVersion": 2, "id": PREFIX, "title": "我打工，我教法文", "titleVi": "Tôi làm thêm, dạy tiếng Pháp",
        "description": "Giới thiệu kinh nghiệm, hỏi về công việc, tiền lương và buổi phỏng vấn.",
        "objectives": ["Giới thiệu học vấn và kinh nghiệm làm việc.", "Hỏi về lịch làm việc và cách tính lương.", "Dùng 除了…還…, 按照 và các giới từ 跟, 給, 對 đúng ngữ cảnh."],
        "estimatedMinutes": None,
        "lecture": {
            "introduction": "Mỹ Linh phỏng vấn vị trí dạy tiếng Pháp. Nghe cách cô giới thiệu bản thân, hỏi về lương và nhận lời làm việc.",
            "sections": [
                {"id": f"{PREFIX}-section-01", "title": "Kể kinh nghiệm làm việc", "body": "Mỹ Linh dùng 當過 để nói việc đã từng làm; người phỏng vấn hỏi rõ kinh nghiệm dạy học của cô.", **sentence("我當過語言助教。", "Tôi từng làm trợ giảng ngôn ngữ.")},
                {"id": f"{PREFIX}-section-02", "title": "Hỏi cách tính lương", "body": "Hãy nghe câu hỏi 怎麼算 và cách dùng 按照 để nêu căn cứ tính lương.", **sentence("我們是按照大學教授的鐘點費算的。", "Chúng tôi tính theo thù lao giờ của giáo sư đại học.")},
            ],
            "dialogues": [
                {"id": f"{PREFIX}-dialogue", "title": "Phỏng vấn ở trung tâm ngôn ngữ", "context": "Mỹ Linh trao đổi với người phụ trách về vị trí dạy tiếng Pháp.", "audioTrackId": "cc2-textbook-l04-t01", "turns": [{"speaker": speaker, **sentence(text, vi)} for speaker, text, vi in DIALOGUE]},
                {"id": f"{PREFIX}-reading", "title": "Buổi phỏng vấn của Mỹ Linh", "context": "Bài đọc kể vì sao Mỹ Linh đi phỏng vấn và cô nhận công việc như thế nào.", "audioTrackId": "cc2-textbook-l04-t03", "turns": [{"speaker": "Bài đọc", **sentence(text, vi)} for text, vi in READING]},
            ],
            "checks": [
                question("check", 1, "Mỹ Linh từng làm gì trước đây?", "Trợ giảng ngôn ngữ", ["Giáo sư đại học", "Chủ nhiệm trung tâm"], "Cô nói 我當過語言助教.", "Hội thoại"),
                question("check", 2, "Vì sao Mỹ Linh có thể đi làm thêm ở Đài Loan?", "Cô đã đến Đài Loan một năm", ["Cô đã có bằng giáo sư", "Cô không cần đi học nữa"], "Bài đọc ghi 來了一年了，按照台灣的法律，她已經可以打工了.", "Bài đọc"),
            ], "pronunciation": [], "culture": [],
        },
        "vocabulary": {"introduction": "Chạm vào từ để xem phiên âm, nghĩa và ví dụ.", "wordIds": [record["id"] for record in vocabulary["records"]], "audioTracks": [{"id": "cc2-textbook-l04-t02", "label": "Từ vựng hội thoại"}, {"id": "cc2-textbook-l04-t04", "label": "Từ vựng bài đọc"}]},
        "grammar": grammar, "listening": [
            question("listening", 1, "Nghe hội thoại. Mỹ Linh đã từng làm công việc gì?", "Trợ giảng ngôn ngữ", ["Chủ nhiệm", "Nhân viên bán hàng"], "Cô nói 我當過語言助教.", "Nghe chi tiết", audioTrackId="cc2-textbook-l04-t01"),
            question("listening", 2, "Nghe hội thoại. Mỹ Linh muốn dạy mấy ngày một tuần?", "Ba ngày", ["Hai ngày", "Sáu ngày"], "Cô nói 希望一個禮拜教三天.", "Nghe số lượng", audioTrackId="cc2-textbook-l04-t01"),
            question("listening", 3, "Nghe bài đọc. Chủ nhiệm Hoàng từng sống ở Đài Loan bao lâu?", "Hơn mười năm", ["Một năm", "Ba tháng"], "Bài đọc nói 在台灣住了十幾年.", "Nghe thời gian", audioTrackId="cc2-textbook-l04-t03"),
            question("listening", 4, "Nghe bài đọc. Mỹ Linh nhận lương khi nào?", "Cuối mỗi tháng", ["Đầu mỗi tuần", "Mỗi sáng"], "Bài đọc nói 每個月的月底發薪水.", "Nghe chi tiết", audioTrackId="cc2-textbook-l04-t03"),
        ],
        "practice": practice, "assessment": assessment,
        "writingTask": {"id": f"{PREFIX}-writing", "title": "Giới thiệu khi xin việc", "prompt": "Viết 2–3 câu về kinh nghiệm của bạn và một câu hỏi về công việc. Thử dùng 除了…還… hoặc 按照.", "sampleTraditional": "我當過語言助教。除了教法文，我還會說中文。請問薪水怎麼算？", "sampleSimplified": "我当过语言助教。除了教法文，我还会说中文。请问薪水怎么算？"},
    }


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


def main() -> None:
    lesson = build()
    (ROOT / "data/academy/cc2-lesson04.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-reviewed-content.json"
    reviewed = json.loads(path.read_text())
    reviewed.update({
        "cc2-textbook-l04-t01": {"transcriptTraditional": "\n".join(f"{who}：{text}" for who, text, _ in DIALOGUE), "transcriptSimplified": "\n".join(f"{who}：{CONVERT.convert(text)}" for who, text, _ in DIALOGUE), "translationVi": "\n".join(f"{who}：{vi}" for who, _, vi in DIALOGUE)},
        "cc2-textbook-l04-t03": {"transcriptTraditional": "\n\n".join(text for text, _ in READING), "transcriptSimplified": "\n\n".join(CONVERT.convert(text) for text, _ in READING), "translationVi": "\n\n".join(vi for _, vi in READING)},
    })
    path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-script-map.json"
    script_map = json.loads(path.read_text())
    script_map.update({char: CONVERT.convert(char) for char in set("".join(strings(lesson))) if CONVERT.convert(char) != char})
    path.write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(DIALOGUE)} turns, {len(READING)} paragraphs, {len(lesson['vocabulary']['wordIds'])} words, {len(lesson['grammar'])} grammar points")


if __name__ == "__main__":
    main()
