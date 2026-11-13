"""Build reviewed Volume 2 Lesson 06 from textbook PDF pages 159–174."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin

ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")
PREFIX = "cc2-v2-l06"


def sentence(chinese: str, meaning: str) -> dict:
    return {"chinese": chinese, "simplified": CONVERT.convert(chinese),
            "pinyin": " ".join(lazy_pinyin(chinese, style=Style.TONE, errors=lambda value: list(value))),
            "meaningVi": meaning}


def question(group: str, number: int, prompt: str, correct: str, wrong: list[str], feedback: str, skill: str, **extra) -> dict:
    choices = [correct, *wrong]
    offset = int(hashlib.sha256(f"{PREFIX}-{group}-{number}".encode()).hexdigest()[:8], 16) % len(choices)
    choices = choices[offset:] + choices[:offset]
    return {"id": f"{PREFIX}-{group}-{number:02d}", "prompt": prompt,
            "options": [{"id": "abcd"[index], "text": value} for index, value in enumerate(choices)],
            "correctOptionId": "abcd"[choices.index(correct)], "feedback": feedback, "skill": skill, **extra}


# Checked against visible Traditional textbook dialogue pages 132–133 (PDF 159–160).
DIALOGUE = [
    ("美玲", "你在做什麼？要不要到河邊的公園去騎騎腳踏車？", "Bạn đang làm gì vậy? Có muốn đến công viên ven sông đạp xe một chút không?"),
    ("東健", "我正在網站上找租房子的資料。", "Mình đang tìm thông tin thuê nhà trên mạng."),
    ("美玲", "我聽說你打算搬家？", "Mình nghe nói bạn định chuyển nhà?"),
    ("東健", "是啊，我想搬到離學校近一點的地方。", "Ừ, mình muốn chuyển đến nơi gần trường hơn."),
    ("美玲", "可是我記得你三個月以前才搬到這裡的。", "Nhưng mình nhớ bạn mới chuyển đến đây ba tháng trước mà."),
    ("東健", "對，我的合約還沒到期。還好我有一個同學喜歡這個環境，他可以搬到這裡來住。", "Đúng, hợp đồng của mình chưa hết hạn. May là có bạn cùng lớp thích chỗ này, cậu ấy có thể chuyển đến ở."),
    ("美玲", "你想找什麼樣的房子？", "Bạn muốn tìm nhà như thế nào?"),
    ("東健", "我先找捷運站附近的房子。還有，環境好、光線好也很重要。", "Trước tiên mình tìm nhà gần ga MRT. Môi trường tốt và đủ ánh sáng cũng rất quan trọng."),
    ("美玲", "捷運站附近的房子比較貴吧？", "Nhà gần ga MRT đắt hơn nhỉ?"),
    ("東健", "如果太貴，我再找別的地方。捷運站那麼多，我想應該有合適的。", "Nếu đắt quá mình sẽ tìm chỗ khác. Có nhiều ga MRT như vậy, chắc sẽ có nơi phù hợp."),
    ("美玲", "如果你搬家了，我就少了一個朋友跟我練習中文。好可惜！", "Nếu bạn chuyển đi, mình sẽ mất một người bạn cùng luyện tiếng Hoa. Tiếc quá!"),
    ("東健", "我會常來啊。我不會把東西都搬到新家，有一些東西，我會送給朋友或是先放在這裡。", "Mình sẽ thường ghé mà. Mình không chuyển hết đồ sang nhà mới; vài món mình sẽ tặng bạn hoặc để lại đây trước."),
    ("美玲", "那麼，你要付兩邊的房租啊？", "Vậy bạn phải trả tiền thuê cả hai chỗ à?"),
    ("東健", "這裡的房租當然是我同學付，他還願意開車幫我搬家。", "Tiền thuê ở đây tất nhiên bạn cùng lớp sẽ trả. Cậu ấy còn sẵn lòng lái xe giúp mình chuyển nhà."),
    ("美玲", "你同學真好！", "Bạn cùng lớp của bạn tốt thật!"),
    ("東健", "是啊！他是我在台灣最好的朋友。妳再等我一下，我把資料存在隨身碟裡。", "Ừ! Cậu ấy là bạn thân nhất của mình ở Đài Loan. Đợi mình một chút nữa, mình lưu tài liệu vào USB đã."),
    ("美玲", "慢慢來，不急！等一會兒我們再去騎腳踏車。", "Cứ thong thả, không vội! Lát nữa mình đi đạp xe."),
]


# Checked against visible Traditional textbook reading pages 136–137 (PDF 163–164).
READING = [
    ("李東健租的房子離師大相當遠，每天騎自行車到學校都得花一個小時左右，他覺得很不方便，所以他最近計畫找房子搬家。這一天，他在網站上看了很多租房子的資料。", "Nhà Đông Kiện thuê khá xa Sư Đại. Ngày nào anh cũng mất khoảng một tiếng đạp xe đến trường, rất bất tiện. Vì vậy gần đây anh dự định tìm nhà để chuyển. Hôm ấy anh xem nhiều thông tin cho thuê nhà trên mạng."),
    ("李東健最想在捷運站附近租一間套房，有床、桌子和椅子這些家具，而且房間的光線要好，環境也不要太吵。可是台灣朋友都說，這種套房房租會比較貴，李東健覺得台北的生活費比首爾低，如果多花一點時間找，一定能找到便宜而且合適的。", "Đông Kiện muốn nhất là thuê một phòng khép kín gần ga MRT, có giường, bàn, ghế, đủ sáng và không quá ồn. Bạn bè Đài Loan đều nói phòng như vậy sẽ đắt hơn. Nhưng anh thấy chi phí sinh hoạt ở Đài Bắc thấp hơn Seoul; nếu chịu khó tìm thêm, chắc sẽ tìm được chỗ vừa rẻ vừa phù hợp."),
    ("李東健想，如果他搬到學校附近住，除了留在圖書館的時間能長一點，可以念書、寫作業、跟同學討論功課，還可以參加一些學校的社團活動。不過他的好朋友高美玲有一點失望，她覺得少了一個可以練習中文的朋友。李東健要高美玲放心，因為他打算把一些不常用的東西先留在這裡，所以還會常來找他們聊天。", "Đông Kiện nghĩ rằng nếu sống gần trường, anh có thể ở thư viện lâu hơn để học, làm bài và trao đổi với bạn; còn có thể tham gia câu lạc bộ. Mỹ Linh hơi thất vọng vì sẽ bớt một người bạn luyện tiếng Hoa. Đông Kiện bảo cô yên tâm: anh định để lại đây vài món ít dùng nên vẫn sẽ thường ghé trò chuyện."),
]


GRAMMAR = [
    ("到 — chỉ nơi đến của chuyển động", "Đặt 到 sau động từ chỉ di chuyển để nêu đích đến: 搬到學校附近 là chuyển đến gần trường. Cả hành động và đích đến tạo thành một ý; nếu phủ định, đặt 沒 hoặc 不 trước động từ chính. Phân biệt 到 (đến nơi) với 在 (vị trí sau khi đặt một vật).", "Chủ ngữ + động từ di chuyển + 到 + nơi chốn", ("我想搬到離學校近一點的地方。", "Tôi muốn chuyển đến nơi gần trường hơn."), ("他每天騎自行車到學校。", "Ngày nào anh ấy cũng đạp xe đến trường."), "Không nói 搬在學校附近 khi muốn nhấn đích đến của hành động chuyển nhà; dùng 搬到.", "我想搬＿＿學校附近。", "到", ["在", "給"]),
    ("給 — người nhận sau động từ", "Với các động từ có hai tân ngữ như 送, 付, 賣, đặt 給 trước người nhận: 送給朋友一些東西. Người nhận đứng sau 給, còn vật được chuyển giao đứng tiếp sau. Trong hội thoại, Đông Kiện sẽ tặng một số đồ cho bạn.", "Động từ + 給 + người nhận + đồ vật", ("我會送給朋友一些東西。", "Tôi sẽ tặng bạn vài món đồ."), ("他付給房東三個月的房租。", "Anh ấy trả cho chủ nhà ba tháng tiền thuê."), "Đừng đổi chỗ người nhận và đồ vật sau 給 trong mẫu cơ bản này.", "我會送＿＿朋友一些東西。", "給", ["在", "到"]),
    ("V 在 — nơi vật được đặt lại", "V + 在 nêu vị trí của một vật sau hành động đặt, giữ hoặc lưu. 放在這裡 là để ở đây; 存在隨身碟裡 là lưu trong USB. Nơi chốn sau 在 là kết quả của hành động, không nhất thiết là nơi người nói đang đứng.", "Động từ đặt / lưu + 在 + vị trí", ("有一些東西，我會先放在這裡。", "Một số đồ tôi sẽ để lại ở đây trước."), ("我把資料存在隨身碟裡。", "Tôi lưu tài liệu vào USB."), "Không dùng 到 trong 放在桌子上 nếu ý là vị trí cuối cùng sau khi đặt; dùng 在.", "我把資料存＿＿隨身碟裡。", "在", ["到", "給"]),
    ("把…V 到 / 在 / 給… — chuyển đồ đến nơi hoặc người", "Dùng 把 khi nêu rõ một vật đã biết rồi nói mình xử lý vật đó ra sao. Động từ phía sau phải có kết quả hoặc đích: 搬到新家, 放在這裡, 送給朋友. Đến một địa điểm dùng 到; vị trí đặt lại dùng 在; người nhận dùng 給.", "Chủ ngữ + 把 + đồ vật + động từ + 到 / 在 / 給 + nơi / người", ("我不會把東西都搬到新家。", "Tôi sẽ không chuyển hết đồ sang nhà mới."), ("我把資料存在隨身碟裡。", "Tôi lưu tài liệu vào USB."), "Tránh câu 把東西搬 khi thiếu đích hoặc kết quả; nói rõ 搬到哪裡.", "我＿＿資料存在隨身碟裡。", "把", ["還", "如果"]),
    ("而且 — hơn nữa; và còn", "而且 nối hai đặc điểm hoặc hai ý bổ sung. Trong bài, căn phòng cần đủ sáng và môi trường không ồn; người nói cũng muốn nhà vừa rẻ vừa phù hợp. Khi nối hai tính từ, 而且 đứng giữa chúng; khi nối hai mệnh đề, nó thường đứng đầu ý thứ hai.", "Ý A + 而且 + ý B", ("房子的環境好，而且光線也好。", "Môi trường quanh nhà tốt, lại đủ sáng."), ("一定能找到便宜而且合適的。", "Chắc chắn sẽ tìm được chỗ vừa rẻ vừa phù hợp."), "Đừng dùng 而且 để nêu hai ý đối lập; hãy dùng 但是 hoặc 可是 khi muốn nói 'nhưng'.", "這間房子便宜＿＿合適。", "而且", ["可是", "如果"]),
]


def build() -> dict:
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson06-vocabulary.json").read_text())
    grammar = []
    for index, (title, explanation, pattern, first, second, mistake, blank, correct, wrong) in enumerate(GRAMMAR, 1):
        grammar.append({"id": f"{PREFIX}-grammar-{index:02d}", "title": title,
                        "audioTrackId": f"cc2-textbook-l06-t{index + 4:02d}", "explanation": explanation,
                        "structure": pattern, "examples": [sentence(*first), sentence(*second)],
                        "commonMistake": mistake,
                        "check": question("grammar-check", index, f"Điền vào câu: {blank}", correct, wrong, explanation.split(".")[0] + ".", title)})
    practice = [
        question("practice", 1, "‘搬家’ nghĩa là gì?", "chuyển nhà", ["đi du lịch", "tìm việc"], "搬家 là chuyển nhà.", "Từ vựng"),
        question("practice", 2, "Điền: 我想搬＿＿學校附近。", "到", ["在", "給"], "到 chỉ đích đến của việc chuyển nhà.", "Ngữ pháp"),
        question("practice", 3, "Vì sao Đông Kiện muốn chuyển nhà?", "Nhà hiện tại quá xa trường", ["Hợp đồng đã hết hạn", "Bạn cùng lớp không thích nhà"], "Bài đọc ghi 離師大相當遠…覺得很不方便.", "Bài đọc"),
        question("practice", 4, "Điền: 我把資料存＿＿電腦裡。", "在", ["到", "給"], "存在哪裡 nêu chỗ dữ liệu được lưu lại.", "Ngữ pháp"),
        question("practice", 5, "Đông Kiện muốn căn phòng có điều gì?", "Đủ ánh sáng, không quá ồn", ["Không có nội thất", "Rất xa ga MRT"], "Bài đọc ghi 光線要好，環境也不要太吵.", "Bài đọc"),
        question("practice", 6, "Điền: 我會送＿＿朋友一些東西。", "給", ["在", "到"], "給 đánh dấu người nhận đồ.", "Ngữ pháp"),
        question("practice", 7, "Ai sẽ trả tiền thuê nhà cũ?", "Bạn cùng lớp của Đông Kiện", ["Mỹ Linh", "Chủ nhà"], "Anh nói 這裡的房租當然是我同學付.", "Hội thoại"),
        question("practice", 8, "Điền: 房子便宜＿＿合適。", "而且", ["可是", "如果"], "而且 nối hai đặc điểm cùng chiều.", "Ngữ pháp"),
    ]
    assessment = [
        question("assessment", 1, "‘隨身碟’ là gì?", "USB; ổ nhớ di động", ["hợp đồng thuê", "vé MRT"], "隨身碟 là USB.", "Từ vựng"),
        question("assessment", 2, "Đông Kiện đang tìm thông tin ở đâu?", "Trên trang web", ["Trong thư viện", "Ở ga MRT"], "Anh nói 正在網站上找租房子的資料.", "Hội thoại"),
        question("assessment", 3, "Điền: 我把椅子放＿＿房間裡。", "在", ["到", "給"], "放在 nêu vị trí sau khi đặt.", "Ngữ pháp"),
        question("assessment", 4, "Hợp đồng hiện tại của Đông Kiện đã hết hạn chưa?", "Chưa", ["Rồi", "Không có hợp đồng"], "Anh nói 我的合約還沒到期.", "Hội thoại"),
        question("assessment", 5, "Điền: 我想把書拿＿＿學校。", "到", ["在", "給"], "拿到 nêu đích đến của việc mang sách.", "Ngữ pháp"),
        question("assessment", 6, "Đông Kiện mất bao lâu đạp xe đến trường mỗi ngày?", "Khoảng một giờ", ["Mười phút", "Ba giờ"], "Bài đọc ghi 花一個小時左右.", "Bài đọc"),
        question("assessment", 7, "Điền: 他送＿＿朋友一本書。", "給", ["在", "到"], "送給 đánh dấu người nhận.", "Ngữ pháp"),
        question("assessment", 8, "Vì sao Mỹ Linh hơi thất vọng?", "Sẽ bớt một người bạn luyện tiếng Hoa", ["Cô phải trả thêm tiền thuê", "Cô không thích đạp xe"], "Cô nói 少了一個朋友跟我練習中文.", "Hội thoại"),
        question("assessment", 9, "Điền: 這間房子便宜＿＿離學校近。", "而且", ["可是", "如果"], "而且 nêu thêm ưu điểm.", "Ngữ pháp"),
        question("assessment", 10, "Đông Kiện muốn tham gia gì nếu chuyển gần trường?", "Hoạt động câu lạc bộ", ["Buổi phỏng vấn", "Tiệc cưới"], "Bài đọc ghi 可以參加一些學校的社團活動.", "Bài đọc"),
    ]
    return {"contentVersion": 2, "id": PREFIX, "title": "我打算搬到學校附近", "titleVi": "Tôi định chuyển đến gần trường",
            "description": "Tìm nhà, so sánh chỗ ở, bàn về tiền thuê và cách chuyển đồ.",
            "objectives": ["Nói về chỗ ở mong muốn và điều kiện thuê nhà.", "Diễn đạt ý định chuyển đồ đến nơi khác hoặc đưa cho người khác.", "Dùng 到, 在, 給, 把 và 而且 để nói rõ hướng và kết quả."],
            "estimatedMinutes": None,
            "lecture": {"introduction": "Đông Kiện đang tìm nhà gần trường. Hãy theo dõi tiêu chí chọn phòng và cách anh sắp xếp đồ đạc ở nhà cũ.",
                        "sections": [
                            {"id": f"{PREFIX}-section-01", "title": "Chọn nhà gần trường", "body": "Đông Kiện muốn chuyển đến gần trường, ưu tiên nhà gần MRT và có ánh sáng tốt.", **sentence("我想搬到離學校近一點的地方。", "Tôi muốn chuyển đến nơi gần trường hơn.")},
                            {"id": f"{PREFIX}-section-02", "title": "Sắp xếp đồ khi chuyển nhà", "body": "Với 把, người nói đặt đồ vật lên trước rồi nói sẽ chuyển, để hoặc tặng món đó ở đâu, cho ai.", **sentence("我把資料存在隨身碟裡。", "Tôi lưu tài liệu vào USB.")},
                        ],
                        "dialogues": [
                            {"id": f"{PREFIX}-dialogue", "title": "Tìm nhà gần trường", "context": "Đông Kiện kể với Mỹ Linh về kế hoạch chuyển nhà.", "audioTrackId": "cc2-textbook-l06-t01", "turns": [{"speaker": speaker, **sentence(text, vi)} for speaker, text, vi in DIALOGUE]},
                            {"id": f"{PREFIX}-reading", "title": "Căn phòng phù hợp", "context": "Bài đọc nói rõ lý do chuyển nhà và các điều kiện Đông Kiện mong muốn.", "audioTrackId": "cc2-textbook-l06-t03", "turns": [{"speaker": "Bài đọc", **sentence(text, vi)} for text, vi in READING]},
                        ],
                        "checks": [
                            question("check", 1, "Đông Kiện muốn nhà ở gần nơi nào?", "Trường học và ga MRT", ["Sân bay", "Chợ đêm"], "Anh muốn 搬到離學校近一點的地方 và tìm nhà gần ga MRT.", "Hội thoại"),
                            question("check", 2, "Vì sao Mỹ Linh muốn Đông Kiện vẫn thường ghé?", "Để tiếp tục luyện tiếng Hoa cùng nhau", ["Để trả tiền thuê nhà", "Để mua xe"], "Cô tiếc vì sẽ ít đi một người bạn luyện tiếng Hoa.", "Bài đọc"),
                        ], "pronunciation": [], "culture": []},
            "vocabulary": {"introduction": "Chạm vào từ để xem phiên âm, nghĩa và ví dụ.", "wordIds": [record["id"] for record in vocabulary["records"]], "audioTracks": [{"id": "cc2-textbook-l06-t02", "label": "Từ vựng hội thoại"}, {"id": "cc2-textbook-l06-t04", "label": "Từ vựng bài đọc"}]},
            "grammar": grammar,
            "listening": [
                question("listening", 1, "Nghe hội thoại. Đông Kiện đang tìm gì trên mạng?", "Thông tin thuê nhà", ["Lịch thi", "Thông tin việc làm"], "Anh nói 正在網站上找租房子的資料.", "Nghe chi tiết", audioTrackId="cc2-textbook-l06-t01"),
                question("listening", 2, "Nghe hội thoại. Ai sẽ trả tiền thuê nhà cũ?", "Bạn cùng lớp của Đông Kiện", ["Mỹ Linh", "Chủ nhà"], "Anh nói 這裡的房租當然是我同學付.", "Nghe vai trò", audioTrackId="cc2-textbook-l06-t01"),
                question("listening", 3, "Nghe bài đọc. Đông Kiện mất bao lâu để đạp xe tới trường?", "Khoảng một giờ", ["Mười phút", "Hai giờ"], "Bài đọc nói 花一個小時左右.", "Nghe số lượng", audioTrackId="cc2-textbook-l06-t03"),
                question("listening", 4, "Nghe bài đọc. Đông Kiện mong muốn căn phòng có đặc điểm gì?", "Đủ sáng và không quá ồn", ["Ở rất xa ga MRT", "Không có bàn ghế"], "Bài đọc nói 光線要好，環境也不要太吵.", "Nghe chi tiết", audioTrackId="cc2-textbook-l06-t03"),
            ], "practice": practice, "assessment": assessment,
            "writingTask": {"id": f"{PREFIX}-writing", "title": "Căn phòng bạn muốn thuê", "prompt": "Viết 2–3 câu về chỗ ở bạn muốn tìm và nơi bạn sẽ để đồ khi chuyển nhà. Thử dùng 到, 在 hoặc 而且.", "sampleTraditional": "我想搬到學校附近。房間要便宜，而且光線要好。我把書放在桌子上。", "sampleSimplified": "我想搬到学校附近。房间要便宜，而且光线要好。我把书放在桌子上。"}}


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
    (ROOT / "data/academy/cc2-lesson06.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-reviewed-content.json"
    reviewed = json.loads(path.read_text())
    reviewed.update({
        "cc2-textbook-l06-t01": {"transcriptTraditional": "\n".join(f"{who}：{text}" for who, text, _ in DIALOGUE), "transcriptSimplified": "\n".join(f"{CONVERT.convert(who)}：{CONVERT.convert(text)}" for who, text, _ in DIALOGUE), "translationVi": "\n".join(f"{who}：{vi}" for who, _, vi in DIALOGUE)},
        "cc2-textbook-l06-t03": {"transcriptTraditional": "\n\n".join(text for text, _ in READING), "transcriptSimplified": "\n\n".join(CONVERT.convert(text) for text, _ in READING), "translationVi": "\n\n".join(vi for _, vi in READING)},
    })
    path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-script-map.json"
    script_map = json.loads(path.read_text())
    script_map.update({char: CONVERT.convert(char) for char in set("".join(strings(lesson))) if CONVERT.convert(char) != char})
    path.write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(DIALOGUE)} turns, {len(READING)} paragraphs, {len(lesson['vocabulary']['wordIds'])} words, {len(lesson['grammar'])} grammar points")


if __name__ == "__main__":
    main()
