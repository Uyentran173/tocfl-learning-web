"""Build the reviewed first lesson of Contemporary Chinese Volume 2.

The Chinese dialogue, reading, vocabulary sequence, and grammar topics were
checked against textbook PDF pages 28–41. Vietnamese teaching text and quiz
questions are Tai Wén additions. This script produces deterministic JSON.
"""

from __future__ import annotations

import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin


ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")
PREFIX = "cc2-v2-l01"


def sentence(chinese: str, meaning: str) -> dict:
    pinyin = " ".join(lazy_pinyin(chinese, style=Style.TONE, errors=lambda value: list(value)))
    pinyin = pinyin.replace("hái dé duō", "hái děi duō").replace("jué dé", "jué de")
    return {
        "chinese": chinese,
        "simplified": CONVERT.convert(chinese),
        "pinyin": pinyin,
        "meaningVi": meaning,
    }


def question(group: str, number: int, prompt: str, choices: list[str], answer: str, feedback: str, skill: str, **extra) -> dict:
    return {
        "id": f"{PREFIX}-{group}-{number:02d}",
        "prompt": prompt,
        "options": [{"id": chr(97 + index), "text": value} for index, value in enumerate(choices)],
        "correctOptionId": answer,
        "feedback": feedback,
        "skill": skill,
        **extra,
    }


dialogue = [
    ("路人", "你需要我幫忙嗎？", "Bạn có cần tôi giúp không?"),
    ("安同", "我好像迷路了。", "Hình như tôi bị lạc đường."),
    ("路人", "你要去哪裡？", "Bạn muốn đi đâu?"),
    ("安同", "請問，到師大怎麼走？", "Xin hỏi, đi đến Sư Đại bằng đường nào?"),
    ("路人", "你從這裡往前走，到了下一個路口，右轉——", "Từ đây bạn đi thẳng. Đến giao lộ kế tiếp thì rẽ phải…"),
    ("安同", "右轉就到了嗎？聽起來不遠。", "Rẽ phải là tới rồi à? Nghe có vẻ không xa."),
    ("路人", "還沒到！你右轉以後，是和平東路一段，再往前一直走，過了第二個紅綠燈，就看見師大了。", "Chưa tới đâu! Rẽ phải xong là đường Hòa Bình Đông, đoạn một. Đi thẳng tiếp, qua đèn giao thông thứ hai là thấy Sư Đại."),
    ("安同", "謝謝，我知道了。", "Cảm ơn, tôi hiểu rồi."),
    ("路人", "你的中文很好。", "Tiếng Hoa của bạn rất tốt."),
    ("安同", "謝謝，我還得多學一點。能不能再告訴我，這附近有沒有提款機？", "Cảm ơn, tôi còn phải học thêm. Bạn có thể cho tôi biết gần đây có máy ATM không?"),
    ("路人", "從這裡往和平東路走，好像沒有銀行，不過大部分的超商裡應該都有。", "Đi từ đây về phía đường Hòa Bình Đông thì hình như không có ngân hàng, nhưng phần lớn cửa hàng tiện lợi chắc đều có."),
    ("安同", "你說的「超商」是「7-11」那種便利商店嗎？", "‘超商’ mà bạn nói là cửa hàng tiện lợi kiểu 7-11 phải không?"),
    ("路人", "是的。對了，郵局也可以提錢。", "Đúng rồi. À, ở bưu điện cũng rút tiền được."),
    ("安同", "我看見了，那邊有一家便利商店。謝謝，謝謝！", "Tôi thấy rồi, đằng kia có một cửa hàng tiện lợi. Cảm ơn, cảm ơn!"),
    ("路人", "不客氣。", "Không có gì."),
]

reading = [
    ("馬安同下載了新的地圖到手機裡，他找白如玉跟他在師大附近走走，試試地圖好用不好用。他們看著地圖，從學校門口往左轉，過了和平東路就到了師大路。在師大路上，他們看見很多賣小吃的店，也有賣衣服和日用品的商店。他們經過兩個小巷子再右轉，這邊的商店比師大路的多。", "Mã An Đồng tải bản đồ mới vào điện thoại rồi rủ Bạch Như Ngọc dạo quanh Sư Đại để thử xem bản đồ có dễ dùng không. Họ vừa xem bản đồ vừa rẽ trái từ cổng trường; qua đường Hòa Bình Đông thì đến đường Sư Đại. Ở đó có nhiều quán ăn vặt, cửa hàng quần áo và đồ dùng hằng ngày. Họ đi qua hai con hẻm nhỏ rồi rẽ phải; khu này còn nhiều cửa hàng hơn đường Sư Đại."),
    ("他們逛了半天，白如玉覺得有一點餓，所以他們到一家麵店，點了兩碗牛肉麵。他們一邊吃麵，一邊看著手機裡的地圖，發現離麵店不遠的巷子裡有一家賣背包的店。馬安同正好想買一個背包，所以決定吃了麵就到這家店去看看。", "Đi dạo khá lâu, Bạch Như Ngọc thấy hơi đói nên hai người vào một quán mì, gọi hai tô mì bò. Vừa ăn vừa xem bản đồ trên điện thoại, họ phát hiện một cửa hàng bán ba lô trong hẻm, cách quán mì không xa. Mã An Đồng đúng lúc muốn mua ba lô nên quyết định ăn xong sẽ ghé xem."),
    ("最後，馬安同買了一個背包，白如玉也在附近買了兩枝筆和一本本子。馬安同和白如玉都覺得，逛師大附近的店真有意思，吃的東西和日用品也很便宜。", "Cuối cùng, Mã An Đồng mua một chiếc ba lô; Bạch Như Ngọc mua hai cây bút và một cuốn sổ ở gần đó. Cả hai đều thấy dạo các cửa hàng quanh Sư Đại rất thú vị, đồ ăn và vật dụng hằng ngày cũng rẻ."),
]

grammar_source = [
    (
        "從…往… — nói hướng đi", "從 đánh dấu điểm xuất phát; 往 giới thiệu hướng di chuyển, không nhất thiết là đích cuối. Sau 往 có thể là phương hướng như 前、左、右 hoặc một địa điểm. Khi đã rõ đang đứng ở đâu, có thể lược 從. Nói theo thứ tự: từ đâu → đi về hướng nào → làm gì.",
        "從 + nơi xuất phát + 往 + hướng / địa điểm + động từ", "你從這裡往前一直走。", "Từ đây bạn cứ đi thẳng về phía trước.", "從學校門口往左轉，就到師大路了。", "Rẽ trái từ cổng trường là đến đường Sư Đại.",
        "Đừng dùng 往 để chỉ điểm xuất phát; điểm xuất phát phải theo sau 從.",
        ["從學校門口往左走。", "往學校門口從左走。", "學校門口從往左走。"], "a", "從 + nơi bắt đầu, 往 + hướng di chuyển."
    ),
    (
        "Động từ + 起來 — cảm nhận và đánh giá", "Đặt 起來 sau một động từ cảm giác để nêu ấn tượng của người nói: 聽起來 ‘nghe có vẻ’, 看起來 ‘trông có vẻ’, 吃起來 ‘ăn thấy’. Đằng sau là nhận xét. Đây là đánh giá qua trải nghiệm, nên không đồng nghĩa với một sự thật đã được kiểm chứng.",
        "看 / 聽 / 吃 / 喝 + 起來 + nhận xét", "這道菜看起來很好吃。", "Món này trông có vẻ ngon.", "這條路聽起來不遠。", "Con đường này nghe có vẻ không xa.",
        "Phủ định nằm ở phần nhận xét: 看起來不好吃, không đặt 不 trước 起來 trong mẫu này.",
        ["這個辦法聽起來不錯。", "這個辦法聽不起來錯。", "這個辦法起來聽不錯。"], "a", "聽起來 diễn tả ấn tượng nghe được, rồi mới đến nhận xét 不錯."
    ),
    (
        "Động từ + 著 — trạng thái đang tiếp diễn", "著 đứng ngay sau động từ để cho biết hành động hay trạng thái ấy đang được duy trì. Trong bài, 看著地圖 nghĩa là mắt vẫn dõi theo bản đồ khi nhân vật di chuyển. Nó thường mô tả trạng thái nền của một hành động khác; đừng hiểu 著 là ‘đã xong’.",
        "Động từ + 著 + tân ngữ; hành động tiếp theo", "他看著地圖找路。", "Anh ấy vừa nhìn bản đồ vừa tìm đường.", "她拿著手機等朋友。", "Cô ấy cầm điện thoại trong lúc đợi bạn.",
        "Đừng dùng 著 để kể một hành động đã hoàn tất; 看了地圖 mới nhấn mạnh ‘đã xem xong’.",
        ["他看著地圖找路。", "他著看地圖找路。", "他看地圖著找路。"], "a", "著 đi ngay sau động từ 看 để biểu thị việc xem bản đồ đang tiếp diễn."
    ),
    (
        "一邊…一邊… — hai việc cùng lúc", "Dùng một cặp 一邊 để nối hai hành động xảy ra đồng thời, thường do cùng một người thực hiện. Mỗi 一邊 phải đi với một cụm động từ. Cách nói này hợp với những việc có thể thực hiện song song, như ăn và xem bản đồ.",
        "Chủ ngữ + 一邊 + việc 1，一邊 + việc 2", "我們一邊吃麵，一邊看地圖。", "Chúng tôi vừa ăn mì vừa xem bản đồ.", "她一邊走路，一邊聽歌。", "Cô ấy vừa đi bộ vừa nghe nhạc.",
        "Không dùng mẫu này cho hai việc diễn ra lần lượt: ăn xong rồi mới đi không phải 一邊吃一邊走.",
        ["她一邊吃飯，一邊看電視。", "她一邊吃飯，再一邊看電視。", "她吃飯一邊，看電視一邊。"], "a", "Hai cụm 一邊 nối hai hành động diễn ra cùng lúc."
    ),
    (
        "離 — diễn đạt khoảng cách", "離 nối một địa điểm với một mốc để nói khoảng cách giữa hai nơi. Tính chất xa/gần đứng sau mốc: 離學校很近, 離麵店不遠. Muốn phủ định, phủ định tính chất xa/gần, không phủ định trực tiếp 離. Có thể thêm thời gian di chuyển để người nghe hình dung rõ hơn.",
        "Địa điểm A + 離 + địa điểm B + 遠 / 近", "郵局離學校很近。", "Bưu điện rất gần trường.", "那家店離麵店不遠。", "Cửa hàng đó cách quán mì không xa.",
        "Nói 離學校不遠, không nói 不離學校遠 khi muốn diễn tả khoảng cách.",
        ["超商離學校不遠。", "超商不離學校遠。", "超商學校離不遠。"], "a", "離 đặt trước mốc 學校; 不 phủ định 遠."
    ),
]


def build() -> dict:
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson01-vocabulary.json").read_text())
    grammar = []
    for index, (title, explanation, structure, ex1, vi1, ex2, vi2, mistake, options, answer, feedback) in enumerate(grammar_source, 1):
        grammar.append({
            "id": f"{PREFIX}-grammar-{index:02d}", "title": title,
            "audioTrackId": f"cc2-textbook-l01-t{index + 4:02d}",
            "explanation": explanation, "structure": structure,
            "examples": [sentence(ex1, vi1), sentence(ex2, vi2)],
            "commonMistake": mistake,
            "check": question("grammar-check", index, "Chọn câu đúng với mẫu ngữ pháp này.", options, answer, feedback, title),
        })
    lecture_checks = [
        question("check", 1, "Sau khi rẽ phải, người đi đường bảo An Đồng làm gì?", ["Đi thẳng qua đèn giao thông thứ hai", "Vào bưu điện ngay", "Rẽ trái ở giao lộ kế tiếp"], "a", "Người đi đường nói 再往前一直走，過了第二個紅綠燈.", "Hỏi đường"),
        question("check", 2, "Hai nhân vật trong bài đọc tìm cửa hàng bán ba lô ở đâu?", ["Trong trường", "Trong hẻm gần quán mì", "Bên cạnh ngân hàng"], "b", "Đoạn đọc ghi 離麵店不遠的巷子裡有一家賣背包的店.", "Đọc hiểu"),
    ]
    listening = [
        question("listening", 1, "Nghe đối thoại. An Đồng muốn đến đâu trước tiên?", ["Bưu điện", "Sư Đại", "Ga tàu"], "b", "Anh ấy hỏi: 到師大怎麼走？", "Nghe ý chính", audioTrackId="cc2-textbook-l01-t01"),
        question("listening", 2, "Nghe đối thoại. Ở đâu có thể rút tiền theo người đi đường?", ["Chỉ ở trường", "Ở quán mì", "Ở cửa hàng tiện lợi hoặc bưu điện"], "c", "Người đi đường nhắc đến 超商 và 郵局.", "Nghe chi tiết", audioTrackId="cc2-textbook-l01-t01"),
        question("listening", 3, "Nghe bài đọc. Họ vừa ăn mì vừa làm gì?", ["Xem bản đồ trên điện thoại", "Gọi cho người đi đường", "Mua bút"], "a", "Bài đọc nói 一邊吃麵，一邊看著手機裡的地圖.", "Nghe chi tiết", audioTrackId="cc2-textbook-l01-t03"),
        question("listening", 4, "Nghe bài đọc. Cuối cùng Mã An Đồng mua gì?", ["Một cuốn vở", "Một chiếc ba lô", "Hai cây bút"], "b", "Đoạn cuối nói 馬安同買了一個背包.", "Nghe kết quả", audioTrackId="cc2-textbook-l01-t03"),
    ]
    practice_items = [
        ("Muốn hỏi lịch sự đường đến Sư Đại, nói thế nào?", ["請問，到師大怎麼走？", "師大請問走到？", "請問，師大是走嗎？"], "a", "請問 mở đầu lịch sự; 到…怎麼走 hỏi cách đi đến nơi đó.", "Hỏi đường"),
        ("Điền vào chỗ trống: 從這裡＿＿前走。", ["從", "往", "離"], "b", "往前 nghĩa là đi về phía trước.", "Phương hướng"),
        ("‘Qua đèn giao thông thứ hai’ là…", ["過了第二個紅綠燈", "第二個紅綠燈過來", "紅綠燈在第二過"], "a", "過了 + mốc là đã đi qua mốc đó; 第二個 chỉ thứ tự.", "Chỉ đường"),
        ("Điền: 這個地圖看＿＿很好用。", ["著", "起來", "離"], "b", "看起來 là ‘trông có vẻ’ khi đưa ra nhận xét.", "起來"),
        ("Chọn câu diễn tả hai việc cùng lúc.", ["吃了麵以後看地圖。", "看地圖以後吃麵。", "一邊吃麵，一邊看地圖。"], "c", "Hai vế 一邊 nối hai hành động đồng thời.", "一邊"),
        ("Cửa hàng cách quán mì không xa. Chọn câu đúng.", ["那家店離麵店不遠。", "那家店不離麵店遠。", "那家店往麵店不遠。"], "a", "離 là mốc đo khoảng cách; 不 phủ định 遠.", "離"),
        ("Điền: 他們看＿＿地圖找路。", ["了", "著", "過"], "b", "看著 biểu thị việc xem bản đồ vẫn đang tiếp diễn.", "著"),
        ("Cụm nào nghĩa là ‘rẽ trái’?", ["右轉", "往前", "左轉"], "c", "左 là trái; 轉 là rẽ.", "Từ vựng"),
    ]
    assessment_items = [
        ("‘Ngã đường tiếp theo’ là…", ["下一個路口", "第二個郵局", "前面的師大"], "a", "下 + lượng từ + 路口 diễn tả giao lộ tiếp theo.", "Từ vựng"),
        ("Nói ‘trông có vẻ ngon’ với món ăn.", ["吃著好吃", "看起來很好吃", "往前很好吃"], "b", "看起來 diễn tả nhận xét qua quan sát.", "起來"),
        ("An Đồng muốn tìm máy gì gần đó?", ["Máy bán vé", "Máy ATM", "Máy in"], "b", "Anh ấy hỏi 這附近有沒有提款機？", "Đối thoại"),
        ("Trong bài đọc, họ rẽ trái từ đâu?", ["Cửa quán mì", "Bưu điện", "Cổng trường"], "c", "Đoạn đọc nói 從學校門口往左轉.", "Đọc hiểu"),
        ("Chọn cách nói ‘vừa ăn vừa xem bản đồ’.", ["一邊吃，一邊看地圖", "吃了以後看地圖", "吃著看完地圖"], "a", "一邊…一邊… diễn tả hai việc cùng lúc.", "一邊"),
        ("Điền: 郵局＿＿學校很近。", ["往", "從", "離"], "c", "離 giới thiệu mốc để so khoảng cách.", "離"),
        ("‘Hẻm nhỏ’ là…", ["小巷子", "大路口", "紅綠燈"], "a", "巷子 là hẻm; 小 là nhỏ.", "Từ vựng"),
        ("Ai mua một chiếc ba lô?", ["Bạch Như Ngọc", "Mã An Đồng", "Người đi đường"], "b", "Đoạn cuối ghi 馬安同買了一個背包.", "Đọc hiểu"),
        ("Chọn câu chỉ dẫn đúng.", ["往這裡從前走。", "這裡離往前走。", "從這裡往前走。"], "c", "Điểm bắt đầu theo sau 從, hướng theo sau 往.", "Hỏi đường"),
        ("Đoạn cuối cho biết Bạch Như Ngọc mua gì?", ["Hai cây bút và một cuốn sổ", "Một chiếc ba lô", "Hai tô mì bò"], "a", "Bài đọc nói 白如玉…買了兩枝筆和一本本子.", "Đọc hiểu"),
    ]
    return {
        "contentVersion": 2, "id": PREFIX,
        "title": "請問，到師大怎麼走？", "titleVi": "Hỏi đường đến Sư Đại",
        "description": "Học cách hỏi đường, chỉ phương hướng và kể hai việc diễn ra cùng lúc qua hội thoại và bài đọc quanh Sư Đại.",
        "objectives": ["Hỏi và chỉ đường bằng các mốc gần gũi như giao lộ, đèn giao thông.", "Nói vị trí xa gần và nhận xét điều mình nghe, thấy.", "Kể hai việc đang diễn ra cùng lúc bằng 一邊…一邊…."],
        "estimatedMinutes": None,
        "lecture": {
            "introduction": "An Đồng bị lạc gần Sư Đại và hỏi người đi đường. Sau đó, An Đồng cùng Như Ngọc dùng bản đồ để khám phá khu phố. Hãy đọc câu chữ trước, rồi mở phiên âm và nghĩa khi cần.",
            "sections": [
                {"id": f"{PREFIX}-section-01", "title": "Mở lời hỏi đường", "body": "請問 giúp câu hỏi lịch sự hơn. Sau 到 là điểm đến; 怎麼走 hỏi lối đi. Khi nghe chỉ dẫn, chú ý thứ tự các mốc.", **sentence("請問，到師大怎麼走？", "Xin hỏi, đi đến Sư Đại bằng đường nào?")},
                {"id": f"{PREFIX}-section-02", "title": "Theo mốc, không chỉ theo hướng", "body": "Lời chỉ đường tốt thường có cả hướng rẽ và mốc nhận biết. Trong bài, đèn giao thông thứ hai là dấu hiệu biết mình sắp tới Sư Đại.", **sentence("過了第二個紅綠燈，就看見師大了。", "Qua đèn giao thông thứ hai là nhìn thấy Sư Đại.")},
            ],
            "dialogues": [
                {"id": f"{PREFIX}-dialogue", "title": "Hỏi đường và tìm máy ATM", "context": "An Đồng hỏi một người đi đường ở gần Sư Đại.", "audioTrackId": "cc2-textbook-l01-t01", "turns": [{"speaker": who, **sentence(text, vi)} for who, text, vi in dialogue]},
                {"id": f"{PREFIX}-reading", "title": "Dạo quanh khu Sư Đại", "context": "Mã An Đồng và Bạch Như Ngọc thử bản đồ mới.", "audioTrackId": "cc2-textbook-l01-t03", "turns": [{"speaker": "Bài đọc", **sentence(text, vi)} for text, vi in reading]},
            ],
            "checks": lecture_checks, "pronunciation": [],
            "culture": [{"id": f"{PREFIX}-culture-01", "title": "‘超商’ ở Đài Loan", "body": "超商 là cách gọi ngắn của cửa hàng tiện lợi. Trong hội thoại, người đi đường gợi ý tìm máy ATM ở đó hoặc tại bưu điện."}],
        },
        "vocabulary": {"introduction": "Chạm vào từng từ để xem phiên âm, nghĩa và ví dụ.", "wordIds": [record["id"] for record in vocabulary["records"]], "audioTracks": [{"id": "cc2-textbook-l01-t02", "label": "Từ vựng hội thoại"}, {"id": "cc2-textbook-l01-t04", "label": "Từ vựng bài đọc"}]},
        "grammar": grammar,
        "listening": listening,
        "practice": [question("practice", index, *item) for index, item in enumerate(practice_items, 1)],
        "assessment": [question("assessment", index, *item) for index, item in enumerate(assessment_items, 1)],
        "writingTask": {"id": f"{PREFIX}-writing", "title": "Tự chỉ đường", "prompt": "Viết 2–3 câu tiếng Hoa chỉ đường từ nơi bạn đang ở đến một địa điểm gần đó. Dùng ít nhất một mốc như 路口 hoặc 紅綠燈.", "sampleTraditional": "從這裡往前走，到了第二個路口右轉。過了紅綠燈，就看見郵局了。", "sampleSimplified": "从这里往前走，到了第二个路口右转。过了红绿灯，就看见邮局了。"},
    }


def main() -> None:
    target = ROOT / "data/academy/cc2-lesson01.json"
    lesson = build()
    target.write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    reviewed = {
        "cc2-textbook-l01-t01": {
            "transcriptTraditional": "\n".join(f"{speaker}：{text}" for speaker, text, _ in dialogue),
            "transcriptSimplified": "\n".join(f"{speaker}：{CONVERT.convert(text)}" for speaker, text, _ in dialogue),
            "translationVi": "\n".join(f"{speaker}：{vi}" for speaker, _, vi in dialogue),
        },
        "cc2-textbook-l01-t03": {
            "transcriptTraditional": "\n\n".join(text for text, _ in reading),
            "transcriptSimplified": "\n\n".join(CONVERT.convert(text) for text, _ in reading),
            "translationVi": "\n\n".join(vi for _, vi in reading),
        },
    }
    reviewed_path = ROOT / "data/academy/cc2-reviewed-content.json"
    combined_reviewed = json.loads(reviewed_path.read_text()) if reviewed_path.exists() else {}
    combined_reviewed.update(reviewed)
    reviewed_path.write_text(json.dumps(combined_reviewed, ensure_ascii=False, indent=2) + "\n")
    from_chars = set("".join(str(value) for value in walk_strings(lesson)))
    conversions = {char: CONVERT.convert(char) for char in from_chars if CONVERT.convert(char) != char}
    map_path = ROOT / "data/academy/cc2-script-map.json"
    combined_map = json.loads(map_path.read_text()) if map_path.exists() else {}
    combined_map.update(conversions)
    map_path.write_text(json.dumps(combined_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {lesson['id']}: {len(lesson['lecture']['dialogues'][0]['turns'])} dialogue turns, {len(lesson['vocabulary']['wordIds'])} words, {len(lesson['grammar'])} grammar points")


def walk_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from walk_strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from walk_strings(item)


if __name__ == "__main__":
    main()
