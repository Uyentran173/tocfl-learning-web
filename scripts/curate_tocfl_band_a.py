"""Apply checked Band A meaning/example corrections to draft and override data."""

import json
import re
from pathlib import Path

from opencc import OpenCC

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT.parent / 'tocfl-band-work'
SOURCE = ROOT / 'data/vocabulary/tocfl-imported.json'
OVERRIDES = ROOT / 'data/vocabulary/tocfl-enrichment-overrides.json'
PREVIEW = WORK / 'band-a-preview.json'
CANDIDATES = WORK / 'band-a-candidates.json'
CONVERT = OpenCC('tw2s')

# A value is (Vietnamese meaning, Traditional example, Vietnamese example).
# Leaving either example blank keeps the attributed corpus sentence.
FIXES = {
    ('level_1', '零'): ('số không', '這個數字是零。', 'Con số này là số không.'),
    ('level_1', '家庭'): ('gia đình', '我的家庭有四個人。', 'Gia đình tôi có bốn người.'),
    ('level_1', '年輕'): ('trẻ; trẻ tuổi', '我媽媽很年輕。', 'Mẹ tôi rất trẻ.'),
    ('level_1', '女生'): ('nữ sinh; học sinh nữ', '這個班有十個女生。', 'Lớp này có mười nữ sinh.'),
    ('level_1', '號碼'): ('số; số hiệu', '請寫下你的電話號碼。', 'Hãy viết số điện thoại của bạn.'),
    ('level_1', '在'): ('đang; ở', '我的書在桌上。', 'Sách của tôi ở trên bàn.'),
    ('level_1', '哪'): ('nào; ở đâu', '哪本書是你的？', 'Cuốn sách nào là của bạn?'),
    ('level_1', '城市/城'): ('thành phố', '這個城市有很多公園。', 'Thành phố này có nhiều công viên.'),
    ('level_1', '禮拜'): ('tuần', '下個禮拜我要去台南。', 'Tuần sau tôi sẽ đến Đài Nam.'),
    ('level_1', '結婚'): ('kết hôn', '我哥哥明年要結婚。', 'Anh trai tôi sẽ kết hôn vào năm sau.'),
    ('level_1', '行'): ('được; ổn', '這樣行嗎？', 'Làm như vậy có được không?'),
    ('level_1', '還'): ('trả lại; hoàn lại', '我明天還你這本書。', 'Ngày mai tôi sẽ trả bạn cuốn sách này.'),
    ('level_1', '地'): ('mặt đất; đất', '孩子坐在地上。', 'Đứa trẻ ngồi trên mặt đất.'),
    ('level_1', '鳥'): ('chim', '樹上有一隻鳥。', 'Trên cây có một con chim.'),
    ('level_1', '長'): ('dài', '這條路很長。', 'Con đường này rất dài.'),
    ('level_1', '脫'): ('cởi; tháo', '天氣熱了，我脫下外套。', 'Trời nóng rồi, tôi cởi áo khoác.'),
    ('level_1', '踢'): ('đá', '他在公園踢球。', 'Anh ấy đá bóng trong công viên.'),
    ('level_1', '次'): ('lần', '我去過台北兩次。', 'Tôi đã đến Đài Bắc hai lần.'),
    ('level_1', '才'): ('mới; chỉ mới', '他十點才回家。', 'Mãi đến mười giờ anh ấy mới về nhà.'),
    ('level_1', '喂'): ('alô; này', '喂，請問你找誰？', 'Alô, xin hỏi bạn tìm ai?'),
    ('level_1', '拉'): ('kéo', '請幫我拉開門。', 'Hãy giúp tôi kéo cửa ra.'),
    ('level_1', '信'): ('thư', '昨天他寫好了一封信。', 'Hôm qua anh ấy đã viết xong một lá thư.'),
    ('level_1', '旅館'): ('nhà nghỉ; khách sạn', '我們住在車站附近的旅館。', 'Chúng tôi ở khách sạn gần nhà ga.'),
    ('level_1', '掉'): ('rơi; mất đi', '我的筆掉在地上了。', 'Bút của tôi rơi xuống đất.'),
    ('level_1', '份'): ('phần; suất', '我想點一份炒飯。', 'Tôi muốn gọi một phần cơm chiên.'),
    ('level_1', '片'): ('miếng; lát', '我吃了一片麵包。', 'Tôi ăn một lát bánh mì.'),
    ('level_1', '香'): ('thơm', '這碗湯聞起來很香。', 'Bát canh này có mùi rất thơm.'),
    ('level_1', '過'): ('đi qua; vượt qua', '我每天過這座橋。', 'Ngày nào tôi cũng đi qua cây cầu này.'),
    ('level_1', '讓'): ('để; cho phép', '請讓我看看。', 'Hãy để tôi xem thử.'),
    ('level_1', '呀'): ('nhé; đấy (trợ từ cảm thán)', '今天的天氣真好呀！', 'Thời tiết hôm nay đẹp quá!'),
    ('level_1', '不過'): ('nhưng; tuy nhiên', '我想去，不過今天沒時間。', 'Tôi muốn đi, nhưng hôm nay không có thời gian.'),
    ('level_1', '上學'): ('đi học', '我每天八點上學。', 'Ngày nào tôi cũng đi học lúc tám giờ.'),
    ('level_1', '肚(子)'): ('bụng', '我的肚子有點痛。', 'Bụng tôi hơi đau.'),
    ('level_1', '上網'): ('lên mạng', '', 'Tôi thường lên mạng đọc blog bằng tiếng Anh và tiếng Trung.'),
    ('level_1', '襪(子)'): ('tất; vớ', '', 'Anh ấy mang vớ ngược.'),
    ('level_1', '褲(子)'): ('quần', '', 'Anh ấy mặc chiếc quần sạch.'),
    ('level_1', '冰淇淋'): ('kem', '', 'Bạn không nên ăn nhiều kem như vậy.'),
    ('level_2', '不久'): ('chẳng bao lâu; mới đây', '', 'Anh ấy vừa đến đây chưa lâu.'),
    ('level_2', '阿姨'): ('dì; cô', '', 'Dì tôi mang hoa đến cho tôi.'),
    ('level_2', '室友'): ('bạn cùng phòng', '', 'Bạn cùng phòng của tôi đang học tiếng Trung.'),
    ('level_2', '晴天'): ('ngày nắng đẹp', '', 'Hy vọng Chủ Nhật trời sẽ nắng đẹp.'),
    ('level_2', '拖鞋'): ('dép lê', '', 'Hãy mang đôi dép lê này.'),
    ('level_2', '野餐'): ('dã ngoại; đi picnic', '', 'Tôi vẫn nhớ lần chúng ta cùng đi dã ngoại.'),
    ('level_2', '留'): ('ở lại; giữ lại', '', 'Ở lại hay rời đi là quyền của bạn.'),
    ('level_2', '掛號'): ('gửi bảo đảm; đăng ký khám', '', 'Hãy gửi món này bằng thư bảo đảm.'),
    ('level_2', '套'): ('bộ (lượng từ)', '', 'Cô ấy mua một bộ quần áo mới.'),
    ('level_2', '春假'): ('kỳ nghỉ xuân', '', 'Tôi dự định đến Úc vào kỳ nghỉ xuân.'),
    ('level_2', '火腿'): ('thịt giăm bông', '', 'Tôi nghĩ bạn nên ăn bánh mì kẹp thịt giăm bông.'),
    ('level_2', '月亮'): ('mặt trăng', '', 'Họ thích những ngôi sao đẹp và mặt trăng.'),
    ('level_2', '下'): ('rơi; đổ xuống (mưa)', '', 'Mưa đã rơi từ sáng đến giờ.'),
    ('level_2', '刷(子) / 刷'): ('chải; cọ; quét', '他每天刷牙。', 'Anh ấy đánh răng mỗi ngày.'),
    ('level_2', '座'): ('chỗ ngồi; tòa (lượng từ)', '這座山很高。', 'Ngọn núi này rất cao.'),
    ('level_2', '米'): ('gạo', '這袋米很重。', 'Bao gạo này rất nặng.'),
    ('level_2', '上'): ('lên; đi lên', '他走上樓梯。', 'Anh ấy đi lên cầu thang.'),
    ('level_2', '毛'): ('hào; một phần mười đồng', '這支筆只要五毛錢。', 'Cây bút này chỉ có giá năm hào.'),
    ('level_2', '光'): ('hết; sạch (bổ ngữ kết quả)', '他把錢花光了。', 'Anh ấy đã tiêu hết tiền.'),
    ('level_2', '死'): ('chết', '那棵老樹死了。', 'Cây già đó đã chết.'),
    ('level_2', '炒'): ('xào; rang', '媽媽正在炒青菜。', 'Mẹ đang xào rau.'),
    ('level_2', '炸'): ('chiên; rán', '他喜歡吃炸雞。', 'Anh ấy thích ăn gà rán.'),
    ('level_2', '整'): ('cả; nguyên', '他忙了一整天。', 'Anh ấy bận cả ngày.'),
    ('level_2', '煩'): ('phiền; bực mình', '這件事真煩。', 'Chuyện này thật phiền.'),
    ('level_2', '且'): ('và; hơn nữa', '這個方法簡單且有效。', 'Cách này đơn giản và hiệu quả.'),
    ('level_2', '泡'): ('pha; ngâm', '我泡了一杯烏龍茶。', 'Tôi pha một tách trà ô long.'),
    ('level_2', '空'): ('trống; rỗng', '教室裡是空的。', 'Trong lớp học không có ai.'),
    ('level_2', '枕頭(˙ㄊㄡ)'): ('cái gối', '我的枕頭很軟。', 'Gối của tôi rất mềm.'),
    ('level_2', '底'): ('đáy; phía dưới', '杯子底還有一點水。', 'Dưới đáy cốc vẫn còn một ít nước.'),
    ('level_2', '臭'): ('hôi; thối', '這雙鞋有點臭。', 'Đôi giày này hơi hôi.'),
    ('level_2', '顆'): ('viên; hạt (lượng từ)', '她吃了一顆藥。', 'Cô ấy uống một viên thuốc.'),
    ('level_2', '笨'): ('ngốc; chậm hiểu', '他不笨，只是還沒學會。', 'Anh ấy không ngốc, chỉ là chưa học được thôi.'),
    ('level_2', '抓'): ('bắt; nắm lấy', '他抓住了飛走的帽子。', 'Anh ấy chộp lấy chiếc mũ đang bay đi.'),
    ('level_2', '圓'): ('tròn', '這個盤子是圓的。', 'Cái đĩa này có hình tròn.'),
    ('level_2', '船/船兒'): ('thuyền; tàu', '這艘船要去澎湖。', 'Con tàu này sẽ đi Bành Hồ.'),
}

# Short glosses for entries where the draft inherited a sentence-specific sense.
MEANING_FIXES = {
    ('level_1', '奶奶'): 'bà nội',
    ('level_1', '哭'): 'khóc',
    ('level_1', '聰明'): 'thông minh',
    ('level_1', '相信'): 'tin tưởng',
    ('level_1', '習慣'): 'thói quen; quen với',
    ('level_1', '辦公室'): 'văn phòng',
    ('level_1', '下班'): 'tan làm',
    ('level_1', '計畫/計劃'): 'kế hoạch; lên kế hoạch',
    ('level_1', '如果'): 'nếu',
    ('level_1', '開學'): 'bắt đầu năm học; khai giảng',
    ('level_1', '作業'): 'bài tập',
    ('level_1', '讀書'): 'đọc sách; học bài',
    ('level_1', '圖'): 'hình vẽ; bức tranh',
    ('level_1', '清楚'): 'rõ ràng',
    ('level_1', '交'): 'nộp; giao',
    ('level_1', '樓上'): 'tầng trên; trên lầu',
    ('level_1', '樓下'): 'tầng dưới; dưới lầu',
    ('level_1', '關'): 'đóng',
    ('level_1', '電'): 'điện',
    ('level_1', '湖'): 'hồ',
    ('level_1', '洗澡'): 'tắm',
    ('level_1', '發現'): 'phát hiện; nhận ra',
    ('level_1', '游泳'): 'bơi',
    ('level_1', '跑/跑步'): 'chạy; chạy bộ',
    ('level_1', '棒球'): 'bóng chày',
    ('level_1', '音樂'): 'âm nhạc',
    ('level_1', '有時候(˙ㄏㄡ)/有時'): 'đôi khi; có lúc',
    ('level_1', '客氣(˙ㄑㄧ)'): 'khách sáo; lịch sự',
    ('level_1', '不好意思'): 'ngại; xin lỗi',
    ('level_1', '怎麼辦'): 'làm thế nào; phải làm sao',
    ('level_1', '車站'): 'nhà ga; trạm xe',
    ('level_1', '飯店'): 'nhà hàng; khách sạn',
    ('level_1', '參觀'): 'tham quan',
    ('level_1', '風景'): 'phong cảnh',
    ('level_1', '西/西部'): 'phía tây; miền tây',
    ('level_1', '中間'): 'ở giữa; trung gian',
    ('level_1', '離'): 'cách; rời xa',
    ('level_1', '送'): 'tặng; đưa tiễn',
    ('level_1', '向'): 'hướng về; với',
    ('level_1', '商店'): 'cửa hàng',
    ('level_1', '手錶/手表/錶/表'): 'đồng hồ đeo tay',
    ('level_1', '裙(子)'): 'váy',
    ('level_1', '試'): 'thử',
    ('level_1', '輕'): 'nhẹ',
    ('level_1', '重'): 'nặng',
    ('level_1', '特別'): 'đặc biệt',
    ('level_1', '漢堡'): 'bánh hamburger',
    ('level_1', '蘋果'): 'táo',
    ('level_1', '啤酒'): 'bia',
    ('level_1', '點心'): 'món ăn nhẹ; điểm tâm',
    ('level_1', '叉(子)'): 'cái nĩa',
    ('level_1', '湯匙'): 'thìa; muỗng',
    ('level_1', '盤/盤(子)'): 'cái đĩa',
    ('level_1', '瓶/瓶(子)'): 'chai; lọ',
    ('level_1', '味道'): 'mùi vị; hương vị',
    ('level_1', '苦'): 'đắng',
    ('level_1', '辣'): 'cay',
    ('level_1', '所有'): 'tất cả',
    ('level_1', '把'): 'đem; lấy (giới từ đưa tân ngữ lên trước)',
    ('level_1', '被'): 'bị (trợ từ câu bị động)',
    ('level_1', '那麼'): 'như thế; vậy thì',
    ('level_1', '這麼'): 'như thế này; đến mức này',
    ('level_1', '啦'): 'rồi; nhé (trợ từ cuối câu)',
    ('level_1', '一下(子)/一下子兒'): 'một chút; một lát',
    ('level_2', '出生'): 'sinh ra',
    ('level_2', '母語'): 'tiếng mẹ đẻ',
    ('level_2', '白天(˙ㄊㄧㄢ)'): 'ban ngày',
    ('level_2', '夜晚'): 'ban đêm; buổi tối',
    ('level_2', '早點'): 'sớm hơn; điểm tâm',
    ('level_2', '外公'): 'ông ngoại',
    ('level_2', '外婆'): 'bà ngoại',
    ('level_2', '伯伯(˙ㄅㄛ)/伯'): 'bác trai (anh của bố)',
    ('level_2', '伯父'): 'bác trai',
    ('level_2', '伯母'): 'bác gái',
    ('level_2', '叔叔(˙ㄕㄨ)/叔'): 'chú (em trai của bố)',
    ('level_2', '姑姑(˙ㄍㄨ)'): 'cô (chị hoặc em gái của bố)',
    ('level_2', '孫子'): 'cháu trai',
    ('level_2', '傷心'): 'đau lòng; buồn',
    ('level_2', '美麗'): 'đẹp',
    ('level_2', '帥'): 'đẹp trai',
    ('level_2', '禮貌'): 'lễ phép; phép lịch sự',
    ('level_2', '差'): 'kém; tệ',
    ('level_2', '身邊'): 'bên cạnh',
    ('level_2', '長大'): 'lớn lên; trưởng thành',
    ('level_2', '開會'): 'họp; tham dự cuộc họp',
    ('level_2', '管理'): 'quản lý',
    ('level_2', '辦'): 'làm; xử lý; tổ chức',
    ('level_2', '打工'): 'làm thêm',
    ('level_2', '考'): 'thi; kiểm tra',
    ('level_2', '念書/唸書'): 'học bài; đọc sách',
    ('level_2', '歷史'): 'lịch sử',
    ('level_2', '作文'): 'bài văn; viết văn',
    ('level_2', '除'): 'trừ; ngoại trừ; chia',
    ('level_2', '暑假'): 'kỳ nghỉ hè',
    ('level_2', '假'): 'nghỉ phép; ngày nghỉ',
    ('level_2', '放假'): 'nghỉ học; nghỉ lễ',
    ('level_2', '同意'): 'đồng ý',
    ('level_2', '以上'): 'trở lên; ở trên',
    ('level_2', '以下'): 'trở xuống; ở dưới',
    ('level_2', '討論'): 'thảo luận',
    ('level_2', '建議'): 'đề nghị; lời khuyên',
    ('level_2', '櫃(子)'): 'cái tủ',
    ('level_2', '傘'): 'cái ô; cây dù',
    ('level_2', '乾'): 'khô',
    ('level_2', '季節'): 'mùa; mùa trong năm',
    ('level_2', '環保'): 'bảo vệ môi trường',
    ('level_2', '底下(˙ㄒㄧㄚ)'): 'bên dưới',
    ('level_2', '流'): 'chảy',
    ('level_2', '流汗'): 'đổ mồ hôi',
    ('level_2', '夢'): 'giấc mơ; mơ',
    ('level_2', '鬧鐘'): 'đồng hồ báo thức',
    ('level_2', '收'): 'nhận; thu; cất',
    ('level_2', '樂器'): 'nhạc cụ',
    ('level_2', '吉他'): 'đàn guitar',
    ('level_2', '游'): 'bơi; đi chơi',
    ('level_2', '合作'): 'hợp tác',
    ('level_2', '請客'): 'mời ăn; đãi khách',
    ('level_2', '郵票'): 'tem thư',
    ('level_2', '弄'): 'làm; xử lý',
    ('level_2', '一塊/一塊兒'): 'cùng nhau; một miếng',
    ('level_2', '當中'): 'ở giữa; trong số đó',
    ('level_2', '法律'): 'pháp luật',
    ('level_2', '捷運'): 'tàu điện đô thị (MRT)',
    ('level_2', '飛'): 'bay',
    ('level_2', '歐洲'): 'châu Âu',
    ('level_2', '亞洲'): 'châu Á',
    ('level_2', '大陸'): 'lục địa; đại lục',
    ('level_2', '咳嗽'): 'ho',
    ('level_2', '正常'): 'bình thường',
    ('level_2', '百貨公司'): 'cửa hàng bách hóa',
    ('level_2', '排隊'): 'xếp hàng',
    ('level_2', '刷卡'): 'quẹt thẻ; thanh toán bằng thẻ',
    ('level_2', '存'): 'tiết kiệm; gửi tiền',
    ('level_2', '合適'): 'phù hợp',
    ('level_2', '沙拉'): 'món salad',
    ('level_2', '海鮮'): 'hải sản',
    ('level_2', '熱狗'): 'bánh mì xúc xích',
    ('level_2', '饅頭'): 'bánh bao không nhân; màn thầu',
    ('level_2', '葡萄(˙ㄊㄠ)'): 'nho',
    ('level_2', '芒果'): 'xoài',
    ('level_2', '鹽'): 'muối',
    ('level_2', '任何'): 'bất kỳ',
    ('level_2', '許多'): 'nhiều',
    ('level_2', '結果'): 'kết quả; rốt cuộc',
    ('level_2', '左右'): 'khoảng; chừng; trái phải',
    ('level_2', '當'): 'khi; làm; đảm nhiệm',
    ('level_2', '類'): 'loại; hạng',
    ('level_2', '樣'): 'loại; kiểu',
    ('level_2', '倍'): 'lần; gấp',
    ('level_2', '越'): 'càng... càng...',
    ('level_2', '別的'): 'khác',
    ('level_2', '連'): 'ngay cả; nối liền',
    ('level_2', '相當'): 'khá; tương đương',
    ('level_2', '約'): 'hẹn; thỏa thuận',
    ('level_2', '可樂'): 'nước ngọt cola',
    ('level_2', '自然'): 'tự nhiên; đương nhiên',
    ('level_2', '皮鞋'): 'giày da',
    ('level_1', '成績'): 'điểm số; thành tích học tập',
    ('level_1', '支'): 'lượng từ chỉ vật dài, mảnh',
    ('level_2', '多麼'): 'biết bao; thật là',
    ('level_1', '護士'): 'y tá; điều dưỡng',
}

TRANSLATION_FIXES = {
    ('level_1', '護士'): 'Y tá sẽ hướng dẫn bạn cách thực hiện.',
    ('level_2', '皮鞋'): 'Đôi giày da màu đen của tôi cần sửa lại gót.',
}

def main():
    source = json.loads(SOURCE.read_text(encoding='utf-8'))
    by_key = {}
    for record in source['records']:
        if record['band'] == 'band_a':
            by_key.setdefault((record['levelId'], record['traditional']), []).append(record)
    overrides = json.loads(OVERRIDES.read_text(encoding='utf-8'))
    preview = json.loads(PREVIEW.read_text(encoding='utf-8'))
    candidates = json.loads(CANDIDATES.read_text(encoding='utf-8'))
    for key, (meaning, sentence, translation) in FIXES.items():
        if key not in by_key:
            raise ValueError(f'Unknown Band A key: {key}')
        records = by_key[key]
        if key == ('level_1', '行'):
            records = [r for r in records if r['partOfSpeech']['raw'] == 'Vs']
        if key == ('level_1', '地'):
            records = [r for r in records if r['partOfSpeech']['raw'] == 'N']
        for record in records:
            word_id = record['id']
            patch = {'meaningVi': meaning, 'exampleVi': translation}
            if sentence:
                patch.update(exampleTraditional=sentence, exampleSimplified=CONVERT.convert(sentence))
                preview['entries'][word_id].pop('exampleSource', None)
                candidates['entries'][word_id]['exampleTraditional'] = sentence
                candidates['entries'][word_id].pop('exampleSource', None)
            overrides['entries'].setdefault(word_id, {}).update(patch)
            preview['entries'][word_id].update(patch)
    for key, meaning in MEANING_FIXES.items():
        if key not in by_key:
            raise ValueError(f'Unknown Band A gloss key: {key}')
        for record in by_key[key]:
            word_id = record['id']
            overrides['entries'].setdefault(word_id, {})['meaningVi'] = meaning
            preview['entries'][word_id]['meaningVi'] = meaning
    for key, translation in TRANSLATION_FIXES.items():
        if key not in by_key:
            raise ValueError(f'Unknown Band A translation key: {key}')
        for record in by_key[key]:
            word_id = record['id']
            overrides['entries'].setdefault(word_id, {})['exampleVi'] = translation
            preview['entries'][word_id]['exampleVi'] = translation
    for record in by_key[('level_1', '地')]:
        if record['partOfSpeech']['raw'] != 'Ptc':
            continue
        word_id = record['id']
        sentence = '他高興地笑了。'
        patch = {'meaningVi': 'một cách... (trợ từ chỉ trạng thái)',
                 'exampleTraditional': sentence,
                 'exampleSimplified': CONVERT.convert(sentence),
                 'exampleVi': 'Anh ấy vui vẻ cười.'}
        overrides['entries'].setdefault(word_id, {}).update(patch)
        preview['entries'][word_id].update(patch)
        preview['entries'][word_id].pop('exampleSource', None)
        candidates['entries'][word_id]['exampleTraditional'] = sentence
        candidates['entries'][word_id].pop('exampleSource', None)
    for record in source['records']:
        if record['band'] != 'band_a':
            continue
        word_id = record['id']
        entry = preview['entries'][word_id]
        original = entry['exampleTraditional']
        translated = entry['exampleVi']
        if '弟弟' in original and '哥哥' not in original:
            translated = translated.replace('Anh trai', 'Em trai').replace('anh trai', 'em trai')
        if '奶奶' in original:
            translated = translated.replace('bà ngoại', 'bà nội')
        if '外公' in original:
            translated = translated.replace('ông nội', 'ông ngoại')
        if '外婆' in original:
            translated = translated.replace('bà nội', 'bà ngoại')
        if re.search(r'\bngươi\b', translated, re.I):
            translated = re.sub(r'\bNgươi\b', 'Bạn', translated)
            translated = re.sub(r'\bngươi\b', 'bạn', translated)
            translated = re.sub(r'\bta\b', 'tôi', translated)
        translated = re.sub(r'\bMày\b', 'Bạn', translated)
        translated = re.sub(r'\bmày\b', 'bạn', translated)
        translated = re.sub(r'\bHắn\b', 'Anh ấy', translated)
        translated = re.sub(r'\bhắn\b', 'anh ấy', translated)
        if translated != entry['exampleVi']:
            entry['exampleVi'] = translated
            overrides['entries'].setdefault(word_id, {})['exampleVi'] = translated
    OVERRIDES.write_text(json.dumps(overrides, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    CANDIDATES.write_text(json.dumps(candidates, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'Applied {len(FIXES)} Band A corrections')

if __name__ == '__main__':
    main()
