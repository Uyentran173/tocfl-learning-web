"""Build the reviewed first lesson of Contemporary Chinese Volume 4.

Dialogue, reading and vocabulary are transcribed from Volume 4 textbook pages
2–9 (PDF pages 29–36). Grammar follows textbook pages 10–17. The Vietnamese
teaching copy and exercises are authored for Tai Wén.
"""

import json
from pathlib import Path

from cc3_lesson_builder import CONVERT, make_question, sentence, simplified
from pypinyin import Style, lazy_pinyin

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "cc4-v4-l01"

DIALOGUE = [
    ("阿建", "小玲，第一次看到妳。妳是學生還是上班族？", "Tiểu Linh, lần đầu gặp bạn. Bạn là học sinh hay người đi làm?"),
    ("小玲", "我是上班族，剛下班回到家。", "Tôi đi làm, vừa tan ca về nhà."),
    ("阿建", "剛到家？這麼晚？真辛苦！", "Vừa về đến nhà à? Muộn thế? Vất vả quá!"),
    ("小玲", "不晚啊，現在才八點半而已。平常我都九點多才下班，有時候甚至工作到十點多。而且我自己一個人住，與其回到冷清的家，不如留在辦公室，還有同事陪我吃飯。", "Không muộn đâu, mới tám rưỡi. Thường tôi hơn chín giờ mới tan ca, có lúc còn làm đến hơn mười giờ. Tôi lại sống một mình; thà ở văn phòng có đồng nghiệp ăn cùng còn hơn về căn nhà vắng vẻ."),
    ("阿建", "妳幾歲？單身嗎？沒跟家人住在一起嗎？", "Bạn bao nhiêu tuổi? Độc thân à? Không ở cùng gia đình sao?"),
    ("小玲", "二十五歲，單身。家在台南，大學畢業後來台北工作，自己在外面租房子。你呢？", "Hai mươi lăm tuổi, độc thân. Nhà tôi ở Đài Nam; tốt nghiệp đại học rồi đến Đài Bắc làm việc, thuê nhà ở riêng. Còn bạn?"),
    ("阿建", "我也單身，三十二歲。", "Tôi cũng độc thân, ba mươi hai tuổi."),
    ("小玲", "在哪裡高就？", "Bạn đang làm việc ở đâu?"),
    ("阿建", "我在建設公司上班，是業務經理。部門裡有二十幾個人。", "Tôi làm ở công ty xây dựng, là quản lý kinh doanh. Bộ phận có hơn hai mươi người."),
    ("小玲", "你才三十二歲就已經是業務經理了，真厲害！你的工作能力一定很強。", "Mới ba mươi hai tuổi mà bạn đã là quản lý kinh doanh, giỏi thật! Chắc năng lực làm việc của bạn rất tốt."),
    ("阿建", "還可以。妳在哪裡工作呢？", "Cũng tạm. Thế bạn làm ở đâu?"),
    ("小玲", "我在一家室內設計公司工作，畢業才兩年，經驗還不夠，所以工作常常做不完，得常加班。", "Tôi làm ở một công ty thiết kế nội thất. Mới tốt nghiệp hai năm nên chưa đủ kinh nghiệm, công việc thường làm không xuể, phải hay tăng ca."),
    ("阿建", "妳的興趣是什麼？有空的時候做些什麼？", "Bạn thích gì? Khi rảnh thường làm gì?"),
    ("小玲", "看書、看電影、吃美食。", "Đọc sách, xem phim, ăn món ngon."),
    ("阿建", "妳愛看哪類電影？", "Bạn thích xem loại phim nào?"),
    ("小玲", "我最愛看恐怖片。", "Tôi thích phim kinh dị nhất."),
    ("阿建", "恐怖片！妳敢看恐怖片！我以為女生都只喜歡看浪漫的愛情片。好多女生都因為覺得恐怖片太可怕而被嚇哭了。", "Phim kinh dị! Bạn dám xem sao! Tôi cứ tưởng con gái chỉ thích phim tình cảm lãng mạn. Nhiều người còn bị phim kinh dị dọa phát khóc."),
    ("小玲", "並不是所有的女生都喜歡看愛情片，我就不喜歡，愛情片無聊死了！剛開始看恐怖片的時候，我也怕得不得了，但是看著看著就上癮了。現在覺得很刺激呢！", "Đâu phải cô gái nào cũng thích phim tình cảm; tôi thì không, thấy nó chán chết! Lúc đầu xem phim kinh dị tôi cũng sợ lắm, nhưng xem dần rồi mê. Giờ tôi thấy rất kích thích!"),
    ("阿建", "別說女生，就是男生也有很多不敢看恐怖片的。", "Đừng nói con gái, ngay cả nhiều con trai cũng không dám xem phim kinh dị."),
    ("小玲", "不敢看恐怖片的男生簡直不是男生！膽子比我還小！", "Con trai mà không dám xem phim kinh dị thì thật khó tin! Còn nhát hơn tôi nữa!"),
    ("阿建", "好啦！好啦！別這麼激動，下次我們一起去找部恐怖片看吧！", "Thôi nào, đừng kích động thế. Lần sau chúng ta cùng tìm một bộ phim kinh dị để xem nhé!"),
    ("小玲", "好啊！可是有的恐怖片是限制級的，我不能去電影院看。", "Được! Nhưng có phim kinh dị giới hạn độ tuổi, tôi không vào rạp xem được."),
    ("阿建", "為什麼？妳不是二十五歲嗎？", "Sao vậy? Chẳng phải bạn hai mươi lăm tuổi à?"),
    ("小玲", "呃……", "Ờ…"),
]

READING = [
    ("十七歲的小玲是家裡的獨生女，目前在一所明星高中就讀。爸爸從事新聞媒體方面的工作，早出晚歸；媽媽的工作不至於那麼忙，但也常需要加班。因此，小玲放學後回到冷清的家，晚餐都是自己解決。雖然這樣，小玲並不寂寞，因為有許多網友陪伴她。", "Tiểu Linh mười bảy tuổi, là con một và hiện học ở một trường trung học danh tiếng. Bố làm trong ngành truyền thông, đi sớm về muộn; mẹ tuy đỡ bận hơn nhưng cũng thường tăng ca. Vì vậy, tan học về căn nhà vắng vẻ, cô tự lo bữa tối. Dẫu vậy cô không cô đơn vì có nhiều bạn trên mạng trò chuyện cùng."),
    ("每天小玲一打開電腦，進入聊天室，就有許多網友在線上聊著今天發生的大小事。有人聊著感情的問題，有人抱怨老闆太小氣……。網友們看見小玲上線了，都會熱情地跟她打招呼。在她心情不好時，大家往往會給她加油打氣、安慰她。在小玲心裡，這個聊天室裡住著很多沒見過面的兄弟姐妹。雖然她在學校裡也有好朋友，但在網路上好像更能放心大膽地聊。", "Mỗi ngày, vừa mở máy tính vào phòng chat, Tiểu Linh đã thấy nhiều bạn mạng bàn chuyện lớn nhỏ trong ngày: người kể chuyện tình cảm, người than phiền ông chủ keo kiệt. Họ nhiệt tình chào khi cô lên mạng; lúc cô buồn, họ thường động viên và an ủi. Với Tiểu Linh, phòng chat như có nhiều anh chị em chưa từng gặp mặt. Dù ở trường cũng có bạn tốt, cô cảm thấy trên mạng dễ mở lòng hơn."),
    ("另外，玩線上遊戲也是小玲紓解壓力的方法，讀書讀累了，就玩一下，不但可以轉換心情，有的跟歷史有關的遊戲還可以讓小玲對歷史更了解呢。", "Chơi game trực tuyến cũng giúp Tiểu Linh giải tỏa áp lực. Học mệt thì chơi một lát để đổi tâm trạng; một số trò chơi về lịch sử còn giúp cô hiểu lịch sử hơn."),
    ("對小玲來說，網路的虛擬關係比現實生活中的關係簡單多了。在網路世界裡，所有的事情都可以得到安慰和支持，不會有心理負擔，即使做錯了，也不會有人責備；在現實生活中，家人的期待、學校裡的競爭都讓她喘不過氣來。躲進網路世界裡，比較自在。", "Với Tiểu Linh, quan hệ trên mạng đơn giản hơn nhiều so với ngoài đời. Ở đó, cô được an ủi và ủng hộ mà không thấy áp lực; ngay cả khi làm sai cũng không bị trách. Ngoài đời, kỳ vọng của gia đình và cạnh tranh ở trường khiến cô ngột ngạt. Trốn vào thế giới mạng, cô thấy dễ chịu hơn."),
    ("雖然小玲常常跟網友聊天，但是小玲只是聊著玩的。她知道網路交友有時候很危險，所以色情、暴力網站她都不會點進去；她也知道懂得保護自己，才不會掉進這種網路陷阱裡。", "Dù thường trò chuyện với bạn trên mạng, Tiểu Linh chỉ xem đó là chuyện vui. Cô biết kết bạn qua mạng có lúc nguy hiểm nên không mở các trang có nội dung khiêu dâm hay bạo lực. Cô cũng hiểu phải tự bảo vệ mình để không rơi vào bẫy trên mạng."),
]

# Textbook Vocabulary I (26 entries) and Vocabulary II (44 entries), in order.
VOCAB = [
    ("小玲", "Tiểu Linh (tên người)", "tên riêng"), ("阿建", "A Kiến (tên người)", "tên riêng"),
    ("聊天室", "phòng chat", "danh từ"), ("上班族", "người đi làm", "danh từ"),
    ("與其", "thà; thay vì", "liên từ"), ("冷清", "vắng vẻ, hiu quạnh", "tính từ"),
    ("高就", "làm việc ở đâu (cách nói lịch sự)", "động từ"), ("部門", "bộ phận", "danh từ"),
    ("厲害", "giỏi; lợi hại", "tính từ"), ("加班", "tăng ca", "động từ"),
    ("類", "loại", "lượng từ"), ("恐怖片", "phim kinh dị", "danh từ"),
    ("愛情片", "phim tình cảm", "danh từ"), ("嚇", "dọa, làm sợ", "động từ"),
    ("哭", "khóc", "động từ"), ("上癮", "mê, nghiện", "động từ"),
    ("刺激", "kích thích, hồi hộp", "tính từ"), ("簡直", "quả là; cứ như", "phó từ"),
    ("膽子", "gan, lòng can đảm", "danh từ"), ("部", "bộ (phim)", "lượng từ"),
    ("限制級", "giới hạn độ tuổi", "danh từ"), ("電影院", "rạp chiếu phim", "danh từ"),
    ("呃", "ờ; ừm", "thán từ"), ("建設公司", "công ty xây dựng", "danh từ"),
    ("業務經理", "quản lý kinh doanh", "danh từ"), ("室內設計", "thiết kế nội thất", "danh từ"),
    ("溫暖", "ấm áp", "tính từ"), ("目前", "hiện nay", "phó từ"),
    ("所", "ngôi, trường (lượng từ)", "lượng từ"), ("就讀", "theo học", "động từ"),
    ("不至於", "chưa đến mức", "phó từ"), ("但", "nhưng", "liên từ"),
    ("放學", "tan học", "động từ"), ("後", "sau đó", "danh từ"),
    ("解決", "giải quyết, tự lo", "động từ"), ("寂寞", "cô đơn", "tính từ"),
    ("網友", "bạn trên mạng", "danh từ"), ("陪伴", "bầu bạn, ở bên", "động từ"),
    ("電腦", "máy tính", "danh từ"), ("進入", "đi vào", "động từ"),
    ("線上", "trực tuyến", "danh từ"), ("感情", "tình cảm", "danh từ"),
    ("小氣", "keo kiệt", "tính từ"), ("時", "khi", "danh từ"),
    ("往往", "thường có xu hướng", "phó từ"), ("打氣", "động viên, cổ vũ", "động từ"),
    ("安慰", "an ủi", "động từ"), ("心裡", "trong lòng", "danh từ"),
    ("大膽", "mạnh dạn", "tính từ"), ("紓解", "giải tỏa", "động từ"),
    ("轉換", "chuyển đổi", "động từ"), ("虛擬", "ảo", "tính từ"),
    ("現實", "hiện thực", "tính từ"), ("心理", "tâm lý", "danh từ"),
    ("即使", "cho dù", "liên từ"), ("責備", "trách móc", "động từ"),
    ("期待", "kỳ vọng", "danh từ"), ("喘氣", "thở dốc", "động từ"),
    ("自在", "thoải mái, tự tại", "tính từ"), ("交友", "kết bạn", "động từ"),
    ("暴力", "bạo lực", "danh từ"), ("點", "nhấp, bấm", "động từ"),
    ("懂得", "biết cách", "động từ"), ("陷阱", "bẫy", "danh từ"),
    ("明星高中", "trường trung học danh tiếng", "danh từ"),
    ("早出晚歸", "đi sớm về muộn", "cụm động từ"),
    ("打開", "mở (máy tính)", "động từ"),
    ("喘不過氣", "ngột ngạt, không thở nổi", "cụm động từ"),
    ("躲進", "trốn vào", "cụm động từ"), ("掉進", "rơi vào", "cụm động từ"),
]

EXAMPLES = """
小玲|小玲喜歡看恐怖片。|Tiểu Linh thích xem phim kinh dị.
阿建|阿建在聊天室認識小玲。|A Kiến quen Tiểu Linh trong phòng chat.
聊天室|他們在聊天室聊電影。|Họ trò chuyện về phim trong phòng chat.
上班族|上班族下班後常去吃晚飯。|Người đi làm thường ăn tối sau khi tan ca.
與其|與其擔心，不如先問清楚。|Thà hỏi cho rõ trước còn hơn cứ lo.
冷清|她回到冷清的家。|Cô về căn nhà vắng vẻ.
高就|請問您在哪裡高就？|Xin hỏi anh đang làm việc ở đâu?
部門|我們部門有二十個人。|Bộ phận chúng tôi có hai mươi người.
厲害|她的中文真厲害！|Tiếng Hoa của cô ấy giỏi thật!
加班|媽媽今天又要加班。|Hôm nay mẹ lại phải tăng ca.
類|你喜歡哪類電影？|Bạn thích loại phim nào?
恐怖片|我不敢一個人看恐怖片。|Tôi không dám xem phim kinh dị một mình.
愛情片|她不喜歡看愛情片。|Cô ấy không thích xem phim tình cảm.
嚇|這部電影把我嚇哭了。|Bộ phim này làm tôi sợ phát khóc.
哭|小孩哭了，媽媽來安慰他。|Đứa trẻ khóc, mẹ đến an ủi.
上癮|他看著看著就上癮了。|Anh ấy xem dần rồi mê luôn.
刺激|這部電影很刺激。|Bộ phim này rất hồi hộp.
簡直|今天熱得簡直像夏天。|Hôm nay nóng cứ như mùa hè.
膽子|她膽子很大，敢看恐怖片。|Cô ấy gan lắm, dám xem phim kinh dị.
部|我們看了一部電影。|Chúng tôi đã xem một bộ phim.
限制級|這部電影是限制級的。|Bộ phim này giới hạn độ tuổi.
電影院|他們一起去電影院。|Họ cùng đến rạp chiếu phim.
呃|呃，我還沒想好。|Ờ, tôi vẫn chưa nghĩ xong.
建設公司|阿建在建設公司上班。|A Kiến làm ở công ty xây dựng.
業務經理|他是公司的業務經理。|Anh ấy là quản lý kinh doanh của công ty.
室內設計|她在學室內設計。|Cô ấy đang học thiết kế nội thất.
溫暖|朋友的話讓她覺得溫暖。|Lời bạn bè khiến cô thấy ấm lòng.
目前|她目前在台北工作。|Hiện cô ấy làm việc ở Đài Bắc.
所|她在一所高中讀書。|Cô ấy học ở một trường trung học.
就讀|小玲在台南就讀高中。|Tiểu Linh học trung học ở Đài Nam.
不至於|下雨了，但還不至於取消活動。|Trời mưa rồi nhưng chưa đến mức phải hủy hoạt động.
但|工作忙，但她還是很高興。|Công việc bận, nhưng cô ấy vẫn vui.
放學|放學後我去圖書館。|Tan học tôi đến thư viện.
後|吃飯後，我去看電影。|Ăn cơm xong tôi đi xem phim.
解決|晚餐我自己解決。|Bữa tối tôi tự lo.
寂寞|一個人在家，她覺得很寂寞。|Ở nhà một mình, cô ấy thấy rất cô đơn.
網友|網友常陪她聊天。|Bạn trên mạng thường trò chuyện với cô.
陪伴|家人需要我們的陪伴。|Gia đình cần chúng ta ở bên.
電腦|她打開電腦看新聞。|Cô ấy mở máy tính đọc tin tức.
進入|請先進入聊天室。|Hãy vào phòng chat trước.
線上|這個活動也可以在線上參加。|Hoạt động này cũng có thể tham gia trực tuyến.
感情|他們常聊感情的問題。|Họ thường trò chuyện về chuyện tình cảm.
小氣|老闆太小氣，不請大家吃飯。|Ông chủ keo kiệt, không mời mọi người ăn.
時|心情不好時，可以找朋友聊天。|Khi buồn, có thể tìm bạn tâm sự.
往往|考試前，他往往睡不好。|Trước kỳ thi, anh ấy thường ngủ không ngon.
打氣|朋友們來給她打氣。|Bạn bè đến động viên cô ấy.
安慰|她難過時，媽媽安慰她。|Khi cô buồn, mẹ an ủi cô.
心裡|她心裡有很多話想說。|Trong lòng cô có nhiều điều muốn nói.
大膽|她終於大膽地說出想法。|Cuối cùng cô mạnh dạn nói ra suy nghĩ.
紓解|運動可以幫我紓解壓力。|Vận động giúp tôi giải tỏa áp lực.
轉換|散步可以轉換心情。|Đi dạo có thể giúp đổi tâm trạng.
虛擬|虛擬世界也有風險。|Thế giới ảo cũng có rủi ro.
現實|現實生活和網路不同。|Cuộc sống thực khác với mạng.
心理|考試前的心理壓力很大。|Áp lực tâm lý trước kỳ thi rất lớn.
即使|即使做錯了，也可以再試。|Dù làm sai vẫn có thể thử lại.
責備|他沒有責備我。|Anh ấy không trách tôi.
期待|家人對她有很高的期待。|Gia đình đặt nhiều kỳ vọng vào cô.
喘氣|跑完以後，他一直喘氣。|Chạy xong anh ấy thở dốc mãi.
自在|在朋友家，她覺得很自在。|Ở nhà bạn, cô ấy thấy rất thoải mái.
交友|網路交友要小心。|Kết bạn qua mạng cần cẩn thận.
暴力|她不看有暴力內容的網站。|Cô ấy không xem trang có nội dung bạo lực.
點|不要點不認識的連結。|Đừng bấm vào đường dẫn lạ.
懂得|她懂得保護自己。|Cô ấy biết cách tự bảo vệ mình.
陷阱|小心網路上的陷阱。|Hãy cẩn thận với bẫy trên mạng.
明星高中|她在一所明星高中讀書。|Cô ấy học ở một trường trung học danh tiếng.
早出晚歸|爸爸工作忙，常早出晚歸。|Bố bận việc, thường đi sớm về muộn.
打開|請打開電腦。|Hãy mở máy tính.
喘不過氣|工作太多，讓我喘不過氣。|Nhiều việc quá khiến tôi ngột ngạt.
躲進|她躲進房間看書。|Cô ấy trốn vào phòng đọc sách.
掉進|別掉進網路陷阱裡。|Đừng rơi vào bẫy trên mạng.
"""
EXAMPLE_BY_WORD = {}
for row in EXAMPLES.strip().splitlines():
    word, chinese, vietnamese = row.split("|", 2)
    if word in EXAMPLE_BY_WORD or word not in chinese:
        raise ValueError(f"Invalid vocabulary example for {word}")
    EXAMPLE_BY_WORD[word] = (chinese, vietnamese)
if len(EXAMPLE_BY_WORD) != len(VOCAB):
    raise ValueError("One example is required for every vocabulary item")

GRAMMAR = [
    ("與其A，不如B", "Thà B còn hơn A", "與其 + phương án A，不如 + phương án B", "Nêu hai lựa chọn rồi chọn B vì B hợp lý hơn. Đây là cách nói rõ quan điểm, không chỉ liệt kê hai việc.", ("與其回到冷清的家，不如留在辦公室。", "Thà ở lại văn phòng còn hơn về căn nhà vắng vẻ."), ("與其一直擔心，不如先問清楚。", "Thà hỏi cho rõ trước còn hơn cứ lo mãi."), "Đừng đảo ngược A và B: phương án muốn chọn đứng sau 不如."),
    ("就（ngoại lệ）", "Riêng trường hợp này thì khác", "nhận định chung + 我／他／這個 + 就 + ngoại lệ", "Dùng 就 có nhấn giọng để đưa ra một ngoại lệ trái với điều người khác vừa khái quát. Trong bài, Tiểu Linh phản bác ý 'con gái đều thích phim tình cảm'.", ("並不是所有的女生都喜歡愛情片，我就不喜歡。", "Đâu phải cô gái nào cũng thích phim tình cảm; tôi thì không."), ("大家都說很難，我就覺得還好。", "Ai cũng bảo khó, riêng tôi thấy cũng bình thường."), "Đừng hiểu 就 ở đây là 'ngay lập tức'; ngữ cảnh đang đối chiếu một trường hợp khác biệt."),
    ("就的多種用法", "Nhận ra nghĩa của 就 theo ngữ cảnh", "就 + động từ / mệnh đề, tùy vị trí", "就 còn có thể chỉ kết quả, thứ tự, việc xảy ra sớm hơn dự kiến hoặc số lượng ít. Hãy nhìn vế trước và cả tình huống thay vì dịch cố định thành một từ.", ("讀書讀累了，就玩一下。", "Học mệt thì chơi một lát."), ("走路五分鐘就到了。", "Đi bộ năm phút là đến rồi."), "Đừng gán cùng một nghĩa cho mọi chữ 就; câu đầu nói việc tiếp theo, câu sau nhấn mạnh đến sớm."),
    ("別說A，就是B也…", "Đừng nói A, ngay cả B cũng…", "別說 + A，就是 + B + 也 + kết quả", "Dùng để tăng mức độ: ngay cả trường hợp B đáng ngạc nhiên hơn cũng đúng, huống chi A. Bài học dùng việc nhiều nam giới cũng sợ phim kinh dị để bác suy nghĩ chỉ nữ giới sợ.", ("別說女生，就是男生也有很多不敢看恐怖片的。", "Đừng nói con gái, ngay cả nhiều con trai cũng không dám xem phim kinh dị."), ("別說跑步，就是走一小段路他也累。", "Đừng nói chạy, ngay cả đi một đoạn ngắn anh ấy cũng mệt."), "B phải là trường hợp mạnh hơn hoặc bất ngờ hơn A; nếu không câu sẽ mất sức nhấn."),
    ("簡直", "Quả là; cứ như", "chủ ngữ + 簡直 + nhận xét cường điệu", "Dùng khi người nói thấy sự việc giống như một nhận xét rất mạnh, có phần cường điệu. Không nên hiểu phát biểu ấy theo nghĩa đen.", ("不敢看恐怖片的男生簡直不是男生！", "Con trai mà không dám xem phim kinh dị thì quả là khó tin!"), ("今天熱得簡直像夏天。", "Hôm nay nóng cứ như mùa hè."), "簡直 thể hiện cảm nhận chủ quan; tránh dùng cho số liệu cần chính xác."),
    ("不至於", "Chưa đến mức", "tình huống + 不至於 + hậu quả xấu", "Phủ định một kết quả bị cho là quá nghiêm trọng. Có thể dùng độc lập để trấn an: 'Chưa đến mức đó đâu'.", ("媽媽的工作不至於那麼忙。", "Công việc của mẹ chưa đến mức bận như thế."), ("下雨了，但還不至於取消活動。", "Trời mưa rồi, nhưng chưa đến mức phải hủy hoạt động."), "Khác với 不會 'sẽ không', 不至於 nói mức độ chưa nghiêm trọng tới ngưỡng ấy."),
    ("往往", "Thường có xu hướng", "bối cảnh / điều kiện + 往往 + sự việc lặp lại", "Nói về một khuynh hướng hay xảy ra trong hoàn cảnh nhất định. Trong bài, khi Tiểu Linh buồn, bạn mạng thường động viên cô. So với 常常, 往往 gắn mạnh hơn với quy luật theo tình huống.", ("在她心情不好時，大家往往會安慰她。", "Khi cô ấy buồn, mọi người thường an ủi cô."), ("考試前，他往往睡不好。", "Trước kỳ thi, anh ấy thường ngủ không ngon."), "Không dùng 往往 để hứa một việc sẽ làm thường xuyên trong tương lai; khi đó dùng 常常."),
    ("V著玩", "Làm cho vui", "động từ + 著玩", "Cho biết việc làm chỉ để giải trí, không có mục đích nghiêm túc. Tiểu Linh trò chuyện với bạn mạng cho vui chứ không có ý hẹn gặp.", ("小玲只是聊著玩的。", "Tiểu Linh chỉ trò chuyện cho vui thôi."), ("我只是寫著玩，沒有要投稿。", "Tôi chỉ viết cho vui, không định gửi đăng."), "Đừng hiểu 著 là đang diễn ra trong mọi trường hợp; cả cụm V著玩 diễn tả mục đích 'cho vui'."),
]


def q(group, index, prompt, correct, wrong1, wrong2, feedback, skill, **extra):
    return make_question(PREFIX, group, index, (prompt, correct, [wrong1, wrong2], feedback, skill), **extra)


def build():
    dialogue = [{"speaker": who, **sentence(chinese, vi)} for who, chinese, vi in DIALOGUE]
    reading = [{"speaker": "Bài đọc", **sentence(chinese, vi)} for chinese, vi in READING]
    vocab_rows = []
    for index, (traditional, meaning, word_class) in enumerate(VOCAB, 1):
        example = EXAMPLE_BY_WORD[traditional]
        vocab_rows.append({"id": f"{PREFIX}-v{index:03d}", "traditional": traditional,
                           "simplified": simplified(traditional),
                           "pinyin": " ".join(lazy_pinyin(traditional, style=Style.TONE)),
                           "meaningVi": meaning, "wordClass": word_class,
                           "exampleTraditional": example[0],
                           "exampleSimplified": simplified(example[0]),
                           "exampleVi": example[1]})
    grammar = []
    for index, (title, label, structure, explanation, ex1, ex2, mistake) in enumerate(GRAMMAR, 1):
        grammar.append({"id": f"{PREFIX}-grammar-{index:02d}", "title": title,
                        "audioTrackId": f"cc4-textbook-l01-t{index + 4:02d}",
                        "explanation": f"{label}. {explanation}", "structure": structure,
                        "examples": [sentence(*ex1), sentence(*ex2)], "commonMistake": mistake,
                        "check": q("grammar-check", index, f"Mẫu {title} diễn đạt ý nào?", label,
                                   "Chỉ một thời điểm cụ thể", "Một lời hứa chắc chắn", explanation, "Ngữ pháp")})
    checks = [
        q("check", 1, "Tiểu Linh thật ra bao nhiêu tuổi?", "17 tuổi", "25 tuổi", "32 tuổi", "Bài đọc mở đầu bằng 十七歲的小玲; trong phòng chat cô nói mình 25 tuổi.", "Đọc hiểu"),
        q("check", 2, "Vì sao Tiểu Linh thích trò chuyện trên mạng?", "Cô được an ủi và dễ mở lòng hơn.", "Cô không có bạn ở trường.", "Cô muốn bỏ học.", "Bài đọc nói bạn mạng động viên cô; dù có bạn ở trường, cô thấy dễ nói chuyện trên mạng hơn.", "Đọc hiểu"),
    ]
    listening = [
        q("listening", 1, "Nghe hội thoại: Tiểu Linh tự nhận mình làm gì?", "Là người đi làm", "Là giáo viên", "Là nhân viên rạp phim", "Cô nói 我是上班族, nhưng bài đọc cho biết cô thực ra là học sinh.", "Nghe hiểu", audioTrackId="cc4-textbook-l01-t01"),
        q("listening", 2, "Nghe hội thoại: hai người bàn về loại phim nào?", "Phim kinh dị", "Phim tài liệu", "Phim hoạt hình", "Tiểu Linh nói mình thích xem 恐怖片 nhất.", "Nghe hiểu", audioTrackId="cc4-textbook-l01-t01"),
        q("listening", 3, "Nghe bài đọc: bố Tiểu Linh thường thế nào?", "Đi làm sớm, về muộn", "Làm việc tại nhà", "Không đi làm", "Bài đọc dùng 早出晚歸 để tả lịch làm việc của bố.", "Nghe hiểu", audioTrackId="cc4-textbook-l01-t03"),
        q("listening", 4, "Nghe bài đọc: Tiểu Linh tránh điều gì trên mạng?", "Trang có nội dung khiêu dâm hoặc bạo lực", "Trò chơi lịch sử", "Phòng chat bạn bè", "Cô biết nguy hiểm nên không bấm vào 色情、暴力網站.", "Nghe hiểu", audioTrackId="cc4-textbook-l01-t03"),
    ]
    practice = [
        q("practice", 1, "與其回到冷清的家，____留在辦公室。", "不如", "往往", "即使", "與其A，不如B: thà ở văn phòng còn hơn về nhà vắng vẻ.", "Ngữ pháp", kind="fill"),
        q("practice", 2, "Từ nào chỉ 'bạn trên mạng'?", "網友", "部門", "膽子", "網友 là người quen và trò chuyện qua mạng.", "Từ vựng"),
        q("practice", 3, "'Đâu phải ai cũng thích; riêng tôi không thích' cần chữ nào để nhấn ngoại lệ?", "就", "往往", "但", "就 nhấn riêng trường hợp của người nói, trái với lời khái quát trước đó.", "Ngữ pháp"),
        q("practice", 4, "不至於那麼忙 có nghĩa gì?", "Chưa đến mức bận như thế", "Không bao giờ bận", "Bận hơn mọi người", "不至於 phủ định mức độ quá nghiêm trọng, không phủ định việc có bận.", "Ngữ pháp"),
        q("practice", 5, "Tiểu Linh học ở đâu theo bài đọc?", "Một trường trung học danh tiếng", "Đại học ở Đài Bắc", "Trường thiết kế nội thất", "Bài đọc nói cô hiện 就讀 ở một 所明星高中.", "Đọc hiểu"),
        q("practice", 6, "往往 phù hợp nhất với tình huống nào?", "Khi buồn, cô thường được bạn mạng an ủi.", "Ngày mai chắc chắn cô đi xem phim.", "Cô chỉ vừa mở máy tính một lần.", "往往 nêu khuynh hướng lặp lại trong một bối cảnh.", "Ngữ pháp"),
        q("practice", 7, "'Giải tỏa áp lực' trong bài đọc là cụm nào?", "紓解壓力", "責備別人", "掉進陷阱", "Chơi game là một cách 紓解壓力 của Tiểu Linh.", "Từ vựng"),
        q("practice", 8, "Trong hội thoại, Tiểu Linh nói 25 tuổi nhưng bài đọc nói 17 tuổi. Nhận xét nào đúng?", "Cô đã nói sai tuổi trong phòng chat.", "Cô vừa đổi trường.", "A Kiến biết tuổi thật ngay từ đầu.", "Chính sự lệch giữa hội thoại và bài đọc tạo tình huống của bài.", "Đọc hiểu"),
    ]
    assessment = [
        q("assessment", 1, "'Phòng chat' là từ nào?", "聊天室", "電影院", "建設公司", "聊天室 là nơi hai nhân vật gặp nhau trên mạng.", "Từ vựng"),
        q("assessment", 2, "'Tăng ca' là từ nào?", "加班", "放學", "交友", "加班 là làm việc ngoài giờ.", "Từ vựng"),
        q("assessment", 3, "Chọn câu diễn tả 'thà B hơn A'.", "與其回家，不如留在這裡。", "即使回家，也留在這裡。", "回家後，往往留在這裡。", "與其A，不如B nêu phương án B được ưu tiên.", "Ngữ pháp"),
        q("assessment", 4, "'Ngay cả con trai cũng có người sợ phim kinh dị' dùng mẫu nào?", "別說女生，就是男生也…", "與其女生，不如男生…", "女生往往男生…", "別說A，就是B也… tăng mức độ bằng trường hợp B bất ngờ hơn.", "Ngữ pháp"),
        q("assessment", 5, "'Chưa đến mức phải hủy' nói thế nào?", "還不至於取消。", "往往取消。", "簡直取消。", "不至於 cho biết chưa đến mức xảy ra kết quả đó.", "Ngữ pháp"),
        q("assessment", 6, "小玲只是聊著玩的。Ý của 著玩 là gì?", "Trò chuyện cho vui", "Đang chơi một trò game", "Nói chuyện để xin việc", "Cả cụm 聊著玩 diễn tả việc làm chỉ để vui.", "Ngữ pháp"),
        q("assessment", 7, "Điều gì khiến căn nhà của Tiểu Linh vắng vẻ?", "Bố mẹ thường về muộn hoặc tăng ca.", "Nhà đang sửa chữa.", "Cô chuyển đến nơi khác.", "Bài đọc nêu bố 早出晚歸, mẹ cũng thường 加班.", "Đọc hiểu"),
        q("assessment", 8, "Tiểu Linh dùng trò chơi trực tuyến để làm gì?", "Giải tỏa áp lực và đổi tâm trạng", "Tìm việc làm", "Bán hàng", "Bài đọc ghi chơi game là cách 紓解壓力, 轉換心情.", "Đọc hiểu"),
        q("assessment", 9, "Tiểu Linh hiểu nguy cơ nào của việc kết bạn qua mạng?", "Có thể rơi vào bẫy trên mạng", "Mọi trò chơi đều mất tiền", "Không thể học lịch sử", "Cô tránh trang nguy hiểm để không 掉進網路陷阱.", "Đọc hiểu"),
        q("assessment", 10, "Phân biệt 就 trong '我就不喜歡':", "Nêu riêng một ngoại lệ", "Chỉ việc xảy ra hôm qua", "Nêu số lượng ít", "Trước đó A Kiến nói con gái đều thích phim tình cảm; cô dùng 就 để phản bác bằng trường hợp mình.", "Ngữ pháp"),
    ]
    lesson = {"contentVersion": 2, "id": PREFIX, "title": "十七歲還是二十五歲？", "titleVi": "Mười bảy hay hai mươi lăm tuổi?",
              "description": "Từ một cuộc trò chuyện trên mạng, học cách nói về danh tính, sở thích và khoảng cách giữa đời thực với thế giới ảo.",
              "objectives": ["Hiểu hội thoại và nhận ra thông tin Tiểu Linh nói khác với sự thật trong bài đọc.",
                             "Nói về lựa chọn, ngoại lệ, mức độ và thói quen bằng các mẫu ngữ pháp của bài.",
                             "Đọc về việc kết bạn trên mạng, sự hỗ trợ tinh thần và cách tự bảo vệ bản thân."],
              "estimatedMinutes": None,
              "lecture": {"introduction": "Một cuộc trò chuyện trong phòng chat mở ra câu hỏi: người trên mạng có đúng như họ kể? Hãy nghe hội thoại trước, rồi đọc bài để tìm tuổi thật và cuộc sống của Tiểu Linh.",
                          "sections": [
                              {"id": f"{PREFIX}-section-01", "title": "Nghe trước khi đọc", "body": "Chú ý những gì Tiểu Linh tự giới thiệu: tuổi, công việc, nơi sống và sở thích. Đừng vội tin mọi chi tiết.", **sentence(DIALOGUE[5][1], DIALOGUE[5][2])},
                              {"id": f"{PREFIX}-section-02", "title": "Đối chiếu với bài đọc", "body": "Bài đọc cho biết tuổi thật, trường học và lý do cô tìm đến bạn trên mạng. So sánh hai nguồn thông tin để hiểu câu chuyện.", **sentence("十七歲的小玲是家裡的獨生女，目前在一所明星高中就讀。", "Tiểu Linh mười bảy tuổi, là con một và hiện học ở một trường trung học danh tiếng.")},
                              {"id": f"{PREFIX}-section-03", "title": "Đọc sâu hơn", "body": "Tìm hai mặt của mạng: sự an ủi mà Tiểu Linh nhận được và những rủi ro cô chủ động tránh.", **sentence("她也知道懂得保護自己，才不會掉進這種網路陷阱裡。", "Cô hiểu phải tự bảo vệ mình thì mới không rơi vào bẫy trên mạng.")},
                          ],
                          "dialogues": [
                              {"id": f"{PREFIX}-dialogue", "title": "Cuộc trò chuyện trong phòng chat", "context": "A Kiến và Tiểu Linh lần đầu trò chuyện trên mạng.", "audioTrackId": "cc4-textbook-l01-t01", "turns": dialogue},
                              {"id": f"{PREFIX}-reading", "title": "冷清的家，溫暖的網路", "context": "Bài đọc: gia đình, bạn mạng và cách Tiểu Linh tự bảo vệ.", "audioTrackId": "cc4-textbook-l01-t03", "turns": reading},
                          ], "checks": checks, "pronunciation": [], "culture": []},
              "vocabulary": {"introduction": "Chạm vào từ để xem phiên âm và nghĩa.", "wordIds": [row["id"] for row in vocab_rows],
                             "audioTracks": [{"id": "cc4-textbook-l01-t02", "label": "Từ vựng hội thoại"}, {"id": "cc4-textbook-l01-t04", "label": "Từ vựng bài đọc"}]},
              "grammar": grammar, "listening": listening, "practice": practice, "assessment": assessment,
              "writingTask": {"id": f"{PREFIX}-writing", "title": "Viết về cách dùng mạng an toàn", "prompt": "Viết 4–5 câu tiếng Hoa về một lợi ích và một rủi ro của việc kết bạn trên mạng. Thử dùng 與其…不如… hoặc 即使…."}}
    for name, value in [("cc4-lesson01.json", lesson), ("cc4-lesson01-vocabulary.json", {"lessonId": PREFIX, "records": vocab_rows})]:
        (ROOT / "data/academy" / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    reviewed = {"cc4-textbook-l01-t01": {"transcriptTraditional": "\n".join(f"{who}：{chinese}" for who, chinese, _ in DIALOGUE),
                                        "transcriptSimplified": "\n".join(f"{simplified(who)}：{simplified(chinese)}" for who, chinese, _ in DIALOGUE),
                                        "translationVi": "\n".join(f"{who}：{vi}" for who, _, vi in DIALOGUE)},
                "cc4-textbook-l01-t03": {"transcriptTraditional": "\n\n".join(chinese for chinese, _ in READING),
                                        "transcriptSimplified": "\n\n".join(simplified(chinese) for chinese, _ in READING),
                                        "translationVi": "\n\n".join(vi for _, vi in READING)}}
    (ROOT / "data/academy/cc4-reviewed-content.json").write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    all_text = json.dumps(lesson, ensure_ascii=False) + json.dumps(vocab_rows, ensure_ascii=False)
    script_map = {char: CONVERT.convert(char) for char in set(all_text) if CONVERT.convert(char) != char}
    (ROOT / "data/academy/cc4-script-map.json").write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {PREFIX}: {len(dialogue)} dialogue turns, {len(reading)} reading paragraphs, {len(vocab_rows)} vocabulary entries, {len(grammar)} grammar points")


if __name__ == "__main__":
    build()
