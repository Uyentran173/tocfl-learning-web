"""Build Volume 2 Lesson 07 from the reviewed textbook dialogue and reading."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin

ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")
PREFIX = "cc2-v2-l07"


def simplified(value: str) -> str:
    return CONVERT.convert(value).replace("拿著", "拿着").replace("站著", "站着")


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


# Traditional textbook PDF pages 185–186, checked against the visible page.
DIALOGUE = [
    ("陳太太", "東健，要出去啊？", "Đông Kiện, cháu định ra ngoài à?"),
    ("東健", "是啊！垃圾車快來了，我得趕快下樓去倒垃圾。", "Vâng! Xe rác sắp đến rồi, cháu phải nhanh xuống lầu đổ rác."),
    ("陳太太", "丟垃圾？今天是星期三，不收垃圾啊！", "Đổ rác ư? Hôm nay thứ Tư, không thu gom rác đâu!"),
    ("東健", "真的嗎？我以為天天都收。", "Thật ạ? Cháu cứ tưởng ngày nào cũng thu gom."),
    ("陳太太", "不是，每個星期三和星期天是不收的。", "Không, thứ Tư và Chủ nhật hằng tuần không thu gom."),
    ("東健", "那麼，我這些汽水罐和紙杯也不能拿出去回收了嗎？", "Vậy những lon nước ngọt và ly giấy này cháu cũng không mang ra để tái chế được sao?"),
    ("陳太太", "是啊！", "Đúng vậy!"),
    ("東健", "為什麼在台北倒垃圾這麼麻煩？", "Sao đổ rác ở Đài Bắc phiền thế ạ?"),
    ("陳太太", "剛開始的時候，台北人也覺得這個規定很麻煩，現在大家都習慣了。", "Lúc đầu người Đài Bắc cũng thấy quy định này phiền, giờ ai cũng quen rồi."),
    ("東健", "更麻煩的是，我一定要在晚上九點把垃圾拿出去，要不然就不能倒了。", "Phiền hơn là cháu phải mang rác ra lúc chín giờ tối; nếu không thì không đổ được nữa."),
    ("陳太太", "你說的對，有一次，我一回來，垃圾車就來了。我馬上放下皮包，跑出去倒垃圾。", "Cháu nói đúng. Có lần cô vừa về thì xe rác đến. Cô đặt túi xuống ngay rồi chạy ra đổ rác."),
    ("東健", "對啊！我常常看到有人追垃圾車。", "Đúng ạ! Cháu thường thấy có người chạy đuổi theo xe rác."),
    ("陳太太", "晚上，這麼多人從家裡拿著垃圾走出來，一起站著等垃圾車，你不覺得很有趣嗎？", "Buổi tối, nhiều người cầm rác ra khỏi nhà rồi đứng chờ xe cùng nhau, cháu không thấy thú vị sao?"),
    ("東健", "大家常一邊聊天，一邊等，看起來真的很有意思。", "Mọi người vừa trò chuyện vừa chờ; trông đúng là khá vui."),
    ("陳太太", "雖然倒垃圾有點麻煩，但是好像也不壞。", "Đổ rác tuy hơi phiền, nhưng xem ra cũng không tệ."),
    ("東健", "那麼，我這包垃圾怎麼辦？", "Vậy túi rác này của cháu phải làm sao?"),
    ("陳太太", "你拿回家去，明天再倒吧！", "Cháu mang về nhà, mai hãy đổ nhé!"),
]

# Traditional textbook PDF page 189, checked against the visible page.
READING = [
    ("馬安同到台灣的第二天，晚上在房間上網，跟父母聊台灣的情形，他忽然聽見外面有音樂的聲音，可是不知道音樂是從哪裡來的，覺得有一點奇怪，所以從窗戶往外看。他看見很多人拿著袋子往路口走，路口已經站了很多人，才知道是垃圾車的音樂。那輛垃圾車一開過來，大家就走過去把手裡的垃圾丟進去。",
     "Tối ngày thứ hai ở Đài Loan, Mã An Đồng lên mạng trong phòng, trò chuyện với bố mẹ về cuộc sống ở đây. Anh bất chợt nghe tiếng nhạc bên ngoài, thấy lạ nên nhìn qua cửa sổ. Nhiều người cầm túi đi về phía ngã tư; ở đó đã có rất đông người đứng chờ. Lúc ấy anh mới biết đó là nhạc của xe rác. Xe vừa tới, mọi người liền đi đến bỏ rác vào xe."),
    ("外國人剛到台北，不知道哪裡可以丟垃圾，也不知道什麼時候可以丟垃圾，馬安同問了台灣人才知道，台北的垃圾車只在一定的時間、一定的地點收垃圾。雖然有點麻煩，但是路上沒有垃圾，對台北的環境比較好。",
     "Người mới đến Đài Bắc thường không biết đổ rác ở đâu, vào lúc nào. Mã An Đồng hỏi người Đài Loan mới biết xe rác chỉ thu gom vào thời gian và địa điểm cố định. Tuy hơi bất tiện, cách này giúp đường phố không có rác và tốt hơn cho môi trường Đài Bắc."),
    ("為了保護環境，大家都應該做垃圾分類，那些可以再利用的紙、瓶子、塑膠杯都要回收，丟進資源回收桶裡。現在大家都知道，一個乾乾淨淨的城市也是一個進步的城市。",
     "Để bảo vệ môi trường, mọi người nên phân loại rác. Giấy, chai và ly nhựa có thể dùng lại cần được tái chế và bỏ vào thùng thu gom. Ngày nay ai cũng hiểu rằng một thành phố sạch sẽ cũng là một thành phố tiến bộ."),
]

# Grammar headings and examples checked against textbook PDF pages 192–199.
GRAMMAR = [
    ("V + 來 / 去 — hướng di chuyển", "Đặt 來 khi chuyển động hướng về điểm nhìn của người nói và 去 khi đi xa điểm đó. Giữa động từ và 來/去 có thể thêm hướng như 上, 下, 進, 出, 回, 過. Vì thế 跑出去 là chạy ra ngoài, còn 拿回家去 là mang trở về nhà. Nơi đến được đặt trước 來/去.", "Động từ + hướng + 來 / 去", ("你拿回家去，明天再倒吧！", "Cháu mang về nhà, mai hãy đổ."), ("他從房間走出來。", "Anh ấy đi ra khỏi phòng."), "Đừng đổi 來 thành 去 nếu người hoặc vật đang đi về phía điểm nhìn của người nói.", "他從樓下跑上＿＿。", "來", ["去", "在"]),
    ("把 + đồ vật + V + hướng", "Dùng 把 để đưa vật đã xác định lên trước, rồi nêu rõ nó được chuyển theo hướng nào. Trong 我把垃圾拿出去了, rác là vật đã biết và 拿出去 là kết quả di chuyển. Mẫu này cần thành phần chỉ hướng hoặc kết quả sau động từ.", "Chủ ngữ + 把 + vật đã biết + động từ + hướng + 來 / 去", ("我把垃圾拿出去了。", "Tôi đã mang rác ra ngoài."), ("大家把手裡的垃圾丟進去。", "Mọi người bỏ rác trên tay vào trong."), "Không dừng ở 把垃圾拿; cần nói đã mang rác đi đâu.", "我＿＿垃圾拿出去了。", "把", ["為了", "給"]),
    ("不 / 沒…嗎？ — hỏi mang ý phản bác", "Câu hỏi phủ định kết thúc bằng 嗎 có thể mang sắc thái nhắc nhở hoặc phản bác: người nói nghĩ rằng đối phương lẽ ra đã biết điều đó. Trong hội thoại, 你不覺得很有趣嗎？ là lời mời người nghe nhìn nhận sự thú vị. Sắc thái này có thể hơi gắt, nên cân nhắc ngữ cảnh.", "不 / 沒 + động từ hoặc tính từ + 嗎？", ("你不覺得很有趣嗎？", "Cháu không thấy thú vị sao?"), ("你沒看見我正在忙嗎？", "Bạn không thấy tôi đang bận sao?"), "Đừng dùng cấu trúc này khi cần một câu hỏi trung tính, lịch sự.", "你不覺得這個規定很麻煩＿＿？", "嗎", ["吧", "呢"]),
    ("Nơi chốn + V 著 + người / vật", "Để nói có người hoặc vật đang ở một nơi trong tư thế nào, đặt nơi chốn trước, rồi dùng động từ tư thế với 著 và đối tượng ở cuối. 路口站著很多人 nghĩa là có nhiều người đang đứng ở ngã tư. Đây là cách miêu tả cảnh, không nhấn mạnh ai đang thực hiện hành động.", "Nơi chốn + 站 / 坐 / 放… + 著 + người / vật", ("路口已經站了很多人。", "Ở ngã tư đã có rất đông người đứng."), ("咖啡店裡坐著很多學生。", "Trong quán cà phê có nhiều học sinh đang ngồi."), "Nếu muốn giới thiệu cảnh vật, đừng đặt 很多人 làm chủ ngữ của mẫu tồn tại này.", "咖啡店裡坐＿＿很多學生。", "著", ["把", "給"]),
    ("為了 — để; nhằm", "為了 nêu mục đích của hành động, theo sau là danh từ hoặc cụm động từ. Có thể đặt cụm mục đích ở đầu câu hoặc sau chủ ngữ. Bài đọc dùng 為了保護環境 để giải thích lý do phải phân loại rác.", "為了 + mục đích，+ hành động", ("為了保護環境，大家都應該做垃圾分類。", "Để bảo vệ môi trường, mọi người nên phân loại rác."), ("他為了學中文，來台灣念書。", "Anh ấy đến Đài Loan học để học tiếng Hoa."), "Đừng nhầm 為了 chỉ mục đích với 因為 chỉ nguyên nhân.", "＿＿保護環境，我們應該回收瓶子。", "為了", ["因為", "要不然"]),
]


def build() -> dict:
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson07-vocabulary.json").read_text())
    grammar = []
    for index, (title, explanation, pattern, first, second, mistake, blank, correct, wrong) in enumerate(GRAMMAR, 1):
        grammar.append({"id": f"{PREFIX}-grammar-{index:02d}", "title": title,
                        "audioTrackId": f"cc2-textbook-l07-t{index + 4:02d}", "explanation": explanation,
                        "structure": pattern, "examples": [sentence(*first), sentence(*second)],
                        "commonMistake": mistake,
                        "check": question("grammar-check", index, f"Điền: {blank}", correct, wrong, explanation.split(".")[0] + ".", "Ngữ pháp")})
    practice = [
        question("practice", 1, "‘回收’ nghĩa là gì?", "tái chế; thu hồi", ["chạy theo", "đặt xuống"], "回收 là tái chế hoặc thu hồi.", "Từ vựng"),
        question("practice", 2, "Điền: 我把垃圾拿出＿＿。", "去", ["來", "在"], "Rác được mang ra xa điểm nhìn, nên dùng 去.", "Ngữ pháp"),
        question("practice", 3, "Vì sao thứ Tư Đông Kiện không thể đổ rác?", "Xe rác không thu gom vào thứ Tư", ["Anh đi làm về quá muộn", "Anh không có túi rác"], "陳太太 nói 每個星期三和星期天是不收的.", "Hội thoại"),
        question("practice", 4, "Điền: 為了保護環境，大家應該做垃圾＿＿。", "分類", ["皮包", "聲音"], "垃圾分類 là phân loại rác.", "Từ vựng"),
        question("practice", 5, "Mã An Đồng nghe thấy gì bên ngoài?", "Tiếng nhạc của xe rác", ["Tiếng người hát", "Tiếng chuông trường"], "Anh nghe 音樂的聲音 rồi mới biết đó là nhạc xe rác.", "Bài đọc"),
        question("practice", 6, "Điền: 路口站＿＿很多人。", "著", ["給", "把"], "Động từ tư thế với 著 miêu tả cảnh có nhiều người đang đứng.", "Ngữ pháp"),
        question("practice", 7, "‘要不然’ dùng để nêu điều gì?", "Hệ quả nếu không làm việc vừa nói", ["Mục đích của hành động", "Một thời điểm quá khứ"], "要不然 nghĩa là nếu không thì.", "Ngữ pháp"),
        question("practice", 8, "Điền: ＿＿保護環境，我們應該回收瓶子。", "為了", ["因為", "還是"], "為了 chỉ mục đích: để bảo vệ môi trường.", "Ngữ pháp"),
    ]
    assessment = [
        question("assessment", 1, "‘垃圾車’ là gì?", "xe rác", ["xe buýt", "xe cứu thương"], "垃圾車 là xe rác.", "Từ vựng"),
        question("assessment", 2, "Theo hội thoại, ngày nào không thu gom rác?", "Thứ Tư và Chủ nhật", ["Thứ Hai và thứ Ba", "Thứ Bảy và Chủ nhật"], "陳太太 nói rõ 每個星期三和星期天是不收的.", "Hội thoại"),
        question("assessment", 3, "Điền: 他從房間走出＿＿。", "來", ["去", "把"], "來 chỉ hướng về điểm nhìn của người nói.", "Ngữ pháp"),
        question("assessment", 4, "Bài đọc nói rác được thu gom thế nào?", "Vào giờ và địa điểm cố định", ["Bất cứ lúc nào", "Chỉ trong khuôn viên trường"], "垃圾車只在一定的時間、一定的地點收垃圾.", "Bài đọc"),
        question("assessment", 5, "Điền: 我＿＿瓶子丟進回收桶。", "把", ["為了", "嗎"], "把 nêu vật đã biết trước hành động bỏ vào thùng.", "Ngữ pháp"),
        question("assessment", 6, "‘汽水罐’ là gì?", "lon nước ngọt", ["ly nhựa", "chai thủy tinh"], "汽水罐 là lon nước ngọt.", "Từ vựng"),
        question("assessment", 7, "Điền: 咖啡店裡坐＿＿很多學生。", "著", ["去", "給"], "坐著 miêu tả nhiều người đang ngồi trong quán.", "Ngữ pháp"),
        question("assessment", 8, "Vì sao nên phân loại rác?", "Để bảo vệ môi trường", ["Để xe rác đến sớm hơn", "Để không phải dùng túi"], "Bài đọc mở đoạn cuối bằng 為了保護環境.", "Bài đọc"),
        question("assessment", 9, "Điền: ＿＿學中文，他來台灣念書。", "為了", ["要不然", "可是"], "為了 nêu mục đích học tiếng Hoa.", "Ngữ pháp"),
        question("assessment", 10, "Nếu hôm nay chưa đổ được rác, Đông Kiện nên làm gì?", "Mang về nhà và mai đổ", ["Để lại ở ngã tư", "Bỏ vào túi của cô Trần"], "陳太太 nói 你拿回家去，明天再倒吧.", "Hội thoại"),
    ]
    return {"contentVersion": 2, "id": PREFIX, "title": "垃圾車來了！", "titleVi": "Xe rác đến rồi!",
            "description": "Học cách nói về đổ rác, tái chế và mô tả hướng di chuyển.",
            "objectives": ["Hiểu giờ và nơi thu gom rác trong tình huống đời sống Đài Loan.",
                           "Nói đồ vật được mang đến đâu bằng bổ ngữ chỉ hướng.",
                           "Nêu mục đích và miêu tả người, vật ở một nơi."],
            "estimatedMinutes": None,
            "lecture": {"introduction": "Đông Kiện định mang rác xuống lầu nhưng hôm đó xe không thu gom. Qua câu chuyện, bạn sẽ học cách nói về giờ đổ rác và phân loại rác.",
                        "sections": [
                            {"id": f"{PREFIX}-section-01", "title": "Đổ rác ở Đài Bắc", "body": "Xe rác đến đúng giờ; người dân mang rác ra điểm thu gom và phân loại đồ tái chế.", **sentence("每個星期三和星期天是不收的。", "Thứ Tư và Chủ nhật hằng tuần không thu gom rác.")},
                            {"id": f"{PREFIX}-section-02", "title": "Nói về hướng di chuyển", "body": "來 và 去 cho biết chuyển động hướng về hay rời xa điểm nhìn của người nói.", **sentence("你拿回家去，明天再倒吧！", "Cháu mang về nhà, mai hãy đổ nhé!")},
                        ],
                        "dialogues": [
                            {"id": f"{PREFIX}-dialogue", "title": "Xe rác đến rồi!", "context": "Đông Kiện hỏi cô Trần về lịch thu gom rác.", "audioTrackId": "cc2-textbook-l07-t01", "turns": [{"speaker": who, **sentence(text, vi)} for who, text, vi in DIALOGUE]},
                            {"id": f"{PREFIX}-reading", "title": "Xe rác ở Đài Bắc", "context": "Mã An Đồng lần đầu thấy cách đổ rác ở Đài Bắc.", "audioTrackId": "cc2-textbook-l07-t03", "turns": [{"speaker": "Bài đọc", **sentence(text, vi)} for text, vi in READING]},
                        ],
                        "checks": [
                            question("check", 1, "Thứ Tư ở đây có thu gom rác không?", "Không", ["Có", "Chỉ thu gom giấy"], "Hội thoại nói 星期三不收垃圾.", "Hội thoại"),
                            question("check", 2, "Vì sao Mã An Đồng nhìn qua cửa sổ?", "Nghe tiếng nhạc bên ngoài và thấy lạ", ["Đợi người thân đến", "Tìm xe buýt"], "Bài đọc nói anh nghe nhạc, cảm thấy kỳ lạ nên nhìn ra ngoài.", "Bài đọc"),
                        ], "pronunciation": [], "culture": []},
            "vocabulary": {"introduction": "Chạm vào từ để xem phiên âm, nghĩa và ví dụ.", "wordIds": [word["id"] for word in vocabulary["records"]],
                           "audioTracks": [{"id": "cc2-textbook-l07-t02", "label": "Từ vựng hội thoại"}, {"id": "cc2-textbook-l07-t04", "label": "Từ vựng bài đọc"}]},
            "grammar": grammar,
            "listening": [
                question("listening", 1, "Nghe hội thoại. Đông Kiện định đi đâu?", "Xuống lầu đổ rác", ["Đến trường", "Đi mua nước"], "Anh nói 得趕快下樓去倒垃圾.", "Nghe chi tiết", audioTrackId="cc2-textbook-l07-t01"),
                question("listening", 2, "Nghe hội thoại. Đông Kiện phải làm gì với túi rác?", "Mang về nhà, mai đổ", ["Để ở cầu thang", "Bỏ vào thùng giấy"], "Cô Trần bảo 拿回家去，明天再倒.", "Nghe kết quả", audioTrackId="cc2-textbook-l07-t01"),
                question("listening", 3, "Nghe bài đọc. Tiếng nhạc bên ngoài phát ra từ đâu?", "Xe rác", ["Trường học", "Một cửa hàng"], "Mã An Đồng phát hiện đó là 垃圾車的音樂.", "Nghe chi tiết", audioTrackId="cc2-textbook-l07-t03"),
                question("listening", 4, "Nghe bài đọc. Vì sao mọi người phân loại rác?", "Để bảo vệ môi trường", ["Để bán vé xe", "Để xe đến sớm"], "Đoạn cuối bắt đầu 為了保護環境.", "Nghe ý chính", audioTrackId="cc2-textbook-l07-t03"),
            ], "practice": practice, "assessment": assessment,
            "writingTask": {"id": f"{PREFIX}-writing", "title": "Cách đổ rác nơi bạn sống",
                            "prompt": "Viết 2–3 câu về thời gian và nơi đổ rác. Hãy thử dùng 為了 hoặc một bổ ngữ chỉ hướng.",
                            "sampleTraditional": "為了保護環境，我把瓶子丟進回收桶。晚上我拿垃圾出去。",
                            "sampleSimplified": "为了保护环境，我把瓶子丢进回收桶。晚上我拿垃圾出去。"}}


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
    (ROOT / "data/academy/cc2-lesson07.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-reviewed-content.json"
    reviewed = json.loads(path.read_text())
    reviewed.update({
        "cc2-textbook-l07-t01": {"transcriptTraditional": "\n".join(f"{who}：{text}" for who, text, _ in DIALOGUE),
                                 "transcriptSimplified": "\n".join(f"{simplified(who)}：{simplified(text)}" for who, text, _ in DIALOGUE),
                                 "translationVi": "\n".join(f"{who}：{vi}" for who, _, vi in DIALOGUE)},
        "cc2-textbook-l07-t03": {"transcriptTraditional": "\n\n".join(text for text, _ in READING),
                                 "transcriptSimplified": "\n\n".join(simplified(text) for text, _ in READING),
                                 "translationVi": "\n\n".join(vi for _, vi in READING)},
    })
    path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    path = ROOT / "data/academy/cc2-script-map.json"
    script_map = json.loads(path.read_text())
    vocabulary = json.loads((ROOT / "data/academy/cc2-lesson07-vocabulary.json").read_text())
    script_map.update({char: CONVERT.convert(char) for char in set("".join(strings(lesson)) + "".join(strings(vocabulary))) if CONVERT.convert(char) != char})
    path.write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(DIALOGUE)} turns, {len(READING)} paragraphs, {len(lesson['vocabulary']['wordIds'])} words")


if __name__ == "__main__":
    main()
