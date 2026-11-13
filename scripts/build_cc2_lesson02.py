"""Build reviewed Volume 2 Lesson 02 from the textbook's pages 51–66.

Traditional dialogue and reading text were checked against the visible PDF.
Vietnamese explanations, practice, and assessment are Tai Wén teaching content.
"""

from __future__ import annotations

import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin


ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")
PREFIX = "cc2-v2-l02"


def sentence(chinese: str, vietnamese: str) -> dict:
    pinyin = " ".join(lazy_pinyin(chinese, style=Style.TONE, errors=lambda value: list(value)))
    pinyin = (pinyin.replace("wǒ dé gǎn", "wǒ děi gǎn")
              .replace("měi měi dé xiān", "měi měi děi xiān")
              .replace("sōng sōng dì", "sōng sōng de")
              .replace("hǎo hǎo dì", "hǎo hǎo de"))
    return {"chinese": chinese, "simplified": CONVERT.convert(chinese), "pinyin": pinyin, "meaningVi": vietnamese}


def question(group: str, number: int, prompt: str, choices: list[str], answer: str, feedback: str, skill: str, **extra) -> dict:
    return {
        "id": f"{PREFIX}-{group}-{number:02d}", "prompt": prompt,
        "options": [{"id": chr(97 + index), "text": value} for index, value in enumerate(choices)],
        "correctOptionId": answer, "feedback": feedback, "skill": skill, **extra,
    }


dialogue = [
    ("如玉", "安同，早！你要去哪裡？", "An Đồng, chào buổi sáng! Bạn đi đâu vậy?"),
    ("安同", "早！我約了朋友一起去看電影，你呢？", "Chào buổi sáng! Tôi hẹn bạn cùng đi xem phim. Còn bạn?"),
    ("如玉", "我要去看電腦展。", "Tôi định đi xem triển lãm máy tính."),
    ("安同", "你去哪裡看電腦展？", "Bạn xem triển lãm máy tính ở đâu?"),
    ("如玉", "世貿展覽館，我現在要去對面坐公車。", "Ở Trung tâm triển lãm Thương mại Thế giới. Giờ tôi định sang bên kia đường đón xe buýt."),
    ("安同", "那裡離台北101不遠，妳怎麼不坐捷運呢？", "Nơi đó không xa tháp Đài Bắc 101. Sao bạn không đi MRT?"),
    ("如玉", "朋友告訴我公車直接到展覽館，不必換車。", "Bạn tôi nói xe buýt đi thẳng đến nhà triển lãm, không phải chuyển xe."),
    ("安同", "坐捷運也很方便。妳先坐2號線到台北車站，再換車到展覽館。", "Đi MRT cũng tiện. Bạn đi tuyến số 2 đến ga Đài Bắc, rồi chuyển xe đến nhà triển lãm."),
    ("如玉", "聽起來坐捷運比較麻煩。", "Nghe có vẻ đi MRT phiền hơn."),
    ("安同", "一點也不麻煩，捷運比較快，坐公車要花一個多小時。你還是坐捷運吧！", "Không phiền chút nào. MRT nhanh hơn; đi xe buýt mất hơn một tiếng. Bạn đi MRT thì hơn!"),
    ("如玉", "捷運站遠嗎？", "Ga MRT có xa không?"),
    ("安同", "捷運站就在前面。", "Ga MRT ở ngay phía trước."),
    ("如玉", "謝謝！我得趕快走了。", "Cảm ơn! Tôi phải đi nhanh đây."),
    ("安同", "別急，走慢一點。捷運的班次很多。", "Đừng vội, đi chậm một chút. MRT có nhiều chuyến mà."),
    ("如玉", "好，我們下禮拜見。", "Được, hẹn gặp tuần sau."),
]


reading = [
    ("如玉的朋友美美從法國到台灣來玩兩個禮拜，她先從歐洲坐飛機到越南，再轉機到台灣。到了機場，美美直接坐巴士到台北。如玉告訴她，在市區坐捷運是最方便的，所以她下了巴士，就坐捷運到旅館去了。", "Mỹ Mỹ, bạn của Như Ngọc, từ Pháp sang Đài Loan chơi hai tuần. Cô bay từ châu Âu đến Việt Nam, rồi nối chuyến đến Đài Loan. Tới sân bay, cô đi xe buýt thẳng đến Đài Bắc. Như Ngọc bảo rằng trong trung tâm thành phố, MRT tiện nhất; vì vậy Mỹ Mỹ xuống xe buýt và đi MRT đến khách sạn."),
    ("美美覺得台北的交通非常便利，到處都有公車、計程車，還有捷運，去哪裡都很方便。台北捷運的路線不複雜，車票也不貴，買一張悠遊卡，誰都可以輕輕鬆鬆地去逛逛。", "Mỹ Mỹ thấy giao thông Đài Bắc rất thuận tiện: xe buýt, taxi và MRT ở khắp nơi, đi đâu cũng dễ. Các tuyến MRT không phức tạp, vé cũng không đắt. Chỉ cần mua một thẻ EasyCard là ai cũng có thể đi đây đó thoải mái."),
    ("美美住在法國東部，沒有什麼機會到海邊。聽說台灣附近的小島，風景都很美，所以她決定到綠島去看看。綠島在台灣的東南邊，到那裡不太方便。美美得先坐火車到台東，再搭船或是飛機到綠島。她打算第二個星期去綠島，好好地玩一玩。", "Mỹ Mỹ sống ở miền đông nước Pháp nên ít có dịp ra biển. Nghe nói những đảo nhỏ gần Đài Loan có phong cảnh rất đẹp, cô quyết định đến Lục Đảo xem thử. Lục Đảo nằm về phía đông nam Đài Loan, đường đi không tiện lắm: cô phải đi tàu hỏa đến Đài Đông, rồi đi thuyền hoặc máy bay ra đảo. Cô định dành tuần thứ hai để đến đó chơi cho thỏa thích."),
]


grammar_source = [
    (
        "一點也不 / 沒 — hoàn toàn không", "Mẫu này nhấn mạnh mức phủ định bằng không, mạnh hơn 不 hoặc 沒 thông thường. Với tính từ, nói 一點也不 + tính từ. Với động từ và tân ngữ, đặt tân ngữ ngay sau 一點: 一點飯也沒吃. 也 có thể đổi thành 都. Không dùng mẫu này để nói mức độ dương tính. Trong câu kể quá khứ, 沒 nói việc không xảy ra; 不 thường nói chủ ý không làm.",
        "Chủ ngữ + 一點 (+ tân ngữ) + 也/都 + 不/沒 + động từ/tính từ", "坐捷運一點也不麻煩。", "Đi MRT hoàn toàn không phiền.", "他昨天一點飯也沒吃。", "Hôm qua anh ấy không ăn chút cơm nào.",
        "Khi có tân ngữ, đừng để nó sau động từ: 一點飯也沒吃, không phải 一點也沒吃飯 trong mẫu này.",
        ["他昨天一點飯也沒吃。", "他昨天一點也沒吃飯。", "他昨天飯一點沒也吃。"], "a", "Tân ngữ 飯 phải đứng sau 一點, trước 也沒吃."
    ),
    (
        "還是…吧 — gợi ý phương án tốt hơn", "Khi cân nhắc vài cách làm, 還是 giúp đưa ra lựa chọn hợp lý hơn trong hoàn cảnh ấy. Đặt 還是 trước hành động được đề nghị và 吧 ở cuối câu để lời khuyên nghe nhẹ nhàng. Khác với 還是 trong câu hỏi ‘A hay B?’, ở đây người nói đang khuyên chọn một phương án.",
        "Chủ ngữ + 還是 + hành động + 吧", "坐公車太慢，我們還是坐捷運吧。", "Xe buýt chậm quá, chúng ta đi MRT thì hơn.", "已經很晚了，還是明天再打電話吧。", "Muộn rồi, để mai gọi điện thì hơn.",
        "Đừng bỏ 吧 nếu muốn giữ sắc thái đề nghị nhẹ nhàng trong mẫu của bài.",
        ["下雨了，我們還是坐捷運吧。", "下雨了，我們坐還是捷運吧。", "下雨了，我們還是吧坐捷運。"], "a", "還是 đứng trước hành động được khuyên; 吧 đặt cuối câu."
    ),
    (
        "Động từ / tính từ + 一點 — điều chỉnh mức độ", "Đặt 一點 sau động từ hoặc tính từ để yêu cầu thay đổi một chút: 走慢一點, 說清楚一點. Mẫu này thường xuất hiện trong lời nhắc hoặc đề nghị. Nó khác với 一點也不 ở trên: ở đây 一點 nói mức độ thay đổi, không tạo phủ định.",
        "Động từ + tính từ + 一點", "別急，走慢一點。", "Đừng vội, đi chậm một chút.", "請你說清楚一點。", "Bạn nói rõ hơn một chút nhé.",
        "Không đưa 一點 lên trước cụm hành động nếu muốn diễn tả ‘hơn một chút’ trong mẫu này.",
        ["請你走慢一點。", "請你一點走慢。", "請你慢走一點地。"], "a", "一點 theo sau phần nói về mức độ: 走慢一點."
    ),
    (
        "Tính từ hai âm tiết lặp AABB", "Một số tính từ hai âm tiết có thể lặp cả hai âm tiết: 輕鬆 → 輕輕鬆鬆, 開心 → 開開心心. Trước động từ, thêm 地: 輕輕鬆鬆地逛逛. Trước danh từ, dùng 的: 乾乾淨淨的房間. Đây là cách tả trạng thái sinh động hơn, không phải mọi tính từ đều lặp được; bài cho phép các từ như 輕鬆、漂亮、舒服、乾淨、開心、快樂、客氣. Đừng thêm 很 trước dạng đã lặp.",
        "AB → AABB；AABB + 地 + động từ / AABB + 的 + danh từ", "有了悠遊卡，就可以輕輕鬆鬆地去逛逛。", "Có thẻ EasyCard thì có thể đi dạo thoải mái.", "我想住在乾乾淨淨的房間。", "Tôi muốn ở trong một căn phòng sạch sẽ.",
        "Không nói 很輕輕鬆鬆: dạng AABB đã mang sắc thái nhấn mạnh.",
        ["他輕輕鬆鬆地走到車站。", "他很輕輕鬆鬆地走到車站。", "他輕鬆輕鬆地走到車站。"], "a", "輕鬆 lặp thành 輕輕鬆鬆; trước động từ dùng 地."
    ),
    (
        "不太 + tính từ — phủ định nhẹ", "不太 nghĩa là ‘không… lắm’. Nó thường làm lời nhận xét mềm hơn so với 不: 不太方便 ‘không tiện lắm’. Trong ngữ cảnh khác, người nói cũng có thể dùng nó để trấn an: 不太冷 ‘không lạnh lắm’. Đặt 不太 ngay trước tính từ; đừng hiểu thành ‘hoàn toàn không’ như 一點也不.",
        "Chủ ngữ + 不太 + tính từ", "到綠島不太方便。", "Đến Lục Đảo không tiện lắm.", "今天不太冷，不必穿那麼多。", "Hôm nay không lạnh lắm, không cần mặc nhiều vậy.",
        "不太遠 là ‘không xa lắm’, nhẹ hơn 一點也不遠 ‘không xa chút nào’.",
        ["這條路不太複雜。", "這條路太不複雜。", "這條路不複雜太。"], "a", "不太 đặt ngay trước tính từ 複雜."
    ),
    (
        "Phương hướng + 部 / 邊 — chỉ khu vực và phía", "部 chỉ một vùng của khu vực rộng: 台灣東部 là miền đông Đài Loan. 邊 chỉ phía tương đối với một mốc: 台灣的東南邊 là phía đông nam Đài Loan. Với vị trí trên bản đồ, hãy xác định rõ mốc trước khi chọn 部 hay 邊. Một số cách nói cố định không dùng cả hai, như 中部 ‘miền trung’.",
        "Địa danh + phương hướng + 部 / địa danh + 的 + phương hướng + 邊", "台灣東部的風景很美。", "Phong cảnh miền đông Đài Loan rất đẹp.", "綠島在台灣的東南邊。", "Lục Đảo nằm về phía đông nam Đài Loan.",
        "Không tự tạo 中邊 để nói ‘miền trung’; hãy dùng 中部.",
        ["綠島在台灣的東南邊。", "綠島在台灣的中邊。", "綠島在台灣的東南中。"], "a", "東南邊 chỉ phía đông nam so với Đài Loan."
    ),
]


def build() -> dict:
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson02-vocabulary.json").read_text())
    grammar = []
    for index, (title, explanation, structure, ex1, vi1, ex2, vi2, mistake, choices, answer, feedback) in enumerate(grammar_source, 1):
        grammar.append({
            "id": f"{PREFIX}-grammar-{index:02d}", "title": title,
            "audioTrackId": f"cc2-textbook-l02-t{index + 4:02d}",
            "explanation": explanation, "structure": structure,
            "examples": [sentence(ex1, vi1), sentence(ex2, vi2)],
            "commonMistake": mistake,
            "check": question("grammar-check", index, "Chọn câu đúng với mẫu ngữ pháp này.", choices, answer, feedback, title),
        })
    lecture_checks = [
        question("check", 1, "Vì sao Như Ngọc định đi xe buýt?", ["Vì xe buýt đến thẳng nhà triển lãm, không phải chuyển xe", "Vì MRT ngừng chạy", "Vì ga MRT quá xa"], "a", "Cô nói 公車直接到展覽館，不必換車.", "Hội thoại"),
        question("check", 2, "Mỹ Mỹ phải đi qua thành phố nào trước khi ra Lục Đảo?", ["Đài Bắc", "Đài Đông", "Đài Nam"], "b", "Bài đọc ghi 先坐火車到台東，再搭船或是飛機到綠島.", "Bài đọc"),
    ]
    listening = [
        question("listening", 1, "Nghe hội thoại. Như Ngọc muốn đến đâu?", ["Sân bay", "Trung tâm triển lãm Thương mại Thế giới", "Lục Đảo"], "b", "Cô nói 我要去看電腦展 ở 世貿展覽館.", "Nghe ý chính", audioTrackId="cc2-textbook-l02-t01"),
        question("listening", 2, "Nghe hội thoại. Theo An Đồng, đi cách nào nhanh hơn?", ["Đi MRT", "Đi xe buýt", "Đi bộ"], "a", "Anh ấy nói 捷運比較快.", "Nghe so sánh", audioTrackId="cc2-textbook-l02-t01"),
        question("listening", 3, "Nghe bài đọc. Mỹ Mỹ làm gì sau khi xuống xe buýt ở Đài Bắc?", ["Đi taxi", "Đi tàu hỏa", "Đi MRT đến khách sạn"], "c", "Bài đọc nói 她下了巴士，就坐捷運到旅館去了.", "Nghe trình tự", audioTrackId="cc2-textbook-l02-t03"),
        question("listening", 4, "Nghe bài đọc. Mỹ Mỹ định đến Lục Đảo vào lúc nào?", ["Tuần thứ hai", "Ngay ngày đầu tiên", "Sau hai tháng"], "a", "Cô 打算第二個星期去綠島.", "Nghe thời gian", audioTrackId="cc2-textbook-l02-t03"),
    ]
    practice_items = [
        ("Điền: 坐公車要換兩次車，我們＿＿坐捷運吧。", ["直接", "還是", "不必"], "b", "還是…吧 dùng để đề nghị phương án hợp lý hơn.", "Gợi ý"),
        ("Câu nào diễn tả ‘không phiền chút nào’?", ["不太麻煩", "麻煩一點", "一點也不麻煩"], "c", "一點也不 nhấn mạnh phủ định hoàn toàn.", "Phủ định"),
        ("Điền: 到台北車站以後要＿＿車。", ["換", "下", "約"], "a", "換車 là chuyển sang chuyến hoặc tuyến khác.", "Đi lại"),
        ("Muốn nhắc bạn đi chậm hơn một chút, nói thế nào?", ["走一點慢。", "走慢一點。", "一點走慢。"], "b", "一點 đặt sau 走慢 để điều chỉnh mức độ.", "Lời nhắc"),
        ("Điền: 台北捷運的路線＿＿複雜。", ["太不", "不複", "不太"], "c", "不太 + tính từ diễn tả ‘không… lắm’.", "Nhận xét"),
        ("Chọn cách nói ‘đi dạo thoải mái’.", ["輕輕鬆鬆地去逛逛", "很輕輕鬆鬆去逛逛", "輕鬆輕鬆的去逛逛"], "a", "輕鬆 lặp AABB; 地 nối trạng thái với hành động.", "Lặp tính từ"),
        ("Bài đọc cho biết Mỹ Mỹ chuyển máy bay ở đâu?", ["Đài Đông", "Việt Nam", "Đài Bắc"], "b", "Cô 從歐洲坐飛機到越南，再轉機到台灣.", "Đọc hiểu"),
        ("Lục Đảo nằm về phía nào của Đài Loan?", ["Phía tây bắc", "Miền trung", "Phía đông nam"], "c", "Bài đọc nói 綠島在台灣的東南邊.", "Đọc hiểu"),
    ]
    assessment_items = [
        ("‘Không cần chuyển xe’ là…", ["不必換車", "直接換車", "趕快換車"], "a", "不必 nghĩa là không cần, 換車 là chuyển xe.", "Từ vựng"),
        ("Điền: 坐公車比較慢，我們＿＿坐捷運吧。", ["一點", "還是", "到處"], "b", "還是…吧 gợi ý lựa chọn tốt hơn.", "Gợi ý"),
        ("Câu nào có nghĩa ‘tuyến MRT không phức tạp lắm’?", ["捷運路線一點也不便宜。", "捷運路線比較麻煩。", "捷運路線不太複雜。"], "c", "不太複雜 diễn tả không phức tạp lắm.", "Ngữ pháp"),
        ("An Đồng bảo Như Ngọc bắt đầu đi tuyến nào?", ["Tuyến số 2", "Tuyến số 5", "Xe buýt sân bay"], "a", "Trong hội thoại: 妳先坐2號線到台北車站.", "Hội thoại"),
        ("Điền: 請你說清楚＿＿。", ["地", "一點", "也不"], "b", "一點 sau tính từ 清楚 làm lời đề nghị ‘rõ hơn một chút’.", "Lời nhắc"),
        ("Từ nào là dạng lặp đúng của 輕鬆?", ["輕鬆輕鬆", "輕輕鬆", "輕輕鬆鬆"], "c", "Tính từ hai âm tiết lặp theo mẫu AABB.", "Ngữ pháp"),
        ("Mỹ Mỹ dùng gì để đi MRT thuận tiện?", ["Thẻ EasyCard", "Vé tàu hỏa", "Vé máy bay"], "a", "Đoạn đọc nhắc đến 買一張悠遊卡.", "Bài đọc"),
        ("Điền: 綠島在台灣的東南＿＿。", ["部", "邊", "站"], "b", "Đối với vị trí so với Đài Loan, dùng 東南邊.", "Vị trí"),
        ("Theo bài đọc, cách nào đi từ Đài Đông đến Lục Đảo?", ["Chỉ đi xe buýt", "Chỉ đi MRT", "Đi thuyền hoặc máy bay"], "c", "Bài đọc nói 再搭船或是飛機到綠島.", "Bài đọc"),
        ("Câu nào nói ‘hoàn toàn không đắt’?", ["一點也不貴。", "不太貴一點。", "貴一點也不。"], "a", "一點也不 + tính từ phủ định mạnh.", "Phủ định"),
    ]
    return {
        "contentVersion": 2, "id": PREFIX,
        "title": "還是坐捷運吧！", "titleVi": "Đi MRT thì hơn!",
        "description": "Hỏi đường đi bằng phương tiện công cộng, so sánh xe buýt với MRT và lên kế hoạch đến Lục Đảo.",
        "objectives": ["Hỏi và chỉ cách đi bằng xe buýt, MRT, tàu hỏa và thuyền.", "So sánh các cách đi rồi đưa ra lời khuyên phù hợp.", "Dùng phủ định mạnh, phủ định nhẹ và các cách diễn tả mức độ trong hội thoại."],
        "estimatedMinutes": None,
        "lecture": {
            "introduction": "Như Ngọc định đi xem triển lãm bằng xe buýt; An Đồng gợi ý đi MRT. Trong bài đọc, Mỹ Mỹ tìm cách đi lại ở Đài Bắc rồi lên kế hoạch ra Lục Đảo.",
            "sections": [
                {"id": f"{PREFIX}-section-01", "title": "Chọn tuyến và chuyển xe", "body": "先…再… giúp sắp xếp các chặng: đi tuyến số 2 đến ga Đài Bắc trước, rồi mới chuyển tuyến. Hãy xác định điểm chuyển xe khi nghe chỉ dẫn.", **sentence("妳先坐2號線到台北車站，再換車到展覽館。", "Bạn đi tuyến số 2 đến ga Đài Bắc trước, rồi chuyển xe đến nhà triển lãm.")},
                {"id": f"{PREFIX}-section-02", "title": "So sánh trước khi khuyên", "body": "An Đồng so tốc độ và thời gian của hai cách đi. Từ lý do ấy, anh dùng 還是…吧 để khuyên Như Ngọc chọn MRT.", **sentence("捷運比較快，你還是坐捷運吧！", "MRT nhanh hơn; bạn đi MRT thì hơn!")},
            ],
            "dialogues": [
                {"id": f"{PREFIX}-dialogue", "title": "Xe buýt hay MRT?", "context": "Như Ngọc và An Đồng bàn cách đến nhà triển lãm.", "audioTrackId": "cc2-textbook-l02-t01", "turns": [{"speaker": who, **sentence(text, vi)} for who, text, vi in dialogue]},
                {"id": f"{PREFIX}-reading", "title": "Mỹ Mỹ đi lại ở Đài Loan", "context": "Từ sân bay đến Đài Bắc, rồi dự định ra Lục Đảo.", "audioTrackId": "cc2-textbook-l02-t03", "turns": [{"speaker": "Bài đọc", **sentence(text, vi)} for text, vi in reading]},
            ],
            "checks": lecture_checks, "pronunciation": [],
            "culture": [{"id": f"{PREFIX}-culture-01", "title": "Thẻ 悠遊卡", "body": "Bài đọc nhắc đến 悠遊卡 khi Mỹ Mỹ đi lại bằng MRT ở Đài Bắc. Hãy nhận ra tên thẻ này khi đọc các tình huống giao thông."}],
        },
        "vocabulary": {"introduction": "Chạm vào từ để mở phiên âm, nghĩa và ví dụ.", "wordIds": [record["id"] for record in vocabulary["records"]], "audioTracks": [{"id": "cc2-textbook-l02-t02", "label": "Từ vựng hội thoại"}, {"id": "cc2-textbook-l02-t04", "label": "Từ vựng bài đọc"}]},
        "grammar": grammar, "listening": listening,
        "practice": [question("practice", index, *item) for index, item in enumerate(practice_items, 1)],
        "assessment": [question("assessment", index, *item) for index, item in enumerate(assessment_items, 1)],
        "writingTask": {"id": f"{PREFIX}-writing", "title": "Chọn cách đi", "prompt": "Viết 2–3 câu tiếng Hoa: từ nơi bạn ở đến một địa điểm bạn muốn đến, bạn sẽ đi bằng gì? Nêu một lý do và một lời khuyên bằng 還是…吧.", "sampleTraditional": "坐公車要花一個多小時，捷運比較快。我們還是坐捷運吧！", "sampleSimplified": "坐公交车要花一个多小时，捷运比较快。我们还是坐捷运吧！"},
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
    (ROOT / "data/academy/cc2-lesson02.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    reviewed_path = ROOT / "data/academy/cc2-reviewed-content.json"
    reviewed = json.loads(reviewed_path.read_text())
    reviewed.update({
        "cc2-textbook-l02-t01": {
            "transcriptTraditional": "\n".join(f"{speaker}：{text}" for speaker, text, _ in dialogue),
            "transcriptSimplified": "\n".join(f"{speaker}：{CONVERT.convert(text)}" for speaker, text, _ in dialogue),
            "translationVi": "\n".join(f"{speaker}：{vi}" for speaker, _, vi in dialogue),
        },
        "cc2-textbook-l02-t03": {
            "transcriptTraditional": "\n\n".join(text for text, _ in reading),
            "transcriptSimplified": "\n\n".join(CONVERT.convert(text) for text, _ in reading),
            "translationVi": "\n\n".join(vi for _, vi in reading),
        },
    })
    reviewed_path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    map_path = ROOT / "data/academy/cc2-script-map.json"
    script_map = json.loads(map_path.read_text())
    script_map.update({char: CONVERT.convert(char) for char in set("".join(strings(lesson))) if CONVERT.convert(char) != char})
    map_path.write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(dialogue)} turns, {len(reading)} paragraphs, {len(lesson['vocabulary']['wordIds'])} words, {len(lesson['grammar'])} grammar points")


if __name__ == "__main__":
    main()
