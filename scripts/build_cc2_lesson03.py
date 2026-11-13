"""Build reviewed Volume 2 Lesson 03 from textbook PDF pages 79–94."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin


ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")
PREFIX = "cc2-v2-l03"


def sentence(chinese: str, meaning: str) -> dict:
    return {
        "chinese": chinese,
        "simplified": CONVERT.convert(chinese),
        "pinyin": " ".join(lazy_pinyin(chinese, style=Style.TONE, errors=lambda value: list(value))),
        "meaningVi": meaning,
    }


def question(group: str, number: int, prompt: str, correct: str, wrong: list[str], feedback: str, skill: str, **extra) -> dict:
    choices = [correct, *wrong]
    seed = int(hashlib.sha256(f"{PREFIX}-{group}-{number}".encode()).hexdigest()[:8], 16)
    offset = seed % len(choices)
    choices = choices[offset:] + choices[:offset]
    return {
        "id": f"{PREFIX}-{group}-{number:02d}", "prompt": prompt,
        "options": [{"id": "abcd"[index], "text": value} for index, value in enumerate(choices)],
        "correctOptionId": "abcd"[choices.index(correct)], "feedback": feedback, "skill": skill, **extra,
    }


# Speaker names and source lines were checked against the visible Traditional pages 79–80.
DIALOGUE = [
    ("田中", "早，妳今天來得真早。", "Chào buổi sáng, hôm nay bạn đến sớm thật."),
    ("如玉", "是啊！我今天是搭捷運來的。", "Ừ! Hôm nay mình đến bằng MRT."),
    ("田中", "今天的考試，妳準備了嗎？", "Bạn chuẩn bị cho bài thi hôm nay chưa?"),
    ("如玉", "準備得差不多了，應該可以考得不錯。你覺得聽寫很容易吧？", "Mình chuẩn bị gần xong rồi, chắc sẽ làm bài khá tốt. Bạn thấy nghe viết dễ lắm nhỉ?"),
    ("田中", "是啊，日本人從小學就開始學寫漢字。", "Ừ, người Nhật bắt đầu học viết chữ Hán từ tiểu học."),
    ("如玉", "我現在也覺得寫字不難，因為我在美國念高中的時候就學過了。", "Bây giờ mình cũng thấy viết chữ không khó, vì hồi học cấp ba ở Mỹ mình đã học rồi."),
    ("田中", "妳在這個語言中心學了多久了？", "Bạn học ở trung tâm ngôn ngữ này được bao lâu rồi?"),
    ("如玉", "我才學了半年，你呢？", "Mình mới học nửa năm. Còn bạn?"),
    ("田中", "我來了快一年了，可是我說話，還說得不夠流利。", "Mình đến gần một năm rồi, nhưng nói vẫn chưa đủ lưu loát."),
    ("如玉", "雖然我只來了半年，但是我知道我的中文進步了。", "Tuy mình mới đến nửa năm, nhưng mình biết tiếng Hoa của mình đã tiến bộ."),
    ("田中", "我覺得在說中文的環境裡學中文，進步得比較快。", "Mình thấy học tiếng Hoa trong môi trường nói tiếng Hoa sẽ tiến bộ nhanh hơn."),
    ("如玉", "我同意。我希望回國的時候能看中文報紙。", "Mình đồng ý. Mình mong khi về nước có thể đọc báo tiếng Hoa."),
    ("田中", "我想妳一定可以。今天下了課，妳要去哪裡？", "Mình nghĩ chắc chắn bạn làm được. Hôm nay tan học bạn sẽ đi đâu?"),
    ("如玉", "我要去活動中心跟語言交換的朋友見面。", "Mình đến trung tâm sinh hoạt gặp bạn trao đổi ngôn ngữ."),
    ("田中", "妳說的活動中心在哪裡？", "Trung tâm sinh hoạt bạn nói ở đâu?"),
    ("如玉", "在一樓有麵包店的那棟樓裡面，我們一起去聽過一次演講，記得嗎？", "Ở trong tòa nhà có tiệm bánh mì ở tầng một. Chúng ta từng cùng đến đó nghe một buổi diễn thuyết, bạn nhớ không?"),
    ("田中", "噢，我想起來了。", "À, mình nhớ ra rồi."),
]


# Three paragraphs checked against the visible Traditional reading on page 83.
READING = [
    ("馬安同到師大來學中文，他選了每天上三個小時的課，下了課要寫作業，還要準備第二天的課。馬安同剛開始學寫中國字，覺得真難，所以每天都練習寫字，常常半夜十二點多才睡覺。雖然有點累，但是他很高興現在會寫很多字了。", "Mã An Đồng đến Sư Đại học tiếng Hoa. Anh chọn lớp học ba tiếng mỗi ngày; tan học còn phải làm bài tập và chuẩn bị bài ngày hôm sau. Lúc mới học viết chữ Hán, anh thấy rất khó nên ngày nào cũng tập viết, thường sau nửa đêm mới ngủ. Dù hơi mệt, anh rất vui vì bây giờ đã viết được nhiều chữ."),
    ("週末，馬安同比平常輕鬆多了。他有時候搭捷運去貓空喝茶，有時候坐公車去陽明山爬山。爬山的時候，他認識了很多台灣人。台灣人對外國人很好，常常跟馬安同聊天，告訴他一些台灣的文化。", "Cuối tuần, Mã An Đồng thư thả hơn ngày thường nhiều. Có khi anh đi MRT đến Miêu Không uống trà, có khi đi xe buýt đến núi Dương Minh leo núi. Khi leo núi, anh quen nhiều người Đài Loan. Họ đối xử tốt với người nước ngoài, thường trò chuyện với anh và kể về văn hóa Đài Loan."),
    ("馬安同有一個語言交換的朋友，他們一有空，就拿著地圖搭捷運去逛逛。安同喜歡看捷運上的廣告，要是有沒學過的字，他就會問那位朋友怎麼說。他覺得到處走走，可以了解台灣人的生活，也可以練習練習中文，哪裡都能學中文，真是不錯。", "Mã An Đồng có một người bạn trao đổi ngôn ngữ. Hễ rảnh, hai người lại cầm bản đồ đi MRT dạo quanh. Anh thích xem quảng cáo trên MRT; gặp chữ chưa học thì hỏi người bạn ấy cách đọc. Anh thấy đi đây đó giúp mình hiểu đời sống người Đài Loan, đồng thời luyện tiếng Hoa. Học ở đâu cũng được, thật hay."),
]


# Each item: title, explanation, pattern, two textbook-based examples, common mistake, and a check.
GRAMMAR = [
    ("差不多 — gần như; xấp xỉ", "差不多 có ba cách dùng trong bài. Đứng một mình làm vị ngữ để nói hai thứ gần giống nhau. Đứng sau động từ hoặc tính từ để nói việc gần đạt mức mong muốn. Đứng trước số lượng để chỉ con số xấp xỉ. Ngữ cảnh quyết định nên hiểu theo cách nào.", "A 跟 B 差不多 / động từ + 得差不多了 / 差不多 + số lượng", ("我們開始學中文的時間差不多。", "Thời gian chúng tôi bắt đầu học tiếng Hoa gần như nhau."), ("我的功課寫得差不多了。", "Bài tập của tôi gần làm xong rồi."), "Đừng hiểu 差不多 là 'đã hoàn thành' trong mọi câu; 写得差不多了 vẫn có thể còn một chút việc.", "我的功課寫得＿＿了。", "差不多", ["過", "報紙"]),
    ("過 — đã từng trải nghiệm", "Đặt 過 sau động từ để nói đã từng có trải nghiệm, không nhấn vào một lần cụ thể. Dùng 沒 khi phủ định: 沒去過. So với 了, 過 thường nói đến kinh nghiệm tính đến hiện tại; 了 có thể kể một sự kiện đã xảy ra vào thời điểm xác định.", "Chủ ngữ + động từ + 過 + tân ngữ / 沒 + động từ + 過", ("我在高中學過中文。", "Tôi đã từng học tiếng Hoa ở cấp ba."), ("我沒去過貓空。", "Tôi chưa từng đến Miêu Không."), "Không nói 不去過 để phủ định một trải nghiệm; dùng 沒去過.", "我以前＿＿台南。", "去過", ["不去過", "去才"]),
    ("才 — mới chỉ; ít hơn mong đợi", "才 đặt trước động từ hoặc cụm số lượng để nhấn mạnh 'mới có bấy nhiêu', ít hơn điều người nói kỳ vọng. Trong câu 我才學了半年, người nói thấy nửa năm là ngắn. 只 cũng có nghĩa 'chỉ' nhưng trung tính hơn; 才 mang đánh giá chủ quan.", "Chủ ngữ + 才 + động từ + số lượng", ("我才學了半年中文。", "Tôi mới học tiếng Hoa được nửa năm."), ("這本書才五十塊。", "Cuốn sách này chỉ có 50 đồng."), "Đừng dùng 才 như một từ chỉ thời quá khứ đơn thuần; nó cho thấy lượng hoặc thời gian ít hơn mong đợi.", "這本書＿＿五十塊。", "才", ["過", "雖然"]),
    ("想起來 — nhớ ra", "想起來 chỉ khoảnh khắc điều đã quên hiện lại trong trí nhớ. Có thể thêm 了 khi sự nhớ ra đã xảy ra: 我想起來了. Khác với 想, đây không phải là 'muốn' hoặc 'nghĩ về' nói chung.", "Chủ ngữ + 想起來 + (tân ngữ) + 了", ("噢，我想起來了。", "Ồ, tôi nhớ ra rồi."), ("那位同學的名字，我想起來了。", "Tên bạn học ấy, tôi nhớ ra rồi."), "Không dùng 想起來 khi muốn nói một dự định; 想去 là 'muốn đi', 想起來 là 'nhớ ra'.", "噢，我＿＿了！", "想起來", ["想去", "才"]),
    ("才 — mãi đến lúc đó mới", "Khi một sự việc xảy ra muộn hơn mong đợi, 才 đứng trước động từ và thường đi với mốc thời gian. '他半夜才睡覺' nghĩa là mãi đến nửa đêm anh ấy mới ngủ. So với 就, 才 gợi cảm giác muộn hoặc lâu; 就 gợi cảm giác sớm hoặc nhanh.", "Mốc thời gian + 才 + động từ", ("他常常半夜十二點多才睡覺。", "Anh ấy thường mãi sau 12 giờ đêm mới đi ngủ."), ("我等了十分鐘，捷運才來。", "Tôi đợi mười phút MRT mới đến."), "Đừng xem 才 và 就 là hai từ thay thế nhau; sắc thái sớm/muộn đối lập.", "我等了十分鐘，捷運＿＿來。", "才", ["過", "雖然"]),
    ("Lặp động từ hai âm tiết ABAB", "Lặp một động từ hai âm tiết theo mẫu ABAB để diễn tả thử hoặc làm một chút: 練習練習, 了解了解. Cách này thường làm lời đề nghị nhẹ hơn. Không thêm 一下 hoặc 一點 sau dạng đã lặp vì cả hai cũng làm nhẹ mức độ hành động.", "AB → ABAB", ("今天的漢字，我還得練習練習。", "Những chữ Hán học hôm nay tôi còn phải luyện thêm một chút."), ("我想了解了解台灣人的生活。", "Tôi muốn tìm hiểu đôi chút về cuộc sống người Đài Loan."), "Không nói 練習練習一下; chọn một cách diễn đạt mức độ nhẹ.", "我想＿＿台灣人的生活。", "了解了解", ["了解一下了解", "了解過了解"]),
]


def build() -> dict:
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson03-vocabulary.json").read_text())
    grammar = []
    for index, (title, explanation, pattern, first, second, mistake, blank, correct, wrong) in enumerate(GRAMMAR, 1):
        grammar.append({
            "id": f"{PREFIX}-grammar-{index:02d}", "title": title,
            "audioTrackId": f"cc2-textbook-l03-t{index + 4:02d}",
            "explanation": explanation, "structure": pattern,
            "examples": [sentence(*first), sentence(*second)], "commonMistake": mistake,
            "check": question("grammar-check", index, f"Điền vào câu: {blank}", correct, wrong, explanation.split(".")[0] + ".", title),
        })
    practice = [
        question("practice", 1, "‘進步’ nghĩa là gì?", "tiến bộ", ["quên mất", "chuẩn bị"], "進步 là tiến bộ trong việc học hoặc một kỹ năng.", "Từ vựng"),
        question("practice", 2, "Điền: 我以前＿＿中文。", "學過", ["不學過", "學才"], "過 đứng sau động từ để nói trải nghiệm.", "Ngữ pháp"),
        question("practice", 3, "田中 học ở trung tâm ngôn ngữ được bao lâu?", "Gần một năm", ["Nửa năm", "Hai năm"], "Anh nói 我來了快一年了.", "Đọc hiểu"),
        question("practice", 4, "Điền: 這本書＿＿五十塊。", "才", ["過", "環境"], "才 cho thấy người nói nghĩ 50 đồng là ít.", "Ngữ pháp"),
        question("practice", 5, "Như Ngọc muốn gặp ai sau giờ học?", "Bạn trao đổi ngôn ngữ", ["Giáo viên dạy tiếng Nhật", "Bạn cùng phòng"], "Cô nói 要去活動中心跟語言交換的朋友見面.", "Hội thoại"),
        question("practice", 6, "Điền: 我等了十分鐘，捷運＿＿來。", "才", ["過", "也"], "才 cho thấy MRT đến muộn hơn mong đợi.", "Ngữ pháp"),
        question("practice", 7, "Mã An Đồng làm gì khi thấy chữ chưa học trên MRT?", "Hỏi bạn cách đọc", ["Bỏ qua luôn", "Mua báo"], "Bài đọc ghi 他就會問那位朋友怎麼說.", "Bài đọc"),
        question("practice", 8, "Chọn cách nói 'luyện tập một chút'.", "練習練習", ["練習練習一下", "練練習習"], "Động từ hai âm tiết lặp theo mẫu ABAB.", "Ngữ pháp"),
    ]
    assessment = [
        question("assessment", 1, "‘報紙’ là gì?", "báo giấy", ["bài thi", "quảng cáo"], "報紙 là báo giấy.", "Từ vựng"),
        question("assessment", 2, "Điền: 你去＿＿陽明山嗎？", "過", ["才", "都"], "過 đứng sau động từ 去 để hỏi trải nghiệm.", "Ngữ pháp"),
        question("assessment", 3, "Như Ngọc đã học tiếng Hoa bao lâu?", "Nửa năm", ["Gần một năm", "Một tháng"], "Cô nói 我才學了半年.", "Hội thoại"),
        question("assessment", 4, "Điền: 我＿＿學了半年中文。", "才", ["過", "雖然"], "才 nhấn mạnh khoảng thời gian còn ngắn.", "Ngữ pháp"),
        question("assessment", 5, "Vì sao Như Ngọc thấy viết chữ không khó?", "Cô đã học từ thời cấp ba", ["Cô không cần học chữ Hán", "Cô chỉ mới bắt đầu học"], "Cô nói 在美國念高中的時候就學過了.", "Hội thoại"),
        question("assessment", 6, "Điền: 噢，我＿＿了。", "想起來", ["想去", "不夠"], "想起來 là nhớ ra.", "Ngữ pháp"),
        question("assessment", 7, "Mã An Đồng thường ngủ lúc nào khi mới học viết chữ?", "Sau nửa đêm", ["Trước 9 giờ", "Ngay sau giờ học"], "Bài đọc ghi 常常半夜十二點多才睡覺.", "Bài đọc"),
        question("assessment", 8, "Điền: 我們＿＿台灣人的生活。", "了解了解", ["了解過了解", "了解了解一下"], "Động từ hai âm tiết lặp ABAB.", "Ngữ pháp"),
        question("assessment", 9, "Mã An Đồng đi đâu để uống trà vào cuối tuần?", "Miêu Không", ["Đài Nam", "Lục Đảo"], "Bài đọc nói 搭捷運去貓空喝茶.", "Bài đọc"),
        question("assessment", 10, "Câu nào nói 'tôi chưa từng đến Đài Nam'?", "我沒去過台南。", ["我不去過台南。", "我才去台南。"], "Phủ định trải nghiệm với 沒 + động từ + 過.", "Ngữ pháp"),
    ]
    return {
        "contentVersion": 2, "id": PREFIX, "title": "你的中文進步了！", "titleVi": "Tiếng Hoa của bạn tiến bộ rồi!",
        "description": "Nói về trải nghiệm học tiếng Hoa, thời gian học và cách luyện ngôn ngữ trong đời sống.",
        "objectives": ["Kể kinh nghiệm đã từng làm bằng 過.", "Nói điều xảy ra ít hoặc muộn hơn mong đợi bằng 才.", "Chia sẻ cách học và luyện tập tiếng Hoa trong đời sống."],
        "estimatedMinutes": None,
        "lecture": {
            "introduction": "Như Ngọc và Điền Trung trò chuyện trước giờ thi. Bài đọc theo chân Mã An Đồng học tiếng Hoa ở Sư Đại và khám phá Đài Bắc.",
            "sections": [
                {"id": f"{PREFIX}-section-01", "title": "Đã từng học", "body": "Trong hội thoại, 過 xuất hiện khi Như Ngọc kể kinh nghiệm học chữ Hán trước đây. Chú ý sự khác nhau giữa kinh nghiệm đã có và một sự việc cụ thể.", **sentence("我在美國念高中的時候就學過了。", "Hồi học cấp ba ở Mỹ, tôi đã từng học rồi.")},
                {"id": f"{PREFIX}-section-02", "title": "Mới và mãi mới", "body": "才 giúp người nói nhấn mạnh khoảng thời gian ngắn hoặc việc xảy ra muộn. Hãy xem ngữ cảnh để hiểu sắc thái.", **sentence("我才學了半年。", "Tôi mới học được nửa năm.")},
            ],
            "dialogues": [
                {"id": f"{PREFIX}-dialogue", "title": "Trước giờ thi", "context": "Như Ngọc và Điền Trung nói về việc học tiếng Hoa.", "audioTrackId": "cc2-textbook-l03-t01", "turns": [{"speaker": speaker, **sentence(text, vi)} for speaker, text, vi in DIALOGUE]},
                {"id": f"{PREFIX}-reading", "title": "Học tiếng Hoa ở Sư Đại", "context": "Mã An Đồng học trên lớp và luyện tiếng Hoa khi đi chơi cuối tuần.", "audioTrackId": "cc2-textbook-l03-t03", "turns": [{"speaker": "Bài đọc", **sentence(text, vi)} for text, vi in READING]},
            ],
            "checks": [
                question("check", 1, "Như Ngọc đã học chữ Hán từ khi nào?", "Thời học cấp ba ở Mỹ", ["Từ lúc học tiểu học ở Nhật", "Mới bắt đầu hôm nay"], "Cô nói 在美國念高中的時候就學過了.", "Hội thoại"),
                question("check", 2, "Vì sao Mã An Đồng tập viết mỗi ngày?", "Lúc đầu anh thấy viết chữ rất khó", ["Anh muốn làm báo", "Lớp học bắt buộc đi leo núi"], "Bài đọc nói 剛開始學寫中國字，覺得真難，所以每天都練習寫字.", "Bài đọc"),
            ],
            "pronunciation": [], "culture": [],
        },
        "vocabulary": {"introduction": "Chạm vào từ để xem phiên âm, nghĩa và ví dụ.", "wordIds": [record["id"] for record in vocabulary["records"]], "audioTracks": [{"id": "cc2-textbook-l03-t02", "label": "Từ vựng hội thoại"}, {"id": "cc2-textbook-l03-t04", "label": "Từ vựng bài đọc"}]},
        "grammar": grammar,
        "listening": [
            question("listening", 1, "Nghe hội thoại. Như Ngọc đến lớp bằng gì?", "MRT", ["Xe buýt", "Taxi"], "Cô nói 我今天是搭捷運來的.", "Nghe chi tiết", audioTrackId="cc2-textbook-l03-t01"),
            question("listening", 2, "Nghe hội thoại. Ai đã học tiếng Hoa gần một năm?", "Điền Trung", ["Như Ngọc", "Mã An Đồng"], "Điền Trung nói 我來了快一年了.", "Nghe thời gian", audioTrackId="cc2-textbook-l03-t01"),
            question("listening", 3, "Nghe bài đọc. Mã An Đồng làm gì sau giờ học?", "Làm bài tập và chuẩn bị bài hôm sau", ["Đi leo núi ngay", "Về nước"], "Bài đọc nói 下了課要寫作業，還要準備第二天的課.", "Nghe trình tự", audioTrackId="cc2-textbook-l03-t03"),
            question("listening", 4, "Nghe bài đọc. Mã An Đồng dùng gì để khám phá thành phố cùng bạn?", "Bản đồ và MRT", ["Xe đạp", "Máy bay"], "Bài đọc nói 拿著地圖搭捷運去逛逛.", "Nghe ý chính", audioTrackId="cc2-textbook-l03-t03"),
        ],
        "practice": practice, "assessment": assessment,
        "writingTask": {"id": f"{PREFIX}-writing", "title": "Chuyện học tiếng Hoa", "prompt": "Viết 2–3 câu kể bạn đã từng học gì, học được bao lâu và muốn luyện thêm điều gì. Thử dùng 過 hoặc 才.", "sampleTraditional": "我學過中文，可是才學了半年。我想多練習練習說話。", "sampleSimplified": "我学过中文，可是才学了半年。我想多练习练习说话。"},
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
    (ROOT / "data/academy/cc2-lesson03.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-reviewed-content.json"
    reviewed = json.loads(path.read_text())
    reviewed.update({
        "cc2-textbook-l03-t01": {"transcriptTraditional": "\n".join(f"{who}：{text}" for who, text, _ in DIALOGUE), "transcriptSimplified": "\n".join(f"{who}：{CONVERT.convert(text)}" for who, text, _ in DIALOGUE), "translationVi": "\n".join(f"{who}：{vi}" for who, _, vi in DIALOGUE)},
        "cc2-textbook-l03-t03": {"transcriptTraditional": "\n\n".join(text for text, _ in READING), "transcriptSimplified": "\n\n".join(CONVERT.convert(text) for text, _ in READING), "translationVi": "\n\n".join(vi for _, vi in READING)},
    })
    path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-script-map.json"
    script_map = json.loads(path.read_text())
    script_map.update({char: CONVERT.convert(char) for char in set("".join(strings(lesson))) if CONVERT.convert(char) != char})
    path.write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(DIALOGUE)} turns, {len(READING)} paragraphs, {len(lesson['vocabulary']['wordIds'])} words, {len(lesson['grammar'])} grammar points")


if __name__ == "__main__":
    main()
