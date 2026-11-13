"""Build reviewed Volume 2 Lesson 05 from textbook PDF pages 133–147."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin

ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")
PREFIX = "cc2-v2-l05"


def simplified(value: str) -> str:
    return CONVERT.convert(value).replace("穿著", "穿着")


def sentence(chinese: str, meaning: str) -> dict:
    return {"chinese": chinese, "simplified": simplified(chinese),
            "pinyin": " ".join(lazy_pinyin(chinese, style=Style.TONE, errors=lambda value: list(value))),
            "meaningVi": meaning}


def question(group: str, number: int, prompt: str, correct: str, wrong: list[str], feedback: str, skill: str, **extra) -> dict:
    choices = [correct, *wrong]
    offset = int(hashlib.sha256(f"{PREFIX}-{group}-{number}".encode()).hexdigest()[:8], 16) % len(choices)
    choices = choices[offset:] + choices[:offset]
    return {"id": f"{PREFIX}-{group}-{number:02d}", "prompt": prompt,
            "options": [{"id": "abcd"[index], "text": value} for index, value in enumerate(choices)],
            "correctOptionId": "abcd"[choices.index(correct)], "feedback": feedback, "skill": skill, **extra}


# Checked against visible Traditional textbook dialogue pages 106–107 (PDF 133–134).
DIALOGUE = [
    ("明華", "安同，你們來了。", "An Đồng, các bạn đến rồi."),
    ("安同", "恭喜！恭喜！明華，這是我常跟你說的高美玲。美玲，他就是新娘的哥哥，李明華。", "Chúc mừng, Minh Hoa! Đây là Cao Mỹ Linh mà mình thường kể với cậu. Mỹ Linh, đây là anh trai cô dâu, Lý Minh Hoa."),
    ("美玲", "李先生，恭喜你們！謝謝你請我們來參加你妹妹的婚禮。", "Anh Lý, xin chúc mừng gia đình! Cảm ơn anh đã mời chúng tôi dự đám cưới em gái anh."),
    ("明華", "你太客氣了。安同，你今天穿西裝真好看。", "Cô khách sáo quá. An Đồng, hôm nay cậu mặc vest trông đẹp thật."),
    ("安同", "謝謝，參加婚禮應該要穿得很正式。", "Cảm ơn. Dự đám cưới thì nên ăn mặc trang trọng."),
    ("美玲", "客人怎麼都還沒到？", "Sao khách vẫn chưa đến vậy?"),
    ("明華", "現在才六點，婚禮六點半開始，時間還早。", "Bây giờ mới sáu giờ; lễ cưới bắt đầu lúc sáu giờ rưỡi, vẫn còn sớm."),
    ("安同", "明華，手裡拿著照相機的那個人是誰？", "Minh Hoa, người cầm máy ảnh kia là ai?"),
    ("明華", "他是新郎的弟弟。", "Cậu ấy là em trai chú rể."),
    ("安同", "新郎呢？", "Thế chú rể đâu?"),
    ("明華", "他在門口站著跟客人說話。", "Anh ấy đang đứng ở cửa nói chuyện với khách."),
    ("安同", "哪一個？", "Người nào?"),
    ("明華", "就是穿著白西裝的那個。", "Chính là người mặc vest trắng ấy."),
    ("安同", "新郎看起來好帥。", "Chú rể trông đẹp trai thật."),
    ("美玲", "你看，那邊那位穿著紅色禮服，跟客人說話的太太是誰？", "Nhìn kìa, người phụ nữ mặc lễ phục đỏ đang nói chuyện với khách là ai?"),
    ("明華", "那是新郎的媽媽。", "Đó là mẹ chú rể."),
    ("美玲", "她看起來好高興啊！怎麼沒看見新娘呢？", "Bà ấy trông vui quá! Sao vẫn chưa thấy cô dâu?"),
    ("明華", "等一下你們就會看見她了。婚禮要開始了，我帶你們去你們的座位吧！", "Lát nữa các bạn sẽ thấy cô ấy. Lễ cưới sắp bắt đầu rồi, để mình dẫn các bạn đến chỗ ngồi nhé!"),
]


# Checked against visible Traditional textbook reading page 110 (PDF 137).
READING = [
    ("李明華請安同和美玲去參加他妹妹的婚禮，這是安同他們第一次去吃喜酒。李明華告訴他們，在台灣，要結婚的人大部分都會找一個好日子，請親戚、朋友一起吃飯，熱熱鬧鬧地慶祝這件喜事。", "Lý Minh Hoa mời An Đồng và Mỹ Linh dự đám cưới em gái mình. Đây là lần đầu họ dự tiệc cưới. Minh Hoa kể rằng ở Đài Loan, phần lớn các cặp đôi chọn ngày đẹp rồi mời họ hàng, bạn bè cùng ăn uống, tổ chức vui vẻ để mừng chuyện hỷ."),
    ("請客的那天，新郎、新娘，還有來吃喜酒的客人都穿得漂漂亮亮的。來參加的客人都會準備一個紅包送新人。等客人都到了，喜宴就開始了。大家吃了一會兒，有的人忙著到處敬酒，有的人忙著跟朋友聊天，大人有說有笑，小孩有吃有喝，熱鬧得不得了。大家吃著吃著，新郎、新娘和他們的父母就來敬酒了。客人也會祝新人百年好合、早生貴子。", "Trong ngày đãi tiệc, cô dâu, chú rể và khách đều ăn mặc đẹp. Khách chuẩn bị phong bì tiền mừng tặng đôi vợ chồng mới cưới. Khi mọi người đến đủ, tiệc bắt đầu. Ăn được một lúc, có người đi mời rượu, có người trò chuyện cùng bạn; người lớn cười nói, trẻ con ăn uống, không khí rất náo nhiệt. Đang ăn thì cô dâu, chú rể cùng cha mẹ đến nâng ly. Khách chúc họ trăm năm hạnh phúc, sớm có con."),
    ("等喜酒吃得差不多了，新娘會換另外一件漂亮的禮服，跟新郎拿著糖在門口送客人離開。這個時候很多人會跟新人一起照相，再多說幾句祝福的話。等客人都回去了，喜宴就結束了。", "Khi tiệc gần tàn, cô dâu thay bộ lễ phục đẹp khác rồi cùng chú rể cầm kẹo đứng ở cửa tiễn khách. Lúc ấy nhiều người chụp ảnh chung với đôi vợ chồng mới cưới và chúc thêm vài lời. Khi khách đã về hết, tiệc cưới kết thúc."),
]


GRAMMAR = [
    ("還 — vẫn; còn", "還 đứng trước tính từ, động từ hoặc từ phủ định để nói trạng thái chưa thay đổi: 時間還早 là vẫn còn sớm, 客人還沒到 là khách vẫn chưa tới. Trong ngữ cảnh khác, 還 cũng có nghĩa 'còn thêm'; hãy dựa vào điều đang nói để phân biệt.", "Chủ ngữ + 還 + trạng thái / 還 + 沒 + động từ", ("時間還早。", "Vẫn còn sớm."), ("客人還沒到。", "Khách vẫn chưa tới."), "Đừng dùng 還 để thay 已經: 還沒到 là chưa tới, 已經到了 là đã tới.", "客人＿＿沒到。", "還", ["已經", "才"]),
    ("V 著 + hành động — vừa giữ trạng thái, vừa làm", "Đặt 著 sau hành động hoặc trạng thái được duy trì trong khi làm hành động chính: 站著說話 là đứng nói chuyện, 拿著照相機 là cầm máy ảnh. V-著 mô tả cách hành động chính diễn ra, không chỉ đơn giản kể hai việc đồng thời như 一邊…一邊… .", "Động từ 1 + 著 + động từ 2", ("他在門口站著跟客人說話。", "Anh ấy đứng ở cửa nói chuyện với khách."), ("他手裡拿著照相機。", "Anh ấy cầm máy ảnh trong tay."), "Không thêm 了 sau 著 khi muốn diễn tả tư thế đang được duy trì trong câu này.", "他在門口站＿＿說話。", "著", ["了", "過"]),
    ("Nhiều cụm động từ trong một câu", "Khi một người làm nhiều việc liên tiếp, đặt các cụm động từ theo trình tự sự việc. 我帶你們去座位 nghĩa là tôi dẫn các bạn đến chỗ ngồi; đổi thứ tự có thể làm đổi trọng tâm hoặc ý nghĩa. Từ phủ định thường đặt trước động từ đầu tiên.", "Chủ ngữ + động từ 1 + tân ngữ + động từ 2 + nơi chốn / mục đích", ("我帶你們去你們的座位吧！", "Để tôi dẫn các bạn đến chỗ ngồi nhé!"), ("我跟弟弟去機場接朋友。", "Tôi cùng em trai ra sân bay đón bạn."), "Đừng tùy tiện đảo vị trí các động từ vì câu có thể đổi nghĩa.", "我＿＿你們去座位。", "帶", ["還", "等"]),
    ("等…就… — đợi đến khi… thì…", "Dùng 等 để đặt mốc sự việc A, sau đó 就 nêu sự việc B sẽ diễn ra ngay khi A hoàn tất. Trong bài, khi khách về hết thì tiệc kết thúc. Có thể đặt từ phủ định ở vế phù hợp với nghĩa muốn nói.", "等 + sự việc A，+ chủ ngữ + 就 + sự việc B", ("等客人都回去了，喜宴就結束了。", "Khi khách về hết, tiệc cưới liền kết thúc."), ("等婚禮開始了，我們就去拍照。", "Khi lễ cưới bắt đầu, chúng ta sẽ đi chụp ảnh."), "Không hiểu 等 là 'đợi' một mình rồi bỏ vế 就 khi câu muốn nêu kết quả tiếp theo.", "等客人都到了，喜宴＿＿開始。", "就", ["還", "過"]),
    ("V 著 V 著，就…了 — đang… thì…", "Lặp động từ kèm 著 để nhấn mạnh một hành động đang tiếp diễn thì có việc khác xảy ra: 吃著吃著，就來敬酒了. Nếu động từ có tân ngữ, thường đưa tân ngữ lên trước hoặc lược bỏ khi đã rõ từ ngữ cảnh.", "(Tân ngữ) + động từ + 著 + động từ + 著，+ 就 + sự việc mới + 了", ("大家吃著吃著，新郎、新娘就來敬酒了。", "Mọi người đang ăn thì cô dâu chú rể đến mời rượu."), ("我們等著等著，喜宴就開始了。", "Chúng tôi đang đợi thì tiệc cưới bắt đầu."), "Đừng đặt tân ngữ sau mỗi lần lặp động từ; hãy nói 吃著吃著, không phải 吃飯著吃飯著.", "大家吃著吃著，新郎新娘＿＿來敬酒了。", "就", ["還", "才"]),
]


def build() -> dict:
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson05-vocabulary.json").read_text())
    grammar = []
    for index, (title, explanation, pattern, first, second, mistake, blank, correct, wrong) in enumerate(GRAMMAR, 1):
        grammar.append({"id": f"{PREFIX}-grammar-{index:02d}", "title": title,
                        "audioTrackId": f"cc2-textbook-l05-t{index + 4:02d}", "explanation": explanation,
                        "structure": pattern, "examples": [sentence(*first), sentence(*second)],
                        "commonMistake": mistake,
                        "check": question("grammar-check", index, f"Điền vào câu: {blank}", correct, wrong, explanation.split(".")[0] + ".", title)})
    practice = [
        question("practice", 1, "‘喜酒’ là gì?", "tiệc cưới", ["buổi phỏng vấn", "lớp học"], "喜酒 là tiệc cưới.", "Từ vựng"),
        question("practice", 2, "Điền: 客人＿＿沒到。", "還", ["已經", "過"], "還沒到 nghĩa là vẫn chưa tới.", "Ngữ pháp"),
        question("practice", 3, "Minh Hoa là ai của cô dâu?", "Anh trai", ["Chú rể", "Em trai"], "An Đồng giới thiệu 他就是新娘的哥哥.", "Hội thoại"),
        question("practice", 4, "Điền: 他站＿＿跟客人說話。", "著", ["過", "了"], "站著 mô tả tư thế được duy trì khi nói chuyện.", "Ngữ pháp"),
        question("practice", 5, "Khách thường chuẩn bị gì cho đôi vợ chồng mới cưới?", "Phong bì tiền mừng", ["Bản đồ", "Sách giáo khoa"], "Bài đọc ghi 準備一個紅包送新人.", "Bài đọc"),
        question("practice", 6, "Điền: 等客人都到了，喜宴＿＿開始。", "就", ["還", "過"], "等…就… diễn tả việc tiếp theo sau mốc chờ.", "Ngữ pháp"),
        question("practice", 7, "Chú rể mặc gì?", "Vest trắng", ["Lễ phục đỏ", "Áo khoác đen"], "Minh Hoa nói 穿著白西裝的那個.", "Hội thoại"),
        question("practice", 8, "Điền: 大家吃著吃著，新人＿＿來敬酒了。", "就", ["還", "過"], "V著V著，就…了 nói việc mới xảy ra lúc đang làm việc khác.", "Ngữ pháp"),
    ]
    assessment = [
        question("assessment", 1, "‘新娘’ là ai?", "cô dâu", ["chú rể", "khách mời"], "新娘 là cô dâu.", "Từ vựng"),
        question("assessment", 2, "Lễ cưới bắt đầu lúc mấy giờ?", "Sáu giờ rưỡi", ["Sáu giờ", "Bảy giờ"], "Minh Hoa nói 婚禮六點半開始.", "Hội thoại"),
        question("assessment", 3, "Điền: 時間＿＿早。", "還", ["已經", "過"], "還早 nghĩa là vẫn còn sớm.", "Ngữ pháp"),
        question("assessment", 4, "Người cầm máy ảnh là ai?", "Em trai chú rể", ["Anh trai cô dâu", "Cha cô dâu"], "Minh Hoa nói 他是新郎的弟弟.", "Hội thoại"),
        question("assessment", 5, "Điền: 他拿＿＿照相機。", "著", ["了", "過"], "拿著 diễn tả việc đang cầm.", "Ngữ pháp"),
        question("assessment", 6, "Khách chúc đôi vợ chồng mới cưới điều gì?", "Trăm năm hạnh phúc, sớm có con", ["Thi đỗ TOCFL", "Tìm được việc làm"], "Bài đọc ghi 百年好合、早生貴子.", "Bài đọc"),
        question("assessment", 7, "Điền: 等客人回去了，喜宴＿＿結束。", "就", ["還", "才"], "等…就… nêu kết quả sau khi khách về.", "Ngữ pháp"),
        question("assessment", 8, "Sau khi tiệc gần tàn, cô dâu làm gì?", "Thay lễ phục và tiễn khách", ["Đi học tiếng Hoa", "Bắt đầu nghi lễ"], "Bài đọc ghi 新娘會換另外一件漂亮的禮服…送客人離開.", "Bài đọc"),
        question("assessment", 9, "Điền: 大家等著等著，喜宴＿＿開始了。", "就", ["還", "過"], "Sự việc bắt đầu trong lúc mọi người đang đợi.", "Ngữ pháp"),
        question("assessment", 10, "‘紅包’ trong đám cưới là gì?", "phong bì tiền mừng", ["lễ phục đỏ", "thiệp chúc mừng"], "Khách chuẩn bị 紅包 để tặng đôi vợ chồng mới cưới.", "Từ vựng"),
    ]
    return {"contentVersion": 2, "id": PREFIX, "title": "吃喜酒", "titleVi": "Đi dự tiệc cưới",
            "description": "Giới thiệu người quen, quan sát lễ cưới và tìm hiểu cách mừng đám cưới ở Đài Loan.",
            "objectives": ["Giới thiệu người quen và chúc mừng đôi vợ chồng mới cưới.", "Mô tả trang phục và hoạt động trong tiệc cưới.", "Dùng 還, 著 và 等…就… để kể sự việc theo thời gian."],
            "estimatedMinutes": None,
            "lecture": {"introduction": "An Đồng và Mỹ Linh lần đầu dự tiệc cưới ở Đài Loan. Hãy nghe cách họ chào hỏi và nhận ra những người trong buổi lễ.",
                        "sections": [
                            {"id": f"{PREFIX}-section-01", "title": "Nhận ra người trong đám cưới", "body": "Để chỉ rõ một người giữa đám đông, lời thoại dùng đặc điểm trang phục và vị trí của họ.", **sentence("就是穿著白西裝的那個。", "Chính là người mặc vest trắng ấy.")},
                            {"id": f"{PREFIX}-section-02", "title": "Mốc thời gian của buổi lễ", "body": "Từ 等 đặt mốc khách đến đủ; 就 nêu việc tiệc bắt đầu ngay sau đó.", **sentence("等客人都到了，喜宴就開始了。", "Khi khách đến đủ, tiệc cưới bắt đầu.")},
                        ],
                        "dialogues": [
                            {"id": f"{PREFIX}-dialogue", "title": "Gặp nhau tại tiệc cưới", "context": "Minh Hoa đón An Đồng và Mỹ Linh, giới thiệu người thân trong buổi lễ.", "audioTrackId": "cc2-textbook-l05-t01", "turns": [{"speaker": speaker, **sentence(text, vi)} for speaker, text, vi in DIALOGUE]},
                            {"id": f"{PREFIX}-reading", "title": "Một tiệc cưới ở Đài Loan", "context": "Bài đọc kể trình tự và những lời chúc trong tiệc cưới.", "audioTrackId": "cc2-textbook-l05-t03", "turns": [{"speaker": "Bài đọc", **sentence(text, vi)} for text, vi in READING]},
                        ],
                        "checks": [
                            question("check", 1, "Người mặc vest trắng là ai?", "Chú rể", ["Em trai chú rể", "Anh trai cô dâu"], "Minh Hoa nói 就是穿著白西裝的那個 về chú rể.", "Hội thoại"),
                            question("check", 2, "Khi nào tiệc cưới bắt đầu?", "Khi khách đến đủ", ["Khi cô dâu thay đồ", "Ngay lúc An Đồng đến"], "Bài đọc ghi 等客人都到了，喜宴就開始了.", "Bài đọc"),
                        ], "pronunciation": [], "culture": []},
            "vocabulary": {"introduction": "Chạm vào từ để xem phiên âm, nghĩa và ví dụ.", "wordIds": [record["id"] for record in vocabulary["records"]], "audioTracks": [{"id": "cc2-textbook-l05-t02", "label": "Từ vựng hội thoại"}, {"id": "cc2-textbook-l05-t04", "label": "Từ vựng bài đọc"}]},
            "grammar": grammar,
            "listening": [
                question("listening", 1, "Nghe hội thoại. Lễ cưới bắt đầu lúc nào?", "Sáu giờ rưỡi", ["Sáu giờ", "Bảy giờ"], "Minh Hoa nói 婚禮六點半開始.", "Nghe thời gian", audioTrackId="cc2-textbook-l05-t01"),
                question("listening", 2, "Nghe hội thoại. Ai là người cầm máy ảnh?", "Em trai chú rể", ["Cha chú rể", "Anh trai cô dâu"], "Minh Hoa nói 他是新郎的弟弟.", "Nghe chi tiết", audioTrackId="cc2-textbook-l05-t01"),
                question("listening", 3, "Nghe bài đọc. Khách chuẩn bị gì tặng đôi vợ chồng mới cưới?", "Phong bì tiền mừng", ["Máy ảnh", "Bộ vest"], "Bài đọc nói 準備一個紅包送新人.", "Nghe chi tiết", audioTrackId="cc2-textbook-l05-t03"),
                question("listening", 4, "Nghe bài đọc. Khi nào tiệc cưới kết thúc?", "Sau khi khách ra về", ["Khi mới bắt đầu ăn", "Khi mọi người chụp ảnh"], "Bài đọc nói 等客人都回去了，喜宴就結束了.", "Nghe trình tự", audioTrackId="cc2-textbook-l05-t03"),
            ], "practice": practice, "assessment": assessment,
            "writingTask": {"id": f"{PREFIX}-writing", "title": "Mời bạn dự lễ cưới", "prompt": "Viết 2–3 câu chúc mừng và kể bạn nhìn thấy ai trong buổi lễ. Thử dùng 還 hoặc 著.", "sampleTraditional": "恭喜你們！新郎穿著白西裝，新娘看起來很高興。客人還沒到齊。", "sampleSimplified": "恭喜你们！新郎穿着白西装，新娘看起来很高兴。客人还没到齐。"}}


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
    (ROOT / "data/academy/cc2-lesson05.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-reviewed-content.json"
    reviewed = json.loads(path.read_text())
    reviewed.update({
        "cc2-textbook-l05-t01": {"transcriptTraditional": "\n".join(f"{who}：{text}" for who, text, _ in DIALOGUE), "transcriptSimplified": "\n".join(f"{simplified(who)}：{simplified(text)}" for who, text, _ in DIALOGUE), "translationVi": "\n".join(f"{who}：{vi}" for who, _, vi in DIALOGUE)},
        "cc2-textbook-l05-t03": {"transcriptTraditional": "\n\n".join(text for text, _ in READING), "transcriptSimplified": "\n\n".join(simplified(text) for text, _ in READING), "translationVi": "\n\n".join(vi for _, vi in READING)},
    })
    path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-script-map.json"
    script_map = json.loads(path.read_text())
    script_map.update({char: CONVERT.convert(char) for char in set("".join(strings(lesson))) if CONVERT.convert(char) != char})
    path.write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(DIALOGUE)} turns, {len(READING)} paragraphs, {len(lesson['vocabulary']['wordIds'])} words, {len(lesson['grammar'])} grammar points")


if __name__ == "__main__":
    main()
