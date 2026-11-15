"""Build reviewed Volume 5 Lesson 01 from textbook pp. 2–17 (PDF pp. 28–43).

The two readings are transcribed from the supplied textbook. Vietnamese teaching
copy, examples, and checks are original Tai Wén material. Audio mapping is kept
in the separate source manifest; this file does not infer tracks from filenames.
"""

from __future__ import annotations

import json
from pathlib import Path

from cc3_lesson_builder import CONVERT, make_question, sentence, simplified
from pypinyin import Style, lazy_pinyin

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "cc5-v5-l01"

# Textbook reading 1, PDF p. 28, checked against the rendered page.
READING_FOR = [
    ("「罵人垃圾，無罪！」「沒放颱風假？市長遭網友罵慘」……看到這樣的新聞，第一個反應可能是覺得太誇張了、不可思議，於是也上網發表文章，批評司法判決沒有道理、政府無能。能這麼做，是因為我們很幸運地生活在擁有言論自由的時代。", "Đọc tin như ‘Mắng người khác là rác mà vô tội’ hay ‘Thị trưởng bị cư dân mạng chỉ trích dữ dội vì không cho nghỉ bão’, ta có thể thấy quá đáng, khó tin rồi lên mạng viết bài phê phán phán quyết tư pháp hoặc sự bất lực của chính quyền. Ta làm được điều ấy vì may mắn sống trong thời đại có tự do ngôn luận."),
    ("言論自由，顧名思義，是指人人都有表達意見和想法的權利，這是民主制度的基礎。每個人都能接收各種來源的訊息，不受檢查及限制，也不必擔心說了什麼以後會被處罰。這樣的社會包容各種不同意見，即使是批評、反對也不例外。", "Tự do ngôn luận, đúng như tên gọi, là quyền của mọi người được bày tỏ ý kiến và suy nghĩ; đó là nền tảng của thể chế dân chủ. Ai cũng có thể tiếp nhận thông tin từ nhiều nguồn mà không bị kiểm duyệt, hạn chế hay lo bị phạt vì điều mình nói. Xã hội như vậy dung nạp những ý kiến khác nhau, kể cả lời phê bình và phản đối."),
    ("不論是在媒體上發表文章或上街抗議，都展現了言論自由的力量。正因為有言論自由，政府的決策受到人民的監督，無法胡作非為。想想看，一旦政府把發言權當做政治工具，民眾怎麼會不被洗腦？在言論被限制的情況下，還有人敢說真話嗎？人民又怎麼有機會爭取自己的權益？", "Đăng bài trên truyền thông hay xuống đường biểu tình đều thể hiện sức mạnh của tự do ngôn luận. Chính nhờ quyền ấy, quyết sách của chính phủ được người dân giám sát và chính phủ không thể làm bừa. Nếu quyền phát biểu biến thành công cụ chính trị, người dân dễ bị tẩy não; khi lời nói bị hạn chế, ai còn dám nói thật và đấu tranh cho quyền lợi của mình?"),
    ("人都有盲點，所以意見越是多元，不同立場的觀點越能得到平衡；當你受到批評，也有言論權來替自己辯護。如果有理，大家會跟你站在同一邊；若是無理取鬧，為反對而反對，也會有人跳出來批評指正。透過一來一往的討論和批評，真理將越辯越明，社會共識也慢慢形成。只有一種聲音的社會是無法進步的。", "Ai cũng có điểm mù. Ý kiến càng đa dạng, các góc nhìn khác lập trường càng có cơ hội cân bằng nhau. Khi bị phê bình, bạn cũng có quyền lên tiếng tự bảo vệ. Lý lẽ vững thì có người ủng hộ; phản đối vô cớ cũng sẽ có người chỉ ra sai sót. Qua tranh luận qua lại, sự thật sáng tỏ hơn và đồng thuận xã hội dần hình thành. Xã hội chỉ có một tiếng nói thì khó tiến bộ."),
    ("然而，每當提到媒體亂象，或是有人因為受不了網友的言論攻擊而自殺，大家就會開始批評言論過於自由。事實上，法律早就已經禁止發表仇恨性言論及不實謠言，那些仇恨性言論、不實內容所造成的霸凌現象，不是因為言論過於自由，而是因為那些人不懂得為自己的言論負責，誤解「言論自由」的意義。這是教育的問題，不該因此否定言論自由的價值，封住人民的嘴。", "Tuy nhiên, hễ nhắc đến sự hỗn loạn của truyền thông hay chuyện có người không chịu nổi lời công kích trên mạng mà tự sát, người ta lại trách tự do ngôn luận quá mức. Theo tác giả, pháp luật đã cấm ngôn từ thù hận và tin đồn sai sự thật; bắt nạt bắt nguồn từ việc một số người không chịu trách nhiệm về lời nói và hiểu sai tự do ngôn luận. Đây là vấn đề giáo dục, không nên vì vậy mà phủ nhận giá trị của quyền này hay bịt miệng người dân."),
    ("我們應該保護言論自由，因為這是讓有價值的想法，在這個混亂的時代裡，發出聲音的唯一方式。", "Chúng ta nên bảo vệ tự do ngôn luận, vì trong thời đại hỗn loạn, đó là cách duy nhất để những ý tưởng có giá trị được cất lên."),
]

# Textbook reading 2, PDF p. 38, checked column by column against the page.
READING_AGAINST = [
    ("在自由民主的社會裡，每個人都可以說出自己想說的話，不用擔心會因為反對政府、批評總統，甚至說錯一個字而被抓去關。可惜，很多人都濫用了這種自由。打開電視，名嘴們不是說著毫無根據的內容，就是隨意批評；網路上，鄉民躲在匿名制度的保護傘下，讓謠言滿天飛，或是自以為正義，惡意批評，引起更多的負面情緒。言論自由簡直成了這些人的護身符，難道他們都不需要為自己所說的話負責嗎？吵個不停，真理就會越辯越明嗎？", "Trong xã hội dân chủ tự do, ai cũng được nói điều mình nghĩ mà không sợ bị bắt giam vì phản đối chính phủ, chỉ trích tổng thống, thậm chí nói sai một chữ. Đáng tiếc, nhiều người lạm dụng quyền ấy. Trên truyền hình có người phát biểu thiếu căn cứ hoặc tùy tiện chỉ trích; trên mạng, có người núp sau chế độ ẩn danh để tung tin đồn, tự cho mình chính nghĩa và công kích ác ý. Tự do ngôn luận trở thành lá bùa che chắn cho họ. Tác giả đặt câu hỏi: họ không phải chịu trách nhiệm sao, và cãi mãi có thật làm chân lý sáng rõ hơn không?"),
    ("言論自由不能完全沒有限制，網路言論尤其如此。網路匿名方式讓許多人更大膽地表達意見，加上網路傳播速度快，因此影響力更強大、更驚人。然而，這股力量可能在人們有心或無意的情況下，對個人或社會造成威脅。的確，言論自由是每個人的權利，但是我們看到太多自由被濫用的例子。只要立場不同，就攻擊、諷刺，可是不見得每個人都能輕鬆面對這樣的言論。有人因此而得了憂鬱症，甚至自殺；多數人則選擇閉嘴不回應。網路鄉民以「言論自由」之名傷害別人，不正是破壞了言論自由嗎？", "Tự do ngôn luận không thể hoàn toàn không có giới hạn, đặc biệt là lời nói trên mạng. Ẩn danh khiến nhiều người mạnh dạn phát biểu hơn; tốc độ lan truyền nhanh làm ảnh hưởng càng lớn. Nhưng sức mạnh ấy, dù cố ý hay vô ý, cũng có thể đe dọa cá nhân và xã hội. Theo tác giả, bất đồng quan điểm dễ dẫn đến công kích, mỉa mai; có người vì vậy mắc trầm cảm hoặc tự sát, còn đa số chọn im lặng. Dùng danh nghĩa tự do ngôn luận để làm hại người khác cũng là phá hoại chính quyền tự do ấy."),
    ("除了網路，媒體人更應該管好自己的嘴巴。雖然目前有法律來處罰仇恨和歧視性言論，但事實上，媒體聰明得很，他們在標題加上「？」、「懷疑」或是「可能」這種模糊的方式，就是為了避開責任，法律根本處罰不到他們。名嘴們就更不用說了，他們擅長走在灰色地帶，就算被告，等法院判決確定，還不知得等多久，但傷害卻早就已經造成。", "Ngoài cư dân mạng, người làm truyền thông càng phải cẩn trọng lời nói. Dù đã có luật xử phạt ngôn từ thù hận và phân biệt đối xử, một số người dùng những từ mơ hồ như ‘nghi ngờ’, ‘có thể’ hoặc dấu hỏi trong tiêu đề để né trách nhiệm. Những người bình luận trên truyền hình càng giỏi đi trong vùng xám pháp lý: dù bị kiện, đến khi có phán quyết thì thiệt hại đã xảy ra từ lâu."),
    ("為了解決社會亂象，小自個人，大至媒體，在享受言論自由的同時，也必須承擔起相關責任；否則，政府就應該為了民眾安全與社會和諧而制定更嚴格的法律，約束已被濫用的言論自由。", "Để xử lý sự hỗn loạn của xã hội, từ cá nhân đến truyền thông, ai hưởng quyền tự do ngôn luận cũng phải gánh trách nhiệm tương ứng. Nếu không, theo tác giả, chính phủ nên ban hành luật nghiêm hơn để bảo vệ an toàn và sự hòa hợp xã hội, hạn chế việc lạm dụng quyền ấy."),
]

# Term, Vietnamese meaning, class, original example, Vietnamese example.
# Order follows the two New Words lists (including the seven opening terms).
WORDS = [
    ("言論", "lời nói; phát ngôn", "danh từ", "每個人都要為自己的言論負責。", "Mỗi người phải chịu trách nhiệm về lời mình nói."),
    ("界線", "ranh giới", "danh từ", "自由也需要有界線。", "Tự do cũng cần có ranh giới."),
    ("臉書", "Facebook", "danh từ", "市長的臉書上有許多留言。", "Trang Facebook của thị trưởng có nhiều bình luận."),
    ("則", "lượng từ cho mẩu tin, bình luận", "lượng từ", "這則留言引起了討論。", "Bình luận này đã khơi ra cuộc thảo luận."),
    ("留言", "bình luận; để lại lời nhắn", "danh từ/động từ", "請在文章下面留言。", "Hãy bình luận bên dưới bài viết."),
    ("停止", "dừng; ngừng", "động từ", "政府宣布停止上班上課。", "Chính phủ thông báo ngừng làm việc và học tập."),
    ("決策", "quyết sách; quyết định chính sách", "danh từ", "這項決策需要公開說明。", "Quyết sách này cần được giải thích công khai."),
    ("無罪", "vô tội", "tính từ", "法院判他無罪。", "Tòa tuyên anh ấy vô tội."),
    ("遭", "bị (gặp chuyện bất lợi)", "giới từ", "市長遭網友批評。", "Thị trưởng bị cư dân mạng chỉ trích."),
    ("慘", "thảm; rất nặng nề", "tính từ", "他在網路上被罵得很慘。", "Anh ấy bị mắng rất nặng trên mạng."),
    ("反應", "phản ứng", "danh từ/động từ", "大家對這個消息的反應不同。", "Mỗi người phản ứng khác nhau với tin này."),
    ("發表", "công bố; phát biểu", "động từ", "她在報紙上發表文章。", "Cô ấy đăng bài trên báo."),
    ("司法", "tư pháp", "danh từ", "司法判決應該受到尊重。", "Phán quyết tư pháp cần được tôn trọng."),
    ("判決", "phán quyết", "danh từ/động từ", "法院的判決引起爭議。", "Phán quyết của tòa gây tranh cãi."),
    ("無能", "bất lực; kém năng lực", "tính từ", "不能因一次錯誤就說政府無能。", "Không thể chỉ vì một sai lầm mà nói chính phủ bất lực."),
    ("幸運", "may mắn", "tính từ", "我們很幸運，能自由表達意見。", "Chúng ta may mắn vì được tự do bày tỏ ý kiến."),
    ("顧名思義", "đúng như tên gọi", "thành ngữ", "顧名思義，聊天室就是聊天的地方。", "Đúng như tên gọi, phòng chat là nơi trò chuyện."),
    ("接收", "tiếp nhận", "động từ", "我們每天接收大量訊息。", "Mỗi ngày chúng ta tiếp nhận rất nhiều thông tin."),
    ("來源", "nguồn gốc; nguồn tin", "danh từ", "分享之前要確認消息來源。", "Trước khi chia sẻ cần xác minh nguồn tin."),
    ("處罰", "xử phạt", "động từ", "違反法律的人可能受到處罰。", "Người vi phạm pháp luật có thể bị xử phạt."),
    ("包容", "bao dung; dung nạp", "động từ", "我們應該包容不同的意見。", "Chúng ta nên dung nạp những ý kiến khác nhau."),
    ("不論", "bất kể", "liên từ", "不論立場如何，都要尊重別人。", "Bất kể lập trường ra sao, ta đều cần tôn trọng người khác."),
    ("展現", "thể hiện", "động từ", "這場討論展現了多元觀點。", "Cuộc thảo luận thể hiện nhiều góc nhìn."),
    ("胡作非為", "làm bậy, bất chấp luật lệ", "thành ngữ", "有監督，掌權者才不能胡作非為。", "Có giám sát thì người cầm quyền mới không thể làm bậy."),
    ("一旦", "một khi", "liên từ", "一旦消息傳開，就很難收回。", "Một khi tin đã lan ra thì khó thu hồi."),
    ("工具", "công cụ", "danh từ", "網路是交流的工具。", "Mạng là công cụ giao tiếp."),
    ("洗腦", "tẩy não", "động từ", "假消息可能誤導甚至洗腦讀者。", "Tin giả có thể dẫn dắt sai, thậm chí tẩy não người đọc."),
    ("權益", "quyền và lợi ích", "danh từ", "人民有權爭取自己的權益。", "Người dân có quyền đấu tranh cho quyền lợi của mình."),
    ("盲點", "điểm mù trong nhận thức", "danh từ", "每個人的看法都可能有盲點。", "Góc nhìn của ai cũng có thể có điểm mù."),
    ("立場", "lập trường", "danh từ", "先了解對方的立場再回應。", "Hãy hiểu lập trường của đối phương rồi hãy trả lời."),
    ("平衡", "cân bằng", "danh từ/động từ", "不同觀點有助於取得平衡。", "Các góc nhìn khác nhau giúp tạo thế cân bằng."),
    ("辯護", "biện hộ; tự bảo vệ bằng lý lẽ", "động từ", "受到批評時，他公開替自己辯護。", "Khi bị chỉ trích, anh ấy công khai biện hộ cho mình."),
    ("無理取鬧", "gây chuyện vô lý", "thành ngữ", "討論問題時不要無理取鬧。", "Khi bàn vấn đề, đừng gây chuyện vô lý."),
    ("指正", "chỉ ra và sửa lỗi", "động từ", "如果我說錯了，請你指正。", "Nếu tôi nói sai, xin bạn chỉ ra và sửa giúp."),
    ("一來一往", "qua lại, đối đáp nhiều lượt", "thành ngữ", "雙方一來一往地交換意見。", "Hai bên trao đổi ý kiến qua lại."),
    ("真理", "chân lý; sự thật", "danh từ", "辯論不一定立刻找得到真理。", "Tranh luận chưa chắc tìm ra chân lý ngay."),
    ("越辯越明", "càng tranh luận càng sáng tỏ", "thành ngữ", "作者相信真理會越辯越明。", "Tác giả tin rằng chân lý càng tranh luận càng sáng tỏ."),
    ("共識", "đồng thuận", "danh từ", "討論後，大家慢慢形成共識。", "Sau thảo luận, mọi người dần đạt đồng thuận."),
    ("亂象", "tình trạng hỗn loạn", "danh từ", "假消息造成網路亂象。", "Tin giả gây ra tình trạng hỗn loạn trên mạng."),
    ("攻擊", "công kích; tấn công", "động từ", "不同意見不等於可以攻擊別人。", "Bất đồng không có nghĩa được công kích người khác."),
    ("自殺", "tự sát", "động từ", "文章提到有人因網路霸凌而自殺。", "Bài viết nhắc đến người tự sát vì bị bắt nạt trên mạng."),
    ("過於", "quá mức", "phó từ", "他認為這種說法過於簡單。", "Anh ấy cho rằng cách nói này quá đơn giản."),
    ("事實上", "thực ra; trên thực tế", "trạng ngữ", "事實上，法律已經有相關規定。", "Thực ra, pháp luật đã có quy định liên quan."),
    ("仇恨", "thù hận", "danh từ", "仇恨性言論可能傷害別人。", "Lời nói mang tính thù hận có thể làm hại người khác."),
    ("不實", "không đúng sự thật", "tính từ", "不要轉發不實消息。", "Đừng chia sẻ thông tin sai sự thật."),
    ("謠言", "tin đồn", "danh từ", "謠言在網路上傳得很快。", "Tin đồn lan rất nhanh trên mạng."),
    ("霸凌", "bắt nạt", "danh từ/động từ", "網路霸凌需要被正視。", "Cần nhìn nhận nghiêm túc nạn bắt nạt trên mạng."),
    ("負責", "chịu trách nhiệm", "động từ", "請為自己的言論負責。", "Hãy chịu trách nhiệm về lời mình nói."),
    ("誤解", "hiểu lầm; hiểu sai", "động từ", "不要誤解對方的意思。", "Đừng hiểu sai ý của người kia."),
    ("意義", "ý nghĩa", "danh từ", "我們要理解言論自由的意義。", "Ta cần hiểu ý nghĩa của tự do ngôn luận."),
    ("因此", "vì vậy; bởi thế", "liên từ", "資料不足，因此不能下結論。", "Chưa đủ dữ liệu, vì vậy chưa thể kết luận."),
    ("否定", "phủ nhận", "động từ", "不能因一個錯誤否定所有努力。", "Không thể vì một lỗi mà phủ nhận mọi nỗ lực."),
    ("價值", "giá trị", "danh từ", "自由有價值，也伴隨責任。", "Tự do có giá trị và đi kèm trách nhiệm."),
    ("封住", "bịt lại; chặn lại", "động từ", "批評不等於要封住別人的嘴。", "Phê bình không có nghĩa là bịt miệng người khác."),
    ("嘴", "miệng", "danh từ", "他張開嘴，卻沒有說話。", "Anh ấy mở miệng nhưng không nói gì."),
    ("混亂", "hỗn loạn", "tính từ", "混亂的資訊讓人難以判斷。", "Thông tin hỗn loạn khiến người ta khó phán đoán."),
    ("唯一", "duy nhất", "tính từ", "這不是唯一的解決方法。", "Đây không phải cách giải quyết duy nhất."),
    ("濫用", "lạm dụng", "động từ", "不能濫用言論自由傷害他人。", "Không thể lạm dụng tự do ngôn luận để hại người khác."),
    ("並非", "không hẳn; không phải", "phó từ", "反對限制並非支持霸凌。", "Phản đối hạn chế không có nghĩa ủng hộ bắt nạt."),
    ("不用", "không cần", "động từ năng nguyện", "你不用急著回答。", "Bạn không cần trả lời vội."),
    ("抓", "bắt giữ", "động từ", "警察依法抓人。", "Cảnh sát bắt người theo luật."),
    ("關", "giam giữ", "động từ", "他擔心說錯話會被抓去關。", "Anh ấy lo nói sai sẽ bị bắt giam."),
    ("名嘴", "người bình luận nổi tiếng trên truyền thông", "danh từ", "名嘴在節目上評論這件事。", "Bình luận viên nổi tiếng bàn chuyện này trên chương trình."),
    ("根據", "căn cứ", "danh từ/giới từ", "這個說法沒有根據。", "Lời khẳng định này không có căn cứ."),
    ("隨意", "tùy tiện", "phó từ", "不要隨意批評陌生人。", "Đừng tùy tiện chỉ trích người lạ."),
    ("鄉民", "cư dân mạng", "danh từ", "鄉民對新聞有不同看法。", "Cư dân mạng có nhiều cách nhìn về tin tức."),
    ("匿名", "ẩn danh", "tính từ/động từ", "她選擇匿名發表意見。", "Cô chọn đăng ý kiến ẩn danh."),
    ("正義", "công lý; chính nghĩa", "danh từ", "自以為正義不代表可以傷害別人。", "Tự cho mình đúng đắn không có nghĩa được hại người khác."),
    ("惡意", "ác ý", "danh từ/phó từ", "惡意留言會造成傷害。", "Bình luận ác ý có thể gây tổn thương."),
    ("情緒", "cảm xúc", "danh từ", "先平復情緒，再回應批評。", "Hãy bình tĩnh lại rồi trả lời lời chỉ trích."),
    ("成", "trở thành", "động từ", "自由不該成了傷人的理由。", "Tự do không nên trở thành cái cớ gây hại."),
    ("護身符", "bùa hộ mệnh; lá chắn", "danh từ", "不能把自由當成護身符。", "Không thể lấy tự do làm lá chắn."),
    ("傳播", "lan truyền", "động từ", "錯誤訊息傳播得很快。", "Thông tin sai lan truyền rất nhanh."),
    ("驚人", "đáng kinh ngạc", "tính từ", "網路的傳播速度十分驚人。", "Tốc độ lan truyền trên mạng thật đáng kinh ngạc."),
    ("股", "lượng từ cho luồng, sức mạnh", "lượng từ", "這股力量能改變社會。", "Sức mạnh này có thể thay đổi xã hội."),
    ("有心", "cố ý; có chủ tâm", "tính từ", "他是有心幫忙，不是想批評。", "Anh ấy có ý giúp đỡ, không định chỉ trích."),
    ("無意", "vô ý", "tính từ", "她無意傷害對方。", "Cô ấy không cố ý làm tổn thương đối phương."),
    ("威脅", "đe dọa; mối đe dọa", "danh từ/động từ", "假消息可能威脅公共安全。", "Tin giả có thể đe dọa an toàn công cộng."),
    ("諷刺", "mỉa mai", "động từ", "他沒有回答，只是諷刺對方。", "Anh ấy không trả lời mà chỉ mỉa mai người kia."),
    ("得", "mắc (bệnh)", "động từ", "長期失眠可能會得病。", "Mất ngủ kéo dài có thể khiến người ta mắc bệnh."),
    ("憂鬱症", "chứng trầm cảm", "danh từ", "憂鬱症需要專業協助。", "Trầm cảm cần được hỗ trợ chuyên môn."),
    ("則", "còn; trái lại (nối hai chủ thể)", "phó từ", "有人選擇抗議，多數人則保持沉默。", "Có người chọn phản đối, còn đa số giữ im lặng."),
    ("閉嘴", "im miệng", "động từ", "他受到攻擊後選擇閉嘴。", "Sau khi bị công kích, anh ấy chọn im lặng."),
    ("回應", "phản hồi", "danh từ/động từ", "她理性地回應批評。", "Cô ấy phản hồi lời chỉ trích một cách lý trí."),
    ("傷害", "gây tổn thương", "danh từ/động từ", "一句話也可能傷害別人。", "Một câu nói cũng có thể làm người khác tổn thương."),
    ("破壞", "phá hoại", "động từ", "惡意攻擊會破壞討論。", "Công kích ác ý sẽ phá hỏng cuộc thảo luận."),
    ("管", "quản; kiểm soát", "động từ", "媒體人應該管好自己的嘴巴。", "Người làm truyền thông nên kiểm soát lời nói của mình."),
    ("聰明", "thông minh; khôn khéo", "tính từ", "他聰明地避開了問題。", "Anh ấy khéo léo né câu hỏi."),
    ("標題", "tiêu đề", "danh từ", "這篇文章的標題很誇張。", "Tiêu đề bài này rất giật gân."),
    ("懷疑", "nghi ngờ", "động từ", "我懷疑這則消息不是真的。", "Tôi nghi tin này không có thật."),
    ("模糊", "mơ hồ", "tính từ", "這個說法太模糊，難以查證。", "Cách nói này quá mơ hồ để kiểm chứng."),
    ("擅長", "giỏi về", "động từ", "他擅長分析公共議題。", "Anh ấy giỏi phân tích các vấn đề công."),
    ("灰色", "màu xám", "tính từ", "這是一個灰色地帶的問題。", "Đây là một vấn đề thuộc vùng xám."),
    ("地帶", "khu vực; vùng", "danh từ", "法律的灰色地帶需要釐清。", "Vùng xám của pháp luật cần được làm rõ."),
    ("法院", "tòa án", "danh từ", "案件已經交給法院處理。", "Vụ việc đã được giao cho tòa án xử lý."),
    ("確定", "xác định; chắc chắn", "động từ", "法院尚未確定判決。", "Tòa chưa xác định phán quyết."),
    ("個人", "cá nhân", "danh từ", "從個人到媒體都要負責。", "Từ cá nhân đến truyền thông đều phải có trách nhiệm."),
    ("承擔", "gánh vác; chịu", "động từ", "說話的人要承擔責任。", "Người phát ngôn phải chịu trách nhiệm."),
    ("和諧", "hòa hợp", "tính từ", "尊重有助於社會和諧。", "Sự tôn trọng góp phần tạo hòa hợp xã hội."),
    ("制定", "ban hành; xây dựng", "động từ", "政府正在制定新規定。", "Chính phủ đang xây dựng quy định mới."),
    ("嚴格", "nghiêm ngặt", "tính từ", "新規定比以前更嚴格。", "Quy định mới nghiêm ngặt hơn trước."),
    ("約束", "ràng buộc; hạn chế", "động từ", "法律可以約束濫用自由的行為。", "Pháp luật có thể ràng buộc hành vi lạm dụng tự do."),
]

# Each point is taught where the source text introduces it. The explanations,
# contrast, and examples are authored in Vietnamese for independent learners.
GRAMMAR = [
    ("即使是…也不例外", "Ngay cả trường hợp tưởng là ngoại lệ cũng tuân theo quy tắc vừa nêu. Đặt 即使是 trước trường hợp được nhấn mạnh; 也不例外 ở cuối để khẳng định nó vẫn thuộc phạm vi ấy. Không dùng mẫu này khi muốn nói một ngoại lệ thật sự.", "Quy tắc chung， 即使是 + trường hợp đặc biệt + 也不例外。", ("每個人都要守法，即使是官員也不例外。", "Ai cũng phải tuân luật, kể cả quan chức."), ("她對所有學生都很有耐心，即使是最調皮的孩子也不例外。", "Cô kiên nhẫn với mọi học sinh, kể cả đứa trẻ nghịch nhất."), "Đừng dịch 即使 là ‘nếu’ ở đây: nó nhấn một trường hợp có vẻ khó tin, không đặt điều kiện.", "法律之前人人平等，____官員也不例外。", "即使是", ["一旦", "事實上"]),
    ("一旦…就／才…", "Nêu một tình huống có thể xảy ra và hệ quả sẽ đến sau. Dùng 就 khi hệ quả phát sinh ngay hoặc tự nhiên; dùng 才 khi kết quả chỉ có thể đạt được sau điều kiện đó. Ở bài này tác giả dùng mẫu để cảnh báo hậu quả của việc chính phủ kiểm soát phát ngôn.", "一旦 + tình huống， 就／才 + hệ quả。", ("一旦謠言傳開，就很難阻止。", "Một khi tin đồn lan ra, sẽ rất khó ngăn lại."), ("平時多練習，一旦發生災難，才有能力應變。", "Tập luyện thường xuyên thì khi thảm họa xảy ra mới có khả năng ứng phó."), "Đừng đổi 就 và 才 tùy ý: 就 nêu hệ quả kéo theo, 才 nhấn điều kiện cần để có kết quả.", "一旦消息傳開，____很難收回。", "就", ["則", "為"]),
    ("為…而…", "Dùng cùng một hành động làm mục đích lẫn lý do thực hiện: ‘làm X chỉ để làm X’. Trong câu 為反對而反對, tác giả phê bình việc phản đối chỉ để phản đối, không có lý lẽ. Sắc thái thường mang ý không tán thành, nhưng có thể trung tính tùy ngữ cảnh.", "為 + hành động／mục tiêu + 而 + cùng hành động。", ("不要為反對而反對，先聽聽理由。", "Đừng phản đối chỉ để phản đối; hãy nghe lý do trước."), ("他不是為寫作而寫作，而是想記錄生活。", "Anh ấy không viết chỉ để viết mà muốn ghi lại cuộc sống."), "Không dùng hai động từ không liên quan ở hai vị trí; chính sự lặp mới tạo nghĩa của mẫu.", "他沒有提出理由，只是為____而反對。", "反對", ["保護", "負責"]),
    ("事實上", "Dùng để bổ sung tình hình thực tế, thường sửa một suy đoán hoặc ấn tượng vừa nêu. Có thể dịch ‘thực ra’ hay ‘trên thực tế’. Trong bài đọc, nó mở phần tác giả bác lại quan điểm cho rằng tự do ngôn luận quá mức là nguyên nhân trực tiếp của bắt nạt.", "Ấn tượng／lời cho rằng A。事實上，sự thật B。", ("有人以為她不關心，事實上，她每天都在追蹤這件事。", "Có người tưởng cô không quan tâm; thực ra ngày nào cô cũng theo dõi việc này."), ("大家說網路沒有規定，事實上，相關法律早就存在。", "Người ta nói mạng không có quy định; thực ra luật liên quan đã có từ lâu."), "Đừng dùng 事實上 để giới thiệu một điều chưa được kiểm chứng rồi trình bày như sự thật.", "很多人以為沒有法律規範。____，法律早就有相關條文。", "事實上", ["一旦", "則"]),
    ("A 為 B 負責", "A là người phải gánh trách nhiệm đối với B, thường là lời nói, hành động, chính sách hay hậu quả. 為 nối người chịu trách nhiệm với phạm vi trách nhiệm; không nhầm với 為了 mang nghĩa ‘để’.", "Người／tổ chức + 為 + việc／hậu quả + 負責。", ("每個人都要為自己的言論負責。", "Mỗi người phải chịu trách nhiệm về phát ngôn của mình."), ("政府應該為錯誤的決策負責。", "Chính phủ nên chịu trách nhiệm về quyết sách sai."), "Không nói 為負責B; đối tượng trách nhiệm phải đứng giữa 為 và 負責.", "發文者應該____自己的言論負責。", "為", ["一旦", "則"]),
    ("封住…的嘴", "Cách nói hình tượng về việc ngăn ai đó phát biểu. Trong bài, tác giả phản đối việc lấy sai phạm của một số người làm lý do bịt miệng toàn xã hội. Mẫu này có sắc thái mạnh, phù hợp khi nói về kiểm duyệt hoặc gây áp lực buộc người khác im lặng.", "封住 + người／nhóm người + 的嘴。", ("批評政府不該成為封住人民的嘴的理由。", "Việc chỉ trích chính phủ không nên thành lý do bịt miệng người dân."), ("金錢無法永遠封住證人的嘴。", "Tiền không thể bịt miệng nhân chứng mãi mãi."), "Đừng hiểu theo nghĩa đen là chạm vào miệng; ở đây trọng tâm là quyền lên tiếng.", "作者反對因少數人的錯誤就____人民的嘴。", "封住", ["接收", "展現"]),
    ("躲在…的保護傘下", "Chỉ việc nương vào một cơ chế, danh nghĩa hay thế lực để tránh bị truy cứu. Trong bài hai, tác giả dùng hình ảnh ‘núp dưới ô bảo vệ của chế độ ẩn danh’ để nói về người tung tin đồn. Mẫu thường hàm ý phê phán.", "Người／hành vi + 躲在 + cơ chế／danh nghĩa + 的保護傘下。", ("有人躲在匿名制度的保護傘下散播謠言。", "Có người núp sau chế độ ẩn danh để tung tin đồn."), ("違法者不該躲在公司的保護傘下。", "Người vi phạm không nên núp dưới sự che chở của công ty."), "Đừng dùng mẫu cho sự bảo vệ tích cực bình thường nếu không muốn gợi ý né trách nhiệm.", "他們躲在匿名制度的____下。", "保護傘", ["真理", "界線"]),
    ("尤其如此", "‘Điều đó càng đúng đối với…’. Dùng sau một nhận định chung để chỉ ra một trường hợp nổi bật hơn, thường có cụm 對…來說 đứng trước. Trong bài, tác giả nói lời nói trên mạng càng cần được xét đến giới hạn.", "Nhận định chung， 對 + trường hợp + 來說尤其如此。", ("閱讀有助於思考，對學語言的人來說尤其如此。", "Đọc giúp phát triển tư duy, điều này càng đúng với người học ngôn ngữ."), ("說話要負責，對媒體人來說尤其如此。", "Nói năng phải có trách nhiệm, đặc biệt là với người làm truyền thông."), "Đừng dùng 尤其如此 khi chưa có một nhận định phía trước để nó quay lại nhấn mạnh.", "說話要負責，對媒體人來說____。", "尤其如此", ["為反對而反對", "一旦"]),
    ("則", "Nối hai chủ thể hoặc hai nhóm với cách làm, tình trạng khác nhau; gần nghĩa ‘còn’, ‘trong khi đó’. Trong bài, một số người bị trầm cảm hoặc tự sát, còn đa số chọn im lặng. Khác với 則 là lượng từ trong ‘一則留言’.", "A + hành động 1；B + 則 + hành động 2。", ("有人支持匿名，其他人則要求實名。", "Có người ủng hộ ẩn danh, còn người khác đòi dùng tên thật."), ("他選擇回應，她則保持沉默。", "Anh ấy chọn đáp lại, còn cô ấy im lặng."), "Đừng đặt 則 ngay trước chủ ngữ thứ hai; nó đứng sau chủ ngữ để đánh dấu phần đối chiếu.", "有人公開抗議，多數人____保持沉默。", "則", ["一旦", "即使是"]),
    ("以…之名", "Diễn tả việc làm điều gì đó nhân danh một lý tưởng, tổ chức hoặc nguyên tắc. Cụm này tự nó không xác nhận hành động là đúng; trong bài, tác giả phê phán người lấy danh nghĩa tự do ngôn luận để làm hại người khác.", "Chủ thể + 以 + danh nghĩa + 之名 + hành động。", ("有人以正義之名攻擊別人。", "Có người nhân danh công lý để công kích người khác."), ("學校以文化交流之名舉辦活動。", "Trường tổ chức hoạt động nhân danh giao lưu văn hóa."), "Đừng hiểu 之名 là tên riêng của người; nó chỉ danh nghĩa hoặc lý do được nêu ra.", "他們____言論自由之名傷害別人。", "以", ["即使", "一旦"]),
    ("就更不用說了", "Đưa ra một trường hợp còn rõ hoặc nghiêm trọng hơn trường hợp đã nhắc. B ở câu sau phải là ví dụ cùng hướng và mức độ cao hơn A. Trong bài, tác giả nói người bình luận trên truyền hình càng giỏi né trách nhiệm hơn.", "Trường hợp A đã như vậy， B 就更不用說了。", ("連大人都覺得這篇文章難，小孩就更不用說了。", "Ngay người lớn còn thấy bài này khó, trẻ nhỏ thì khỏi phải nói."), ("一般留言已經很難查證，匿名消息就更不用說了。", "Bình luận thông thường đã khó kiểm chứng, tin ẩn danh thì còn khó hơn."), "Đừng dùng mẫu khi B không mạnh hơn hoặc không cùng tiêu chí so sánh với A.", "連記者都難以確認，匿名消息____。", "就更不用說了", ["即使是", "為反對而反對"]),
    ("（在）…的同時，也…", "Nêu hai mặt hoặc hai hành động cần được nhìn nhận cùng lúc. Ở kết luận của bài hai, hưởng quyền tự do ngôn luận phải đi cùng gánh trách nhiệm liên quan. Không phải mọi câu có 同時 đều chỉ hai việc xảy ra đúng cùng giây phút; mẫu cũng diễn tả sự song hành về nghĩa.", "（在）+ việc A + 的同時， 也 + việc B。", ("在享受自由的同時，也要尊重別人。", "Khi hưởng tự do, ta cũng phải tôn trọng người khác."), ("發展科技的同時，也應保護個人資料。", "Phát triển công nghệ đồng thời cũng nên bảo vệ dữ liệu cá nhân."), "Đừng chỉ nêu mặt lợi sau 同時; mục đích bài này là đặt quyền và trách nhiệm cạnh nhau.", "在享受言論自由的____，也要承擔責任。", "同時", ["界線", "來源"]),
]


def question(group: str, number: int, prompt: str, correct: str, wrong: list[str], feedback: str,
             skill: str, **extra: str) -> dict:
    return make_question(PREFIX, group, number, (prompt, correct, wrong, feedback, skill), **extra)


def build() -> None:
    records = []
    for i, (traditional, meaning, word_class, example, example_vi) in enumerate(WORDS, 1):
        records.append({"id": f"{PREFIX}-v{i:03d}", "traditional": traditional,
                        "simplified": simplified(traditional),
                        "pinyin": " ".join(lazy_pinyin(traditional, style=Style.TONE)),
                        "meaningVi": meaning, "wordClass": word_class,
                        "exampleTraditional": example, "exampleSimplified": simplified(example),
                        "exampleVi": example_vi})
    vocab = {"lessonId": PREFIX, "records": records}
    grammar = []
    for i, (title, explanation, structure, first, second, mistake, blank, correct, wrong) in enumerate(GRAMMAR, 1):
        grammar.append({"id": f"{PREFIX}-grammar-{i:02d}", "title": title,
                        "audioTrackId": "cc5-textbook-l01-t04" if i <= 6 else "cc5-textbook-l01-t08",
                        "explanation": explanation, "structure": structure,
                        "examples": [sentence(*first), sentence(*second)], "commonMistake": mistake,
                        "check": question("grammar-check", i, f"Điền vào chỗ trống: {blank}", correct, wrong,
                                          explanation.split(".")[0] + ".", "Ngữ pháp")})
    checks = [
        question("check", 1, "Bài đọc 1 cho rằng điều gì giúp người dân giám sát quyết sách của chính phủ?", "Tự do ngôn luận", ["Chỉ có một tiếng nói", "Ẩn danh trên mạng"], "Tác giả viết 正因為有言論自由，政府的決策受到人民的監督.", "Đọc hiểu"),
        question("check", 2, "Bài đọc 2 lo ngại điều gì khi ngôn luận trên mạng bị lạm dụng?", "Tin đồn và công kích có thể gây hại", ["Mọi người sẽ không thể đọc báo", "Không ai còn được ẩn danh"], "Tác giả nêu 謠言滿天飛 và 惡意批評 như những ví dụ của việc lạm dụng.", "Đọc hiểu"),
        question("check", 3, "Hai tác giả có cùng thái độ với ngôn từ thù hận không?", "Cả hai đều xem đó là vấn đề, nhưng đề xuất khác nhau", ["Cả hai đều ủng hộ ngôn từ thù hận", "Cả hai đều phủ nhận giá trị của tự do ngôn luận"], "Bài 1 nhấn trách nhiệm và giáo dục; bài 2 đòi ranh giới và luật nghiêm hơn.", "So sánh lập luận"),
    ]
    listening = [
        question("listening", 1, "Nghe bài đọc 1: tác giả nói quyền nào là nền tảng dân chủ?", "Quyền bày tỏ ý kiến và suy nghĩ", ["Quyền ẩn danh tuyệt đối", "Quyền phạt người bất đồng"], "Bài đọc giải thích 言論自由 là quyền 表達意見和想法.", "Nghe hiểu", audioTrackId="cc5-textbook-l01-t02"),
        question("listening", 2, "Nghe bài đọc 1: tác giả cho rằng tranh luận nhiều góc nhìn đem lại điều gì?", "Chân lý sáng rõ và dần hình thành đồng thuận", ["Chính phủ không cần chịu giám sát", "Mọi lời phê bình đều bị cấm"], "Tác giả dùng 真理將越辯越明，社會共識也慢慢形成.", "Nghe hiểu", audioTrackId="cc5-textbook-l01-t02"),
        question("listening", 3, "Nghe bài đọc 2: ẩn danh cùng tốc độ lan truyền nhanh có thể gây ra điều gì?", "Ảnh hưởng lớn và nguy cơ gây hại", ["Tin tức luôn chính xác hơn", "Người dùng tự động chịu trách nhiệm"], "Bài đọc nêu 影響力更強大、更驚人, có thể 對個人或社會造成威脅.", "Nghe hiểu", audioTrackId="cc5-textbook-l01-t06"),
        question("listening", 4, "Nghe kết luận bài đọc 2: người hưởng tự do ngôn luận còn phải làm gì?", "Chịu trách nhiệm tương ứng", ["Ngừng bày tỏ ý kiến", "Chỉ dùng tên thật"], "Kết luận viết 在享受言論自由的同時，也必須承擔起相關責任.", "Nghe hiểu", audioTrackId="cc5-textbook-l01-t06"),
    ]
    practice = [
        question("practice", 1, "Điền: 每個人都要守法，____官員也不例外。", "即使是", ["一旦", "事實上"], "Mẫu 即使是…也不例外 nêu người có vẻ là ngoại lệ nhưng vẫn theo quy tắc.", "Ngữ pháp", kind="fill"),
        question("practice", 2, "Trong bài 1, vì sao tác giả phản đối việc chỉ có một tiếng nói?", "Xã hội như vậy không thể tiến bộ", ["Dễ tổ chức biểu tình hơn", "Tin đồn sẽ nhiều hơn"], "Bài 1 viết 只有一種聲音的社會是無法進步的.", "Đọc hiểu"),
        question("practice", 3, "‘Chịu trách nhiệm về lời mình nói’ nên dùng cụm nào?", "為自己的言論負責", ["為反對而反對", "封住人民的嘴"], "為B負責 chỉ phạm vi trách nhiệm B.", "Ngữ pháp"),
        question("practice", 4, "Điền: 有人支持匿名，其他人____要求實名。", "則", ["一旦", "即使是"], "則 đứng sau chủ ngữ thứ hai để đối chiếu hai nhóm.", "Ngữ pháp", kind="fill"),
        question("practice", 5, "Bài 2 nói ai có thể núp sau chế độ ẩn danh để tung tin đồn?", "Một số cư dân mạng", ["Tất cả thẩm phán", "Người viết bài 1"], "Bài 2 viết 鄉民躲在匿名制度的保護傘下，讓謠言滿天飛.", "Đọc hiểu"),
        question("practice", 6, "‘Nhân danh tự do ngôn luận để làm hại người khác’ chứa mẫu nào?", "以…之名", ["為…而…", "一旦…就…"], "以B之名 nêu danh nghĩa B được viện dẫn cho hành động.", "Ngữ pháp"),
        question("practice", 7, "Theo bài 1, hiện tượng bắt nạt bắt nguồn từ đâu?", "Một số người không chịu trách nhiệm về lời mình nói", ["Mọi hình thức tự do ngôn luận đều sai", "Không ai được quyền phê bình"], "Bài 1 nêu 那些人不懂得為自己的言論負責.", "Đọc hiểu"),
        question("practice", 8, "Theo bài 2, ‘tiêu đề mơ hồ’ giúp một số người làm gì?", "Né tránh trách nhiệm", ["Giải thích nguồn tin rõ hơn", "Đăng tin nhanh hơn"], "Bài 2 viết 加上「？」、「懷疑」或是「可能」…為了避開責任.", "Đọc hiểu"),
        question("practice", 9, "Điền: 在享受自由的____，也要尊重他人。", "同時", ["界線", "來源"], "（在）A的同時，也B đặt hai mặt quyền và trách nhiệm cạnh nhau.", "Ngữ pháp", kind="fill"),
        question("practice", 10, "Câu nào mô tả đúng sự khác biệt giữa hai bài đọc?", "Bài 1 ưu tiên bảo vệ quyền lên tiếng; bài 2 nhấn giới hạn và trách nhiệm", ["Bài 1 cấm mọi tranh luận; bài 2 cổ vũ tin đồn", "Hai bài có kết luận hoàn toàn giống nhau"], "Đối chiếu câu kết và các lập luận ở cả hai bài.", "So sánh lập luận"),
    ]
    assessment = [
        question("assessment", 1, "顧名思義 có nghĩa gần nhất là gì?", "Đúng như tên gọi", ["Theo một tin đồn", "Tùy trường hợp"], "顧名思義 dùng để giải thích nghĩa từ chính tên gọi.", "Từ vựng"),
        question("assessment", 2, "‘Tin đồn sai sự thật’ là cụm nào?", "不實謠言", ["社會共識", "司法判決"], "不實 là không đúng sự thật, 謠言 là tin đồn.", "Từ vựng"),
        question("assessment", 3, "Điền: 一旦政府控制言論，人民____失去發言機會。", "就可能", ["則已經", "即使是"], "一旦 nêu điều kiện có thể kéo theo hệ quả; 就可能 diễn tả nguy cơ, không khẳng định chắc chắn.", "Ngữ pháp"),
        question("assessment", 4, "Câu nào dùng 為…而… đúng với nghĩa bài học?", "不要為反對而反對。", ["他為責任而消息。", "政府為一旦而法律。"], "Cùng hành động 反對 được lặp để nói phản đối chỉ vì phản đối.", "Ngữ pháp"),
        question("assessment", 5, "Bài 1 cho rằng nhiều góc nhìn giúp gì?", "Cân bằng quan điểm và hình thành đồng thuận", ["Xóa bỏ quyền phản biện", "Tránh hoàn toàn mọi tranh cãi"], "Bài 1 dùng 多元、平衡、共識 để triển khai lập luận.", "Đọc hiểu"),
        question("assessment", 6, "Bài 2 gọi tự do ngôn luận thành ‘lá bùa’ khi nào?", "Khi người ta lấy nó làm cớ để công kích mà không chịu trách nhiệm", ["Khi người dân tranh luận lịch sự", "Khi tòa án công bố phán quyết"], "Đọc đoạn có 護身符 và câu hỏi về trách nhiệm ngay sau đó.", "Đọc hiểu"),
        question("assessment", 7, "Câu nào đối chiếu hai nhóm bằng 則?", "有人支持匿名，其他人則反對。", ["則有人支持匿名，其他人反對。", "有人支持則匿名，其他人反對。"], "則 đứng sau chủ ngữ thứ hai.", "Ngữ pháp"),
        question("assessment", 8, "‘Núp sau chế độ ẩn danh’ diễn đạt thế nào?", "躲在匿名制度的保護傘下", ["封住匿名制度的嘴", "以匿名制度越辯越明"], "保護傘 là hình ảnh ‘ô che’; 躲在…下 gợi tránh trách nhiệm.", "Ngữ pháp"),
        question("assessment", 9, "Theo bài 2, vì sao tranh chấp với người bình luận trên truyền hình khó khắc phục kịp?", "Phán quyết của tòa có thể đến sau khi thiệt hại đã xảy ra", ["Không ai có thể kiện", "Mọi tiêu đề đều chính xác"], "Bài 2 viết 等法院判決確定…傷害卻早就已經造成.", "Đọc hiểu"),
        question("assessment", 10, "Câu nào thể hiện đúng kết luận của bài 2?", "Hưởng quyền tự do cũng phải gánh trách nhiệm", ["Chỉ truyền thông mới có quyền tự do", "Cấm mọi lời phản đối"], "Kết luận nêu 在享受言論自由的同時，也必須承擔起相關責任.", "Đọc hiểu"),
        question("assessment", 11, "Bài 1 bác bỏ cách hiểu nào?", "Cho rằng mọi hiện tượng bắt nạt đều do quyền phát biểu quá rộng", ["Cho rằng cần giáo dục trách nhiệm", "Cho rằng giá trị của tiếng nói cần bảo vệ"], "Tác giả nói nguyên nhân là hiểu sai quyền và không chịu trách nhiệm.", "So sánh lập luận"),
        question("assessment", 12, "Đọc hai bài, câu hỏi nào giúp đánh giá lập luận công bằng nhất?", "Mỗi tác giả dùng bằng chứng nào và đề xuất giải pháp gì?", ["Tác giả nào dùng nhiều chữ hơn?", "Bài nào xuất hiện trước trong sách?"], "Đọc phản biện cần so sánh luận cứ và giải pháp, không chỉ cảm giác đồng ý.", "Đọc phản biện"),
    ]
    lesson = {
        "contentVersion": 2, "id": PREFIX, "title": "言論自由的界線", "titleVi": "Ranh giới của tự do ngôn luận",
        "description": "Đọc hai lập luận trái chiều về tự do ngôn luận, học cách trình bày quan điểm, đối chiếu dẫn chứng và phản biện có trách nhiệm.",
        "objectives": ["Nắm luận điểm và dẫn chứng của hai bài đọc về tự do ngôn luận.",
                       "Dùng 12 mẫu ngữ pháp trong bài để nêu điều kiện, đối chiếu và trách nhiệm.",
                       "Viết một đoạn ngắn trình bày ý kiến có luận cứ và tôn trọng quan điểm khác."],
        "estimatedMinutes": None,
        "lecture": {"introduction": "Bài học đưa ra hai quan điểm: một bên nhấn mạnh bảo vệ quyền lên tiếng, bên kia đặt câu hỏi về tác hại khi quyền ấy bị lạm dụng. Hãy nghe và đọc từng bài trước khi chọn lập trường; mục tiêu là hiểu lý lẽ, không phải đoán ‘đáp án đúng’ cho một vấn đề xã hội.",
                    "sections": [
                        {"id": f"{PREFIX}-section-01", "title": "Đọc để nhận ra luận điểm", "body": "Bài 1 bắt đầu từ tin tức rồi chuyển sang định nghĩa, lợi ích và cách xử lý hành vi gây hại. Tìm câu chủ chốt của từng đoạn; phân biệt ví dụ với kết luận.", **sentence("言論自由，顧名思義，是指人人都有表達意見和想法的權利。", "Tự do ngôn luận là quyền mọi người được bày tỏ ý kiến và suy nghĩ.")},
                        {"id": f"{PREFIX}-section-02", "title": "Nhìn từ phía đối lập", "body": "Bài 2 không phủ nhận quyền nói, nhưng lập luận rằng ẩn danh và tốc độ lan truyền có thể khuếch đại tổn hại. Chú ý các từ chuyển ý như 然而、的確、但是、否則.", **sentence("言論自由不能完全沒有限制，網路言論尤其如此。", "Tự do ngôn luận không thể hoàn toàn không có giới hạn; lời nói trên mạng càng như vậy.")},
                        {"id": f"{PREFIX}-section-03", "title": "So sánh giải pháp", "body": "Hai bài cùng nhắc đến ngôn từ thù hận và trách nhiệm, nhưng bài 1 coi giáo dục và thực thi luật hiện có là trọng tâm; bài 2 đề xuất ranh giới và luật nghiêm hơn. Hãy ghi lại chính xác tác giả nào nói điều gì.", **sentence("在享受言論自由的同時，也必須承擔起相關責任。", "Khi hưởng tự do ngôn luận, cũng phải gánh trách nhiệm tương ứng.")},
                    ],
                    "dialogues": [
                        {"id": f"{PREFIX}-reading-for", "title": "Bài đọc 1 · 擁有言論自由才是真民主", "context": "Lập luận bảo vệ tự do ngôn luận; sách giáo khoa tr. 2, PDF tr. 28.", "audioTrackId": "cc5-textbook-l01-t02", "turns": [{"speaker": "Bài đọc 1", **sentence(chinese, vi)} for chinese, vi in READING_FOR]},
                        {"id": f"{PREFIX}-reading-against", "title": "Bài đọc 2 · 濫用自由並非真自由", "context": "Lập luận về ranh giới và trách nhiệm; sách giáo khoa tr. 12, PDF tr. 38.", "audioTrackId": "cc5-textbook-l01-t06", "turns": [{"speaker": "Bài đọc 2", **sentence(chinese, vi)} for chinese, vi in READING_AGAINST]},
                    ], "checks": checks, "pronunciation": [], "culture": []},
        "vocabulary": {"introduction": "Chạm vào từng từ để xem nghĩa, phiên âm và cách dùng.", "wordIds": [row["id"] for row in records],
                       "audioTracks": [{"id": "cc5-textbook-l01-t03", "label": "Từ vựng bài đọc 1"}, {"id": "cc5-textbook-l01-t07", "label": "Từ vựng bài đọc 2"}]},
        "grammar": grammar, "listening": listening, "practice": practice, "assessment": assessment,
        "writingTask": {"id": f"{PREFIX}-writing", "title": "Viết một ý kiến có trách nhiệm", "prompt": "Chọn một trường hợp cụ thể trên mạng. Viết 120–180 chữ Hoa: nêu quan điểm, một lý do, một ý kiến phản biện và cách bạn cân bằng quyền phát biểu với trách nhiệm. Có thể dùng 一旦、事實上、則、在…的同時.",
                        "sampleTraditional": "我認為每個人都應該有表達意見的權利，但是在享受言論自由的同時，也要為自己的話負責。一旦沒有根據的消息傳開，就可能傷害別人。有人主張限制所有匿名留言；我則認為應該先查證內容，並處理真正的攻擊和謠言。",
                        "sampleSimplified": simplified("我認為每個人都應該有表達意見的權利，但是在享受言論自由的同時，也要為自己的話負責。一旦沒有根據的消息傳開，就可能傷害別人。有人主張限制所有匿名留言；我則認為應該先查證內容，並處理真正的攻擊和謠言。")},
    }
    if len(records) != 102 or len(grammar) != 12 or len(practice) < 8 or len(assessment) < 10:
        raise ValueError("Lesson 01 content is incomplete")
    data_dir = ROOT / "data/academy"
    for name, data in [("cc5-lesson01-vocabulary.json", vocab), ("cc5-lesson01.json", lesson)]:
        (data_dir / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    reviewed = {}
    for track_id, paragraphs in [("cc5-textbook-l01-t02", READING_FOR), ("cc5-textbook-l01-t06", READING_AGAINST)]:
        reviewed[track_id] = {"transcriptTraditional": "\n\n".join(chinese for chinese, _ in paragraphs),
                              "transcriptSimplified": "\n\n".join(simplified(chinese) for chinese, _ in paragraphs),
                              "translationVi": "\n\n".join(vi for _, vi in paragraphs)}
    (data_dir / "cc5-reviewed-content.json").write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    all_chinese = json.dumps(lesson, ensure_ascii=False) + json.dumps(records, ensure_ascii=False)
    mapping = {char: CONVERT.convert(char) for char in set(all_chinese) if CONVERT.convert(char) != char}
    (data_dir / "cc5-script-map.json").write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(READING_FOR) + len(READING_AGAINST)} paragraphs, {len(records)} words, {len(grammar)} grammar points")


if __name__ == "__main__":
    build()
