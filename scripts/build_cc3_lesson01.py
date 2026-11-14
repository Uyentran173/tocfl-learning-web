"""Build reviewed Volume 3 Lesson 01 from textbook pages 1–19.

The Traditional dialogue/reading and numbered vocabulary were checked against
the visible textbook. Vietnamese instruction, examples and quizzes are Tai Wén
learning content. Workbook recordings have no invented transcript or answer key.
"""

from __future__ import annotations

import json

from cc3_lesson_builder import ROOT, make_question, sentence, simplified, write_spec
from pypinyin import Style, lazy_pinyin

# Textbook vocabulary I (pages 5–7), followed by vocabulary II (pages 9–10).
# Traditional | Pinyin | Vietnamese | class | example | example translation.
VOCAB = """安德思|Ān Désī|An Đức Tư (tên người)|danh từ riêng|安德思這學期選了新課。|Học kỳ này An Đức Tư chọn môn mới.
羅珊蒂|Luó Shāndì|La San Đế (tên người)|danh từ riêng|羅珊蒂跟安德思是同學。|La San Đế và An Đức Tư là bạn cùng lớp.
何雅婷|Hé Yǎtíng|Hà Nhã Đình (tên người)|danh từ riêng|何雅婷想轉到別的科系。|Hà Nhã Đình muốn chuyển sang khoa khác.
開學|kāixué|khai giảng; bắt đầu học kỳ|động từ|下個星期開學，我還沒選課。|Tuần sau khai giảng mà tôi vẫn chưa chọn môn.
班|bān|lớp học|danh từ|我們班有二十個學生。|Lớp chúng tôi có hai mươi học sinh.
新生|xīnshēng|học sinh, sinh viên mới|danh từ|這個班的學生都是新生。|Học sinh trong lớp này đều là người mới.
嚴|yán|nghiêm khắc|tính từ|老師很嚴，可是教得很好。|Thầy rất nghiêm nhưng dạy rất hay.
口試|kǒushì|thi vấn đáp|danh từ|下週的口試，我還沒準備好。|Tôi vẫn chưa chuẩn bị xong cho bài thi vấn đáp tuần tới.
筆試|bǐshì|thi viết|danh từ|筆試在星期五上午。|Bài thi viết diễn ra sáng thứ Sáu.
以外|yǐwài|ngoài; ngoại trừ|danh từ|除了筆試以外，還有口試。|Ngoài thi viết còn có thi vấn đáp.
口頭|kǒutóu|bằng lời nói; nói miệng|tính từ|我們要做一次口頭報告。|Chúng tôi phải thuyết trình miệng một lần.
報告|bàogào|bài báo cáo; báo cáo|danh từ|明天的報告，我準備好了。|Tôi đã chuẩn bị xong bài báo cáo ngày mai.
壓力|yālì|áp lực|danh từ|考試太多，我覺得壓力很大。|Thi nhiều quá, tôi cảm thấy rất áp lực.
說明|shuōmíng|giải thích; lời hướng dẫn|danh từ|老師的說明很清楚。|Lời giải thích của thầy rất rõ ràng.
清楚|qīngchǔ|rõ ràng|tính từ|請再說一次，我聽不清楚。|Xin nói lại một lần, tôi nghe không rõ.
位子|wèizi|chỗ ngồi; suất học|danh từ|這個班還有位子嗎？|Lớp này còn chỗ không?
旁聽|pángtīng|dự thính|động từ|我想去旁聽王教授的課。|Tôi muốn dự thính môn của giáo sư Vương.
分|fēn|điểm số|danh từ|我這次考了八十分。|Lần này tôi được tám mươi điểm.
羨慕|xiànmù|ngưỡng mộ; ghen tị|động từ|我很羨慕你有獎學金。|Tôi rất ngưỡng mộ bạn có học bổng.
休學|xiūxué|tạm nghỉ học|động từ|她決定休學一年。|Cô ấy quyết định nghỉ học một năm.
用功|yònggōng|chăm học; chăm chỉ|tính từ|他每天都很用功念書。|Ngày nào cậu ấy cũng chăm chỉ học.
行|xíng|được; ổn|tính từ|明天見面，行嗎？|Ngày mai gặp nhau, được không?
轉|zhuǎn|chuyển; đổi|động từ|她想轉到國際關係系。|Cô ấy muốn chuyển sang khoa Quan hệ quốc tế.
原來|yuánlái|ban đầu; vốn dĩ|phó từ|她原來念會計系。|Ban đầu cô ấy học khoa Kế toán.
會計|kuàijì|kế toán|danh từ|我姐姐在大學念會計。|Chị tôi học kế toán ở đại học.
熱門|rèmén|được ưa chuộng; có nhu cầu cao|tính từ|這個科系今年很熱門。|Năm nay khoa này rất được ưa chuộng.
熬夜|áoyè|thức khuya|động từ|我昨天熬夜準備考試。|Hôm qua tôi thức khuya chuẩn bị thi.
當|dāng|trượt môn|động từ|他差一點被當了。|Cậu ấy suýt bị đánh trượt môn.
恐怕|kǒngpà|e rằng; có lẽ (điều bất lợi)|phó từ|現在出門，恐怕會遲到。|Giờ mới ra khỏi nhà, e rằng sẽ muộn.
口才|kǒucái|tài ăn nói|danh từ|她口才很好，適合做報告。|Cô ấy nói năng giỏi, hợp thuyết trình.
事|shì|việc; chuyện|danh từ|我有一件事想跟你討論。|Tôi có một việc muốn bàn với bạn.
遲到|chídào|đến muộn|động từ|上課不要遲到。|Đừng đến lớp muộn.
差一點|chàyìdiǎn|suýt nữa|cụm từ|我差一點忘了交報告。|Tôi suýt quên nộp báo cáo.
這樣下去|zhèyàng xiàqù|cứ tiếp tục như thế này|cụm từ|這樣下去，你會太累。|Cứ thế này thì bạn sẽ quá mệt.
沒辦法|méi bànfǎ|không có cách; không thể|cụm từ|今天沒位子，我沒辦法旁聽。|Hôm nay hết chỗ, tôi không thể dự thính.
獨生女|dúshēngnǚ|con gái một|danh từ|她是家裡的獨生女。|Cô ấy là con gái một trong nhà.
私立|sīlì|tư thục; tư nhân|tính từ|她從小念私立學校。|Từ nhỏ cô ấy học trường tư.
理想|lǐxiǎng|lý tưởng; mong muốn|tính từ|她考上了理想的大學。|Cô ấy đỗ vào trường đại học mong muốn.
合|hé|hợp; phù hợp|động từ|這個科系跟她的興趣不合。|Khoa này không hợp sở thích của cô ấy.
痛苦|tòngkǔ|đau khổ; khổ sở|tính từ|每天念不喜歡的課，她覺得很痛苦。|Ngày nào cũng học môn mình không thích, cô ấy thấy rất khổ.
科系|kēxì|khoa; ngành học|danh từ|你想選哪一個科系？|Bạn muốn chọn ngành nào?
放棄|fàngqì|từ bỏ|động từ|遇到困難也不要輕易放棄。|Gặp khó khăn cũng đừng dễ dàng bỏ cuộc.
不管|bùguǎn|bất kể; dù|liên từ|不管多忙，她都會念書。|Dù bận đến đâu, cô ấy vẫn học.
反對|fǎnduì|phản đối|động từ|媽媽一開始反對她轉系。|Ban đầu mẹ phản đối cô ấy chuyển ngành.
個性|gèxìng|tính cách|danh từ|她的個性很活潑。|Tính cô ấy rất hoạt bát.
活潑|huópō|hoạt bát; năng động|tính từ|這個孩子很活潑。|Đứa trẻ này rất hoạt bát.
外語|wàiyǔ|ngoại ngữ|danh từ|她很喜歡學外語。|Cô ấy rất thích học ngoại ngữ.
擔心|dānxīn|lo lắng|động từ|媽媽很擔心她的未來。|Mẹ rất lo cho tương lai của cô ấy.
填|tián|điền vào|động từ|請先填這張表。|Xin hãy điền mẫu này trước.
表|biǎo|biểu mẫu; tờ khai|danh từ|轉系需要填一張表。|Chuyển ngành cần điền một tờ khai.
辦|bàn|làm; xử lý (thủ tục)|động từ|她正在辦轉系的手續。|Cô ấy đang làm thủ tục chuyển ngành.
手續|shǒuxù|thủ tục|danh từ|申請獎學金要辦什麼手續？|Xin học bổng cần làm thủ tục gì?
申請|shēnqǐng|nộp đơn; xin|động từ|她申請了獎學金。|Cô ấy đã nộp đơn xin học bổng.
成績單|chéngjìdān|bảng điểm|danh từ|申請時要交成績單。|Khi nộp đơn phải nộp bảng điểm.
考上|kǎoshàng|thi đỗ vào|động từ|她考上了理想的大學。|Cô ấy thi đỗ vào trường đại học mong muốn.
推薦信|tuījiànxìn|thư giới thiệu|danh từ|教授幫她寫了推薦信。|Giáo sư đã giúp cô ấy viết thư giới thiệu."""


def build_vocabulary() -> None:
    records = []
    for number, line in enumerate(VOCAB.splitlines(), 1):
        traditional, pinyin, meaning, word_class, example, translation = line.split("|")
        records.append({
            "id": f"cc3-v3-l01-v{number:03d}", "traditional": traditional,
            "simplified": simplified(traditional), "pinyin": pinyin,
            "meaningVi": meaning, "wordClass": word_class,
            "exampleTraditional": example, "exampleSimplified": simplified(example),
            "exampleVi": translation,
        })
    assert len(records) == 56
    path = ROOT / "data/academy/cc3-lesson01-vocabulary.json"
    path.write_text(json.dumps({"lessonId": "cc3-v3-l01", "records": records}, ensure_ascii=False, indent=2) + "\n")


SPEC = {
    "number": 1, "title": "開學了", "titleVi": "Khai giảng rồi",
    "description": "Bài học về chọn lớp, chuyển ngành và học bổng qua hội thoại và bài đọc của Tập 3.",
    "objectives": [
        "Trao đổi về lớp học, kỳ thi, học bổng và việc chuyển ngành.",
        "Dùng …的話, 不到, 差一點 và 恐怕 để nói điều kiện, số lượng và dự đoán.",
        "Kể một kết quả khó đạt được và diễn tả quyết định bất ngờ bằng 好不容易 và 說…就….",
        "Diễn đạt việc không đổi dù điều kiện thay đổi bằng 不管…都….",
    ],
    "introduction": "Ngày đầu học kỳ, An Đức Tư và La San Đế kể về lớp mới. Hà Nhã Đình cũng chia sẻ lý do chuyển ngành. Hãy nghe hội thoại trước, rồi đọc bài về quyết định của cô ấy.",
    "sections": [
        ("Chuyện lớp mới", "Chú ý cách hai người hỏi về bạn học, giáo viên và áp lực học tập. Ngoài 口試 và 筆試, lớp của An Đức Tư còn có bài báo cáo miệng.", "我們這學期除了每一課的口試、筆試以外，還要做兩次口頭報告。", "Học kỳ này, ngoài thi vấn đáp và thi viết của mỗi bài, chúng tôi còn phải thuyết trình miệng hai lần."),
        ("Một quyết định có lý do", "Hà Nhã Đình chuyển ngành vì ngành cũ không hợp sở thích. Đọc để tìm điều cô ấy nói với mẹ và thủ tục sau khi mẹ đồng ý.", "她想了很久，決定跟媽媽討論轉系的事。", "Cô ấy suy nghĩ rất lâu rồi quyết định bàn chuyện chuyển ngành với mẹ."),
    ],
    "dialogueTitle": "Ngày đầu học kỳ", "dialogueContext": "An Đức Tư và La San Đế nói chuyện sau giờ học; Hà Nhã Đình đi ngang qua.",
    "dialogue": [
        ("安德思", "羅珊蒂，下課啦！怎麼樣？你們班上有我們上個學期的同學嗎？", "La San Đế, tan học rồi! Thế nào? Lớp bạn có ai học cùng chúng ta học kỳ trước không?"),
        ("羅珊蒂", "沒有，都沒有。你們班怎麼樣？", "Không, chẳng có ai cả. Lớp bạn thế nào?"),
        ("安德思", "都是新生，我一個也不認識，而且只有我一個男的。", "Toàn sinh viên mới, tôi chẳng quen ai, mà còn chỉ có mình tôi là nam."),
        ("羅珊蒂", "老師呢？老師怎麼樣？", "Còn giáo viên? Thầy thế nào?"),
        ("安德思", "老師很嚴。他說我們這學期除了每一課的口試、筆試以外，還要做兩次口頭報告。我覺得壓力好大。你們班呢？", "Thầy rất nghiêm. Thầy bảo học kỳ này ngoài thi vấn đáp và thi viết mỗi bài, chúng tôi còn phải thuyết trình hai lần. Tôi thấy áp lực quá. Còn lớp bạn?"),
        ("羅珊蒂", "老師的說明很清楚，同學也很熱情。我們今天就一起去吃中飯了。", "Thầy giải thích rất rõ, các bạn cũng nhiệt tình. Hôm nay chúng tôi đã cùng đi ăn trưa."),
        ("安德思", "聽起來不錯。還有位子嗎？有位子的話，我想去旁聽。", "Nghe hay đấy. Còn chỗ không? Nếu còn, tôi muốn đến dự thính."),
        ("羅珊蒂", "你想換班啊？你不是打算在台灣上大學嗎？老師嚴才學得快，學得好啊。", "Bạn muốn đổi lớp à? Chẳng phải bạn định học đại học ở Đài Loan sao? Thầy nghiêm thì mới học nhanh, học tốt được."),
        ("安德思", "可是我是獎學金學生。要是成績不到80分，拿不到獎學金，就得回國了。", "Nhưng tôi là sinh viên nhận học bổng. Nếu điểm không đạt 80, không lấy được học bổng, tôi phải về nước."),
        ("羅珊蒂", "我真羨慕你有獎學金。不像我休學來台灣，花的都是父母的錢，一定得用功念書才行。", "Tôi thật ngưỡng mộ bạn có học bổng. Tôi tạm nghỉ học để đến Đài Loan, tiêu toàn tiền của bố mẹ nên nhất định phải chăm học."),
        ("安德思", "何雅婷，聽說妳轉系了？", "Hà Nhã Đình, nghe nói bạn chuyển ngành rồi?"),
        ("何雅婷", "是啊，這個學期我轉到國際關係系去了。", "Đúng vậy, học kỳ này tôi chuyển sang ngành Quan hệ quốc tế."),
        ("安德思", "妳原來念的會計系不是很熱門嗎？怎麼不念了？", "Ngành Kế toán bạn học trước đây chẳng phải rất được ưa chuộng sao? Sao bạn không học nữa?"),
        ("何雅婷", "我念不下去了。我每天熬夜念書，可是還是差一點被當。這樣下去，四年恐怕沒辦法畢業。", "Tôi không học tiếp nổi. Ngày nào tôi cũng thức khuya học mà vẫn suýt trượt môn. Cứ thế này, e là bốn năm cũng không tốt nghiệp được."),
        ("羅珊蒂", "念國際關係很適合妳。妳的英文那麼流利，口才又好，以後可以當外交人員。", "Ngành Quan hệ quốc tế rất hợp với bạn. Tiếng Anh của bạn lưu loát, lại ăn nói giỏi; sau này có thể làm nhà ngoại giao."),
        ("何雅婷", "謝謝妳這麼說。我真想多跟你們聊聊。可惜我得走了，我跟教授約好了討論選課的事，不能遲到。再見。", "Cảm ơn bạn. Tôi muốn nói chuyện thêm, nhưng tiếc là phải đi. Tôi đã hẹn với giáo sư bàn chuyện chọn môn, không thể đến muộn. Tạm biệt."),
    ],
    "readingTitle": "Hà Nhã Đình muốn chuyển ngành", "readingContext": "Bài đọc kể rõ lý do và thủ tục chuyển ngành.",
    "reading": [
        ("何雅婷是家裡的獨生女。從小父母讓她念私立小學，下了課還去學西班牙文、書法、游泳跟網球。何雅婷也沒讓父母失望，成績一直都很好，還考上了理想的大學，念的是熱門的會計系。沒想到才念了一個學期，她就發現跟她的興趣不合，念起來非常痛苦。她想了很久，決定跟媽媽討論轉系的事。", "Hà Nhã Đình là con gái một. Từ nhỏ, bố mẹ cho cô học trường tiểu học tư và sau giờ học còn học tiếng Tây Ban Nha, thư pháp, bơi lội, quần vợt. Cô không phụ lòng bố mẹ: thành tích luôn tốt, còn thi đỗ đại học mong muốn, vào ngành Kế toán được nhiều người chọn. Nhưng mới học một học kỳ, cô nhận ra ngành không hợp sở thích và thấy việc học rất khổ sở. Sau nhiều suy nghĩ, cô quyết định bàn chuyện chuyển ngành với mẹ."),
        ("媽媽聽到何雅婷打算轉到國際關係系，非常生氣。她覺得何雅婷好不容易才考上這麼好的科系，怎麼可以說放棄就放棄？而且，念會計系工作機會比較多。跟興趣比起來，將來的發展當然更重要。如果她真的對別的課有興趣，利用時間去旁聽就好了。不管何雅婷怎麼說，她都反對。", "Mẹ rất giận khi nghe cô định chuyển sang ngành Quan hệ quốc tế. Bà nghĩ con gái vất vả lắm mới đỗ vào một ngành tốt như vậy, sao có thể nói bỏ là bỏ? Hơn nữa, học Kế toán có nhiều cơ hội việc làm hơn; so với sở thích, triển vọng sau này quan trọng hơn. Nếu thích môn khác thì cứ tranh thủ đến dự thính. Dù Nhã Đình nói gì, mẹ vẫn phản đối."),
        ("不過何雅婷告訴媽媽，她個性活潑，而且外語能力不錯，如果念國際關係，會有更好的成績，請媽媽不必擔心她的將來。這一次就請媽媽讓她自己決定吧。媽媽想了又想，捨不得女兒念得這麼痛苦，最後還是同意了。何雅婷聽了非常高興，她立刻上網填表辦轉系的手續，申請上學期的成績單，然後還請教授幫她寫推薦信。", "Nhã Đình giải thích rằng cô hoạt bát, ngoại ngữ cũng khá; nếu học Quan hệ quốc tế, cô sẽ có kết quả tốt hơn nên mẹ không cần lo cho tương lai của cô. Lần này cô xin được tự quyết định. Mẹ suy nghĩ mãi, không nỡ để con học khổ sở như thế nên cuối cùng đồng ý. Nhã Đình rất vui, lập tức lên mạng điền biểu mẫu làm thủ tục chuyển ngành, xin bảng điểm học kỳ trước rồi nhờ giáo sư viết thư giới thiệu."),
    ],
    "checks": [
        ("Vì sao An Đức Tư lo lắng về lớp học?", "Lớp nhiều bài kiểm tra và báo cáo, trong khi anh cần giữ học bổng.", ["Anh không thích các bạn mới.", "Anh muốn bỏ học ngay."], "Anh nói mình thấy áp lực; nếu điểm dưới 80 sẽ không có học bổng.", "Đọc hội thoại"),
        ("Vì sao Hà Nhã Đình muốn chuyển ngành?", "Ngành Kế toán không hợp sở thích, cô học rất khổ sở.", ["Cô muốn học gần nhà hơn.", "Cô chưa từng đỗ vào đại học."], "Bài đọc nêu rõ 興趣不合 và 念起來非常痛苦.", "Đọc bài"),
    ],
    "grammar": [
        ("…的話 — nếu", "Đặt 的話 sau điều kiện; kết quả nằm ở vế sau. Đây là cách nói tự nhiên trong hội thoại. Có thể đi cùng 如果 hoặc 要是 khi muốn làm rõ giả định. Không đặt 的話 ở cuối vế kết quả.", "điều kiện + 的話，kết quả", ("有位子的話，我想去旁聽。", "Nếu còn chỗ, tôi muốn đến dự thính."), ("你想轉系的話，最好先跟父母討論。", "Nếu muốn chuyển ngành, tốt nhất hãy bàn với bố mẹ trước."), "Đừng viết 我想去旁聽的話，有位子 để diễn đạt ‘nếu còn chỗ’ vì như vậy đổi mất điều kiện.", "有位子＿＿，我想去旁聽。", "的話", ["以外", "不到"]),
        ("不到 — chưa đến", "不到 đứng ngay trước số lượng để nói chưa đạt mốc ấy. Trong bài, điểm dưới 80 có thể khiến An Đức Tư mất học bổng. Mẫu này khác với 不到 nơi chốn trong câu ‘không đến được’.", "不到 + con số / thời lượng / khoảng cách", ("要是成績不到80分，就拿不到獎學金。", "Nếu điểm chưa đạt 80 thì không lấy được học bổng."), ("從這裡走到學校不到十分鐘。", "Đi bộ từ đây đến trường chưa tới mười phút."), "Đặt con số sau 到; 不到80分 nghĩa là ít hơn 80 điểm, không phải đúng 80.", "他等了＿＿十分鐘。", "不到", ["恐怕", "不管"]),
        ("差一點（就）… — suýt nữa", "Dùng khi một sự việc gần xảy ra nhưng rốt cuộc đã không xảy ra; 就 có thể lược. Trong bài, Hà Nhã Đình suýt trượt môn, không phải đã trượt. So với 差不多 ‘xấp xỉ’, 差一點 nhấn mạnh ranh giới giữa có và không xảy ra.", "差一點（就）+ động từ / kết quả", ("我每天熬夜念書，可是還是差一點被當。", "Ngày nào tôi cũng thức khuya học mà vẫn suýt trượt môn."), ("昨天我差一點忘了交報告。", "Hôm qua tôi suýt quên nộp báo cáo."), "Đừng dịch 差一點被當 thành ‘đã trượt môn’; sự việc chỉ suýt xảy ra.", "我＿＿忘了帶成績單。", "差一點", ["不管", "以外"]),
        ("恐怕 — e rằng", "Dùng khi người nói dự đoán một khả năng không mong muốn. Nó cho thấy thái độ lo lắng, khác với 可能 trung tính hơn. Trong hội thoại, Hà Nhã Đình lo sẽ không thể tốt nghiệp đúng hạn.", "恐怕 + tình huống bất lợi", ("這樣下去，四年恐怕沒辦法畢業。", "Cứ thế này, e là bốn năm cũng không tốt nghiệp được."), ("再晚一點出門，恐怕會遲到。", "Ra khỏi nhà muộn hơn nữa thì e là sẽ đến trễ."), "恐怕 không khẳng định điều đó chắc chắn xảy ra; đây là dự đoán của người nói.", "現在出門，＿＿會遲到。", "恐怕", ["不到", "以外"]),
        ("好不容易（才）… — vất vả lắm mới", "Nói về kết quả đạt được sau nhiều khó khăn; 才 làm nổi bật sự vất vả ấy. Mẹ Nhã Đình cho rằng cô đã cố gắng rất nhiều mới đỗ vào ngành Kế toán. Không dùng mẫu này cho việc dễ dàng, không cần nỗ lực.", "好不容易（才）+ đạt được kết quả", ("她好不容易才考上這麼好的科系。", "Cô ấy vất vả lắm mới đỗ vào ngành tốt như vậy."), ("我好不容易才拿到獎學金。", "Tôi vất vả lắm mới nhận được học bổng."), "好不容易 không có nghĩa ‘không dễ’ theo nghĩa phủ định đơn thuần; cả cụm nêu một kết quả cuối cùng đã đạt được.", "她＿＿才考上理想的大學。", "好不容易", ["差一點", "不到"]),
        ("說…就… — nói là làm ngay", "Lặp động từ ở hai vế để thể hiện hành động xảy ra bất ngờ hoặc nhanh hơn người nói tưởng. Mẹ trách Nhã Đình ‘nói bỏ là bỏ’ ngành đã khó khăn mới thi đỗ. Mẫu này thường mang sắc thái ngạc nhiên hay không hài lòng.", "說 + động từ， 就 + cùng động từ", ("怎麼可以說放棄就放棄？", "Sao có thể nói bỏ là bỏ ngay?"), ("他說走就走，沒告訴我們。", "Anh ấy nói đi là đi, không báo cho chúng tôi."), "Hai động từ trong 說V就V phải khớp nhau; nếu khác, ý ‘nói là làm ngay’ không còn rõ.", "他說＿＿就走，大家都很吃驚。", "走", ["來", "去"]),
        ("不管…都… — dù thế nào vẫn", "Nêu một điều kiện có thể thay đổi, nhưng kết quả sau 都 không đổi. Trong bài, mẹ Nhã Đình phản đối dù cô giải thích thế nào. Sau 不管 thường dùng từ để hỏi như 怎麼 hoặc cặp lựa chọn.", "不管 + điều kiện， chủ thể + 都 + kết quả", ("不管何雅婷怎麼說，她都反對。", "Dù Nhã Đình nói thế nào, bà vẫn phản đối."), ("不管工作多忙，他每天都運動。", "Dù công việc bận thế nào, ngày nào anh ấy cũng tập thể dục."), "Đừng bỏ 都 ở vế kết quả khi dùng mẫu 不管…都… trong bài này.", "不管她怎麼說，媽媽＿＿反對。", "都", ["才", "就"]),
    ],
    "listening": [
        ("Nghe hội thoại: vì sao An Đức Tư quan tâm điểm số?", "Vì điểm dưới 80 thì anh không giữ được học bổng.", ["Vì anh đã thi trượt tất cả các môn.", "Vì anh không muốn học ở Đài Loan nữa."], "Anh nói 要是成績不到80分，拿不到獎學金，就得回國了.", "Nghe hiểu hội thoại", 1),
        ("Nghe hội thoại: Hà Nhã Đình chuyển sang ngành nào?", "Quan hệ quốc tế", ["Kế toán", "Ngoại ngữ"], "Cô nói 這個學期我轉到國際關係系去了.", "Nghe hiểu hội thoại", 1),
        ("Nghe bài đọc: sau khi mẹ đồng ý, Hà Nhã Đình làm gì?", "Cô lên mạng làm thủ tục chuyển ngành, xin bảng điểm và thư giới thiệu.", ["Cô bỏ học và về quê ngay.", "Cô đăng ký lại ngành Kế toán."], "Bài đọc kết thúc bằng ba việc: điền mẫu, xin bảng điểm và nhờ giáo sư viết thư.", "Nghe hiểu bài đọc", 3),
        ("Nghe bài đọc: mẹ Hà Nhã Đình lo điều gì?", "Triển vọng việc làm và tương lai của con", ["Con không biết ngoại ngữ", "Con không thích đi học"], "Bà cho rằng cơ hội việc làm của ngành Kế toán nhiều hơn và tương lai quan trọng hơn sở thích.", "Nghe hiểu bài đọc", 3),
    ],
    "practice": [
        ("Điền: 有位子的＿＿，我想去旁聽。", "話", ["分", "班"], "的話 đánh dấu điều kiện ‘nếu còn chỗ’.", "Điều kiện",),
        ("Trong bài, dưới bao nhiêu điểm thì An Đức Tư không được học bổng?", "80", ["60", "100"], "Anh nói 成績不到80分 thì sẽ không có học bổng.", "Đọc hiểu"),
        ("Điền: 我差一點＿＿當了。", "被", ["把", "在"], "被當 nghĩa là bị đánh trượt môn; 差一點 chỉ việc suýt xảy ra.", "Ngữ pháp"),
        ("Mẹ Nhã Đình ban đầu nghĩ gì về ngành Kế toán?", "Có nhiều cơ hội việc làm hơn.", ["Không hợp tính cách của bà.", "Chẳng có tương lai."], "Bà nói 念會計系工作機會比較多.", "Đọc hiểu"),
        ("Điền: 不管她怎麼說，媽媽＿＿反對。", "都", ["才", "了"], "Không đổi kết quả dù lời giải thích thay đổi: 不管…都….", "Ngữ pháp"),
        ("Hà Nhã Đình hoàn tất thủ tục sau khi ai đồng ý?", "Mẹ cô ấy", ["An Đức Tư", "La San Đế"], "Mẹ cuối cùng 同意了, rồi Hà Nhã Đình mới điền biểu mẫu.", "Đọc hiểu"),
        ("Điền: 她好不容易＿＿考上理想的大學。", "才", ["都", "的話"], "好不容易才 nhấn mạnh kết quả sau nhiều cố gắng.", "Ngữ pháp"),
        ("Điền: 他說走＿＿走，沒有先通知我。", "就", ["都", "不到"], "說V就V diễn đạt hành động xảy ra rất nhanh, bất ngờ.", "Ngữ pháp"),
    ],
    "assessment": [
        ("Trong hội thoại, lớp của An Đức Tư có thêm việc gì ngoài thi viết và thi vấn đáp?", "Hai bài báo cáo miệng", ["Hai chuyến đi thực tế", "Một cuộc phỏng vấn"], "除了…以外，還要做兩次口頭報告.", "Đọc hội thoại"),
        ("旁聽 nghĩa là gì?", "Dự thính một lớp học", ["Đăng ký lại môn", "Thi vấn đáp"], "有位子的話，我想去旁聽: nếu còn chỗ, anh muốn ngồi học dự thính.", "Từ vựng"),
        ("Câu nào diễn đạt ‘suýt trượt môn’ đúng?", "差一點被當", ["已經被當", "好不容易被當"], "差一點 nói việc gần xảy ra nhưng chưa xảy ra.", "Ngữ pháp"),
        ("不到80分 nghĩa là gì?", "Dưới 80 điểm", ["Đúng 80 điểm", "Trên 80 điểm"], "不到 + số lượng nghĩa là chưa đạt mốc đó.", "Ngữ pháp"),
        ("Tại sao Hà Nhã Đình muốn chuyển khỏi ngành Kế toán?", "Ngành không hợp sở thích và khiến cô học rất khổ sở.", ["Cô không được nhận học bổng.", "Ngành mới học gần nhà hơn."], "Bài đọc viết 跟她的興趣不合，念起來非常痛苦.", "Đọc bài"),
        ("好不容易才考上 nghĩa là gì?", "Vất vả lắm mới thi đỗ vào", ["Dễ dàng thi đỗ vào", "Suýt thi đỗ vào"], "好不容易才 nhấn mạnh kết quả đạt sau nhiều cố gắng.", "Ngữ pháp"),
        ("Điền: 不管天氣怎麼樣，我＿＿要去上課。", "都", ["才", "就"], "不管…都… diễn đạt kết quả vẫn giữ nguyên.", "Ngữ pháp"),
        ("Hà Nhã Đình xin giáo sư giúp việc gì?", "Viết thư giới thiệu", ["Đổi điểm thi", "Đóng học phí"], "Đoạn cuối nói 請教授幫她寫推薦信.", "Đọc bài"),
        ("Điền: 有位子的＿＿，我想去旁聽。", "話", ["班", "分"], "Có chỗ là điều kiện; 的話 đặt sau vế điều kiện.", "Ngữ pháp"),
        ("Trong bài đọc, mẹ Hà Nhã Đình cuối cùng quyết định thế nào?", "Đồng ý cho con chuyển ngành", ["Vẫn phản đối", "Bắt con tạm nghỉ học"], "Mẹ suy nghĩ rồi 同意了.", "Đọc bài"),
    ],
    "writingTitle": "Giải thích một quyết định học tập", "writingPrompt": "Viết 3–4 câu tiếng Hoa: bạn đang học gì, gặp khó khăn nào và muốn thay đổi điều gì. Hãy thử dùng …的話 hoặc 恐怕.",
    "writingSample": "我原來念會計，可是跟我的興趣不合。這樣下去，我恐怕沒辦法繼續念。轉系的話，我想先跟家人討論。",
}

if __name__ == "__main__":
    build_vocabulary()
    write_spec(SPEC)
