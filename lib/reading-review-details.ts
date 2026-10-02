import type { MockTest, ScriptVariant } from "./tests";
import type { ReadingReview, ReviewContent } from "./review-content";
import bandBPackage from "@/data/structured-tests/band-b-test-01.json";

type ReadingDetail = {
  options?: string[];
  passage?: string;
  question?: string;
  explanation?: string;
  evidence?: string;
  evidenceContext?: Partial<Record<ScriptVariant, string>>;
  note?: string;
};

const parseOptions = (source: string): Record<number, string[]> => Object.fromEntries(
  source.trim().split("\n").map((line) => {
    const [number, ...options] = line.split("|");
    return [Number(number), options.map((option) => option.trim())];
  }),
);

const bandAOptions = parseOptions(`
16|Chú chó nhỏ đang đuổi theo mèo con.|Bên trong ngôi nhà không có gì cả.|Vài chú chim nhỏ đậu trên nóc nhà.
17|Ở đây có cây và một ngôi nhà.|Có vài chiếc xe đỗ trước ngôi nhà.|Có vài người đứng cạnh ngôi nhà.
18|Cô ấy đang nghỉ ngơi.|Cô ấy đang ngủ trên giường.|Cô ấy đang làm bài tập.
19|Cô gái tóc ngắn đang uống rượu.|Cô gái tóc dài mặc váy.|Cô gái mặc váy đang cầm túi xách.
20|Quán ăn nhỏ đóng cửa trước chín giờ.|Quán ăn nhỏ bắt đầu nghỉ lúc mười hai giờ.|Sau mười hai giờ có thể đến quán ăn nhỏ dùng bữa.
21|Mỗi ngày uống ba viên.|Ba ngày uống một lần.|Ăn cơm trước rồi mới uống thuốc.
22|Mua vé sau buổi trưa đắt hơn.|Mua hai vé vào buổi sáng hết 500 tệ.|Muốn xem phim thì phải đợi sau buổi trưa.
23|Cửa lớp học đang đóng.|Hôm nay cô giáo này mặc váy.|Cô giáo này có mái tóc ngắn.
24|Họ đang ở trong giờ học.|Họ đi ra từ trường.|Cậu bé đi phía trước cô bé.
25|Nhà hàng này không bán đồ uống.|Trong nhà hàng không có ai.|Vị khách nữ này mua hai ly nước trái cây.
26|Tiểu Mỹ đến khách sạn sau ba giờ chiều.|Ở đây một đêm tốn hơn 200 tệ.|Tiểu Mỹ mang theo vài kiện hành lý lớn.
27|Cậu thanh niên đó đang bán bánh mì.|Cô gái đợi xe cầm một túi trái cây.|Có một cô gái đang đợi xe buýt số 76.
28|Cô Vương mua ba đôi giày.|Cửa hàng này chỉ bán giày và tất.|Cửa hàng này cũng bán quần và túi xách.
29|Lý Thiên Minh dạy tiếng Anh cho người Đài Bắc.|Lý Thiên Minh muốn tìm người nước ngoài để học tiếng Anh.|Lý Thiên Minh thấy học tiếng Trung rất rẻ.
30|Hai người đi cùng nhau sẽ được uống trà đen.|Một người có thể đi du lịch Hàn Quốc với chưa đến 20.000 tệ.|Ba người đi cùng nhau sẽ được giảm tổng cộng 1.000 tệ.
31|Mặc quần áo.|Mang theo.|Đeo, đội (phụ kiện).
32|Mang theo.|Dùng, sử dụng.|Tìm kiếm.
33|Bên cạnh.|Phía trước.|Phía sau.
34|Ở, đang.|Muốn, cần.|Là.
35|Có.|Với, cùng.|Cùng nhau.
36|Cuộc sống.|Sinh nhật.|Chủ nhật.
37|Giúp.|Để, cho phép.|Đối với.
38|Nhận.|Gửi.|Mượn, vay.
39|Náo nhiệt.|Thoải mái.|Vui vẻ.
40|Đến.|Đi.|Đến đây.
41|Còn nói với tôi.|Đầu hơi đau.|Rất dễ bị ốm.|Cảm thấy rất dễ chịu.|Càng khó chịu hơn.|Chú ý hơn đến sức khỏe của mình.
42|Còn nói với tôi.|Đầu hơi đau.|Rất dễ bị ốm.|Cảm thấy rất dễ chịu.|Càng khó chịu hơn.|Chú ý hơn đến sức khỏe của mình.
43|Còn nói với tôi.|Đầu hơi đau.|Rất dễ bị ốm.|Cảm thấy rất dễ chịu.|Càng khó chịu hơn.|Chú ý hơn đến sức khỏe của mình.
44|Còn nói với tôi.|Đầu hơi đau.|Rất dễ bị ốm.|Cảm thấy rất dễ chịu.|Càng khó chịu hơn.|Chú ý hơn đến sức khỏe của mình.
45|Còn nói với tôi.|Đầu hơi đau.|Rất dễ bị ốm.|Cảm thấy rất dễ chịu.|Càng khó chịu hơn.|Chú ý hơn đến sức khỏe của mình.
46|Sếp nên cho nhân viên nghỉ nhiều hơn một chút.|Người thường quan tâm đến người khác có trách nhiệm hơn.|Nếu có ý kiến về công ty thì nên mạnh dạn nói ra.|Chăm sóc sức khỏe quan trọng hơn làm việc chăm chỉ.
47|Cần hình thành thói quen vận động.|Muốn ăn gì thì ăn nấy.|Bình thường nên làm nhiều việc tốt.|Sau bữa sáng không nên uống nước.
48|Chăm sóc bản thân trước thì mới giúp được người khác.|Muốn thay đổi hoàn cảnh thì trước tiên hãy thay đổi tâm trạng.|Người trẻ nên học cách kính trọng người già.|Người thông minh biết khi nào trời mưa.
49|Tiền quan trọng hơn mọi thứ.|Tiền có thể giải quyết mọi vấn đề.|Ai cũng có quan điểm riêng về tiền.|Tiền chỉ có giá trị khi để trong ngân hàng.
50|Nên tránh ăn món có mùi đặc biệt.|Cho rằng ăn gì là quyền tự do của mỗi người.|Cho rằng yêu cầu của rạp chiếu phim không có lý do gì.|Người xem phim đều có trách nhiệm dọn rác.
`);

const bandBOptions = parseOptions(`
1|Đưa, đem (tân ngữ lên trước).|Có thể (về khả năng).|Bị, được (câu bị động).|Biết, sẽ.
2|Giúp.|Làm hại.|Đi cùng, ở bên.|Mời.
3|Trở thành, làm.|Trở nên, thành.|Giả vờ.|Làm, xử lý.
4|Dạy.|Cho, vì.|Để, khiến.|Nuôi dưỡng.
5|Cảm thấy.|Yêu cầu.|Quyết định.|Hy vọng.
6|Thời đại.|Thời gian.|Khối lớp.|Tuổi tác.
7|Bao lâu.|Mấy, nhiều (đứng trước đơn vị đếm).|Rất dài.|Rất lâu.
8|Bỗng nhiên.|Luôn luôn.|Bất cứ lúc nào.|Từ trước đến nay.
9|Với, cùng.|Nối, đón.|Viết.|Theo, dựa theo.
10|Có thể.|Chỉ có.|Có lẽ.|Nếu như.
11|Bất kể… đều…|Không những… mà còn…|Mặc dù… nhưng…|Do… nên…
12|Ngăn chặn.|Rút ngắn.|Giảm bớt.|Thiếu.
13|Căn cứ vào.|Trải qua.|Theo, dựa theo.|Còn về.
14|Đạt được, giành được.|Chịu, nhận (tác động).|Tiếp nhận.|Nhận được (đồ vật).
15|Nếu không thì.|Ngoài ra.|Để khỏi, tránh cho.|Cho dù.
16|Tiểu Minh đã đến Hàn Quốc hai lần.|Tiểu Minh muốn học nấu món Hàn.|Tiểu Minh thấy Hàn Quốc không thú vị lắm.|Tiểu Minh ở Hàn Quốc bốn đêm.
17|Vừa sợ vừa không nỡ.|Không biết phải làm gì.|Thấy con thật đáng thương.|Động viên con tự đối diện và giải quyết.
18|Một chủ khách sạn trở thành người thất nghiệp.|Một người chỉ học hết tiểu học trở thành chủ khách sạn.|Một người thất nghiệp trở thành nhân viên khách sạn.|Một người vốn giàu có, sau chỉ còn 100 tệ.
19|Tiểu Anh chưa đọc tiểu thuyết “Chủ khách sạn”.|“Chủ khách sạn” là bộ phim Tiểu Anh xem ở thư viện.|Tiểu Anh thấy phim “Chủ khách sạn” được làm khá hay.|Tiểu Anh thấy nội dung tiểu thuyết và phim không khác nhau mấy.
20|Mùa bão luôn rơi vào tháng Tám.|Ảnh hưởng của bão lớn đối với đời sống.|Những thứ cần chuẩn bị khi có bão.|Những gì sẽ xảy ra khi có bão nhỏ.
21|Cơn bão tháng Tám năm nay gây mưa lớn.|Khi bão lớn đến, tàu hỏa ngừng chạy.|Cơn bão lớn này làm nhiều ngôi nhà bị đổ.|Dù có bão lớn, mọi người vẫn phải đi làm.
22|Quảng cáo nói toàn sự thật.|Chi phí làm quảng cáo rất cao.|Quảng cáo có thể tạo ra hình ảnh đẹp.|Sản phẩm nào cũng cần quảng cáo.
23|Thông tin sản phẩm quan trọng hơn hình ảnh.|Nội dung quảng cáo không phân biệt độ tuổi.|Quảng cáo được thiết kế cho từng nhóm đối tượng.|Quảng cáo cho biết toàn bộ kết quả sau khi dùng sản phẩm.
24|Cả bốn tin đều bán máy tính.|Máy tính của Tiểu Trần đã dùng một năm.|Máy tính của cô Lý giá 9.500 tệ.|Có thể gọi Tiểu Trần lúc chín giờ sáng.
25|Tiểu Trần.|Cô Lý.|Anh Vương.|Anh Lâm.
26|Cô ấy quyết định đi du học.|Cô ấy đã ở Mỹ hai năm.|Bạn trai cô ấy tìm được việc mới.|Tối thứ Sáu tuần sau trường cô ấy có hoạt động.
27|Tiểu Mỹ vốn định đi du học.|Minh Chân mong Tiểu Mỹ dự buổi tối ở trường.|Minh Chân đã nhận thư Tiểu Mỹ gửi trước.|Tiểu Mỹ muốn biết công việc của Đại Trung có tốt không.
28|Tâm Mỹ có cuộc họp vào thứ Năm.|Tâm Mỹ sẽ xem phim cuối tuần.|Tâm Mỹ học toán vào thứ Ba.|Tâm Mỹ định tặng quà cho Tiểu Anh.
29|Chủ nhật và thứ Hai.|Thứ Hai và thứ Ba.|Thứ Năm và thứ Sáu.|Thứ Sáu và thứ Hai.
30|Lấy hóa đơn rồi mới trả tiền.|Đổ xăng xong mới lấy lại thẻ tín dụng.|Khi máy có vấn đề thì bấm “F1”.|Đặt vòi vào bình xăng rồi bấm “Bắt đầu”.
31|Ngồi trong xe để người khác phục vụ.|Nhờ nhân viên giải quyết vấn đề.|Cho học sinh 15 tuổi sử dụng.|Vừa gọi điện vừa đổ xăng.
32|Được sản xuất tại thành phố Đài Bắc.|Mở ra rồi không cần để tủ lạnh.|Không được để nơi có ánh nắng trực tiếp.|Đến ngày 1/1/2010 thì hết hạn.
33|Viết thư cho công ty.|Gọi điện cho công ty.|Gửi sản phẩm về công ty.|Yêu cầu công ty đến lấy sản phẩm.
34|David muốn một phòng trống.|Khách sạn này chỉ còn hai phòng trống.|Khách sạn chưa biết quyết định của David.|Hai phòng trống giá 3.200 tệ một đêm.
35|8 giờ sáng ngày 21/12.|10 giờ tối ngày 21/12.|7 giờ sáng ngày 22/12.|9 giờ tối ngày 22/12.
36|Tiểu thuyết dài.|Bài giới thiệu người nổi tiếng địa phương.|Kịch bản phim lịch sử.|Truyện cười tự nghĩ ra.
37|Có thể tự bịa câu chuyện.|Truyện càng dài thì nhuận bút càng cao.|Nếu được đăng, bản quyền thuộc về tòa soạn.|Nếu không được đăng, tác giả sẽ nhận lại bản thảo.
38|Ai có thể dùng thẻ tín dụng.|Cách mua hàng bằng thẻ tín dụng.|Cách trả nợ sau khi dùng thẻ.|Những vấn đề phát sinh khi dùng thẻ tín dụng.
39|Cô ấy muốn mua thêm đồ.|Cô ấy cần mua món rất đắt.|Cô ấy phải trả tiền cho ngân hàng.|Cô ấy muốn gửi thêm tiền vào ngân hàng.
40|Một số người có quá nhiều thẻ tín dụng.|Ngân hàng không giải thích rõ cách trả nợ.|Một số người không để ý đã tiêu bao nhiêu.|Một số người mua quá nhiều dù không đủ tiền.
41|Khách sạn không còn phòng trống.|Họ thấy đổi phòng phiền phức.|Họ muốn biết ma trông thế nào.|Phòng ban đầu rất thoải mái.
42|Con ma đến nói chuyện với ông ấy.|Ông ấy nghĩ con ma đã xuất hiện.|Nhân viên phục vụ đến tìm họ.|Ông ấy muốn nói chuyện với vợ.
43|Con ma muốn nói tiếng Anh với bà Collins.|Ông Collins cảm nhận được ma xuất hiện.|Vợ chồng Collins ở trong phòng có ma.|Nhân viên báo với họ rằng phòng có ma.
44|Các cách phân loại giấc mơ.|Mơ cho thấy ngủ không ngon.|Bộ phận não ảnh hưởng đến giấc mơ.|Giấc mơ giúp con người hiểu bản thân.
45|Người đó không có cuộc hẹn nào.|Người đó đã lỡ một cuộc hẹn.|Người đó không muốn dự cuộc hẹn.|Người đó quên ghi nhớ một cuộc hẹn sắp đến.
46|Cô ấy giận chồng.|Chồng cô ấy đã chết.|Cô ấy muốn ly hôn.|Cô ấy và chồng sống rất hạnh phúc.
47|Cách xóa bỏ phiền muộn.|Con người có những phiền muộn gì.|Ảnh hưởng của phiền muộn đến sức khỏe.|Nguyên nhân dễ nảy sinh phiền muộn.
48|Giao du với bạn xấu.|Quá coi trọng mọi chuyện.|Bị ảnh hưởng từ môi trường thời thơ ấu.|Áp lực cạnh tranh xã hội quá lớn.
49|Đi uống rượu với bạn.|Gạt bỏ suy nghĩ nản lòng.|Tham gia hoạt động ngoài trời.|Duy trì nếp sinh hoạt đều đặn.
50|Giúp người khác cũng là giúp mình.|Luôn chuẩn bị phòng tránh thiên tai.|Không ai biết trước điều gì sẽ xảy ra.|Dù có chuyện gì cũng có cách vượt qua.
`);

// These choices are transcribed only for review from the supplied Novice question images.
// The exam still uses its original assets and answer controls.
const noviceOptions: Record<ScriptVariant, Record<number, string[]>> = {
  traditional: {
    16: ["這個東西六百零五元。", "這個東西六百五十元。", "這個東西八百五十元。"],
    17: ["他在洗東西。", "他在找東西。", "他在買東西。"],
    18: ["她覺得考試很難。", "她覺得考試很有趣。", "她覺得考試很容易。"],
    19: ["這裡不可以看書。", "這裡不可以說話。", "這裡不可以喝東西。"],
    20: ["爸爸沒穿鞋子。", "媽媽沒穿鞋子。", "弟弟沒穿鞋子。"],
    21: ["這個人下午吃飯。", "這個人早上打電話。", "這個人中午在學習。"],
    22: ["學生給老師一張票。", "老師在聽學生唱歌。", "學生在問老師問題。"],
    23: ["醫院在餐廳和圖書館的中間。", "圖書館在餐廳和醫院的中間。", "餐廳在圖書館和醫院的中間。"],
    24: ["他們都一樣大。", "他們都是學生。", "他們都會英文。"],
    25: ["酒比茶便宜。", "咖啡比酒便宜。", "茶比咖啡便宜。"],
  },
  simplified: {
    16: ["这个东西六百零五元。", "这个东西六百五十元。", "这个东西八百五十元。"],
    17: ["他在洗东西。", "他在找东西。", "他在买东西。"],
    18: ["她觉得考试很难。", "她觉得考试很有趣。", "她觉得考试很容易。"],
    19: ["这里不可以看书。", "这里不可以说话。", "这里不可以喝东西。"],
    20: ["爸爸没穿鞋子。", "妈妈没穿鞋子。", "弟弟没穿鞋子。"],
    21: ["这个人下午吃饭。", "这个人早上打电话。", "这个人中午在学习。"],
    22: ["学生给老师一张票。", "老师在听学生唱歌。", "学生在问老师问题。"],
    23: ["医院在餐厅和图书馆的中间。", "图书馆在餐厅和医院的中间。", "餐厅在图书馆和医院的中间。"],
    24: ["他们都一样大。", "他们都是学生。", "他们都会英文。"],
    25: ["酒比茶便宜。", "咖啡比酒便宜。", "茶比咖啡便宜。"],
  },
};
const noviceOptionTranslations = parseOptions(`
16|Món đồ này giá 605 tệ.|Món đồ này giá 650 tệ.|Món đồ này giá 850 tệ.
17|Anh ấy đang rửa đồ.|Anh ấy đang tìm đồ.|Anh ấy đang mua đồ.
18|Cô ấy thấy bài thi rất khó.|Cô ấy thấy bài thi rất thú vị.|Cô ấy thấy bài thi rất dễ.
19|Ở đây không được đọc sách.|Ở đây không được nói chuyện.|Ở đây không được uống gì.
20|Bố không đi giày.|Mẹ không đi giày.|Em trai không đi giày.
21|Người này ăn cơm vào buổi chiều.|Người này gọi điện thoại vào buổi sáng.|Người này học vào buổi trưa.
22|Học sinh đưa giáo viên một tấm vé.|Giáo viên đang nghe học sinh hát.|Học sinh đang hỏi giáo viên một câu hỏi.
23|Bệnh viện nằm giữa nhà hàng và thư viện.|Thư viện nằm giữa nhà hàng và bệnh viện.|Nhà hàng nằm giữa thư viện và bệnh viện.
24|Họ bằng tuổi nhau.|Họ đều là học sinh.|Họ đều biết tiếng Anh.
25|Rượu rẻ hơn trà.|Cà phê rẻ hơn rượu.|Trà rẻ hơn cà phê.
`);

const bandBPassages: Record<number, string> = {
  16: "Tuần trước, lần đầu Tiểu Minh đến Hàn Quốc du lịch. Cậu ấy chơi ở đó năm ngày bốn đêm. Có một ngày cậu lên ngọn núi cao nhất Hàn Quốc; khi ấy trên núi có tuyết rơi, phong cảnh rất đẹp. Phần lớn thời gian, cậu đi tàu điện tới các thành phố lớn để tham quan và thử nhiều món Hàn có hương vị đặc biệt. Cậu thấy Hàn Quốc rất thú vị, dự định học tiếng Hàn và muốn sang đó học nếu có cơ hội.",
  17: "Con à, hôm nay là ngày đầu tiên con đổi sang đi xe đưa đón của trường về nhà. Mẹ vẫn nhớ sáng nay con liên tục nói rằng đi xe ấy rất đáng sợ. Giọng con đầy bất an trước điều chưa biết, khiến mẹ cũng không đành lòng. Nhưng mẹ chỉ mỉm cười lắng nghe con kể hết những điều đáng sợ con lo sẽ xảy ra, rồi kiên định nói: ‘Đây là một khởi đầu khác trong đời con. Con phải học cách tự đối diện với cuộc sống của mình!’",
  18: "Chiều nay Tiểu Anh xem bộ phim ‘Chủ khách sạn’ ở thư viện. Phim kể về một người thành công như thế nào: ban đầu người đó chỉ học hết tiểu học, không có việc làm và chỉ còn 100 tệ, sau này trở thành chủ một khách sạn kinh doanh rất tốt và giàu có. Câu chuyện vốn là một tiểu thuyết hay nên được chuyển thể thành phim. Tiểu Anh thấy phim làm rất tốt; nghe nói tiểu thuyết cũng hay nên muốn đọc để xem nội dung có giống phim không.",
  20: "Ở đất nước tôi năm nào cũng có bão, có cơn lớn và cơn nhỏ. Bão lớn ảnh hưởng nghiêm trọng đến cuộc sống. Tháng Tám năm nay, một cơn bão lớn mang theo mưa to gió mạnh khiến tàu hỏa và máy bay ngừng hoạt động, mọi người nghỉ làm, nghỉ học và hầu hết chỉ ở nhà xem tin bão. Sau bão, nhiều nhà bị ngập; cây cối, nhà cửa đổ và cả cầu cũng bị nước cuốn hỏng. Nghe nói cuối tuần này lại có bão, tôi mong đó chỉ là bão nhỏ.",
  22: "Phần lớn quảng cáo sản phẩm không nói toàn bộ sự thật mà tạo ra một hình ảnh hấp dẫn, như gia đình hạnh phúc, tình yêu lãng mạn hay vóc dáng đẹp. Quảng cáo được thiết kế khác nhau cho từng độ tuổi và đối tượng: quảng cáo máy tính gắn với người thành công, giày chạy bộ gắn với vận động viên khỏe mạnh. ‘Hình ảnh’ thường được coi trọng hơn thông tin sản phẩm. Chẳng hạn, quảng cáo bia chỉ cho thấy cảnh vui vẻ, không cho thấy tai nạn do lái xe khi say. Thông điệp họ muốn truyền tải là: thử sản phẩm để có hình ảnh bạn mong muốn.",
  24: "Các tin rao gồm: Tiểu Trần bán máy tính xách tay QBM Z22 đã dùng một năm, còn tốt, giá 34.000 tệ và chỉ nhận điện thoại sau 7 giờ tối; anh Vương bán máy tính AKER mới hoàn toàn, đủ phụ kiện; cô Lý bán bàn máy tính cũ mua tháng Bảy năm ngoái với giá gốc 950 tệ; anh Lâm muốn mua máy tính càng mới và càng nhỏ càng tốt.",
  26: "Minh Chân viết thư cho Tiểu Mỹ: Cô ấy đã nhận thư của Tiểu Mỹ hai ngày trước nhưng bận nên quên hồi âm. Minh Chân chúc mừng Tiểu Mỹ đỗ cao học; trước đây Tiểu Mỹ định sang Mỹ học, nhưng nay quyết định học trong nước. Minh Chân đã ở Mỹ gần hai năm, thích cuộc sống ở trường và mong Tiểu Mỹ dự buổi tối ở trường vào thứ Sáu tuần sau. Cô cũng hỏi công việc mới của bạn trai Tiểu Mỹ là Đại Trung thế nào, rồi nhờ gửi lời hỏi thăm.",
  28: "Sổ tay tháng Năm của Tâm Mỹ ghi: thứ Hai ngày 12 và thứ Sáu ngày 16 làm tại quán cà phê từ 6 đến 10 giờ tối; thứ Ba ngày 13 học tiếng Anh; thứ Tư ngày 14 thi toán; thứ Năm ngày 15 họp hội sinh viên; thứ Bảy ngày 17 đi xem phim; Chủ nhật ngày 18 là sinh nhật Tiểu Anh và cần nhớ tặng quà.",
  30: "Hướng dẫn dùng máy bơm xăng tự phục vụ: bấm F1 để dùng thẻ tín dụng, đưa thẻ vào khe rồi rút ra, đặt vòi vào bình xăng và bấm ‘Bắt đầu’ khi nghe hướng dẫn. Đổ xong thì treo vòi lại và lấy hóa đơn trước khi đi. Trước khi dùng phải tắt điện thoại; khi đổ xăng không được rời xe, không cho người dưới 18 tuổi sử dụng. Nếu có vấn đề, hãy báo nhân viên trạm xăng.",
  32: "Nhãn khô heo ghi nguyên liệu chính là thịt heo, cùng nước tương, đường, muối, gia vị và chất bảo quản. Khối lượng tịnh 300 g. Bảo quản nơi mát; sau khi mở phải ăn sớm và giữ trong tủ lạnh. Sản xuất ngày 1/1/2010, hạn dùng 180 ngày, tại nhà máy Đào Viên của Công ty Thực phẩm Khai Nguyên. Nếu sản phẩm có vấn đề, hãy gửi về trụ sở công ty ở Đài Bắc để được xử lý.",
  34: "Khách sạn Lai Lai trả lời David lúc 7 giờ 10 tối ngày 21/12: hiện chỉ còn một phòng lớn đủ cho bốn người, giá 3.200 tệ một đêm. Nếu đồng ý, David cần gọi lại vào ngày hôm sau trong giờ 8 giờ sáng đến 10 giờ tối. Trước đó David đã hỏi còn hai phòng trống cho bốn người ở một đêm 31/12 tại Đài Bắc hay không và giá bao nhiêu.",
  36: "Tòa soạn mời độc giả gửi câu chuyện có thật, chưa công bố, dài khoảng 300 chữ, kể trải nghiệm thú vị, ấm áp, truyền cảm hứng hoặc liên quan phong tục địa phương. Bài gửi kèm tên thật, địa chỉ và số liên hệ. Nếu được đăng, mỗi bài nhận 3.000 tệ nhuận bút và bản quyền thuộc tòa soạn. Bản thảo không được chọn sẽ không được trả lại.",
  38: "Thẻ tín dụng tiện lợi nhưng có thể khiến người ta tiêu rất nhiều tiền mà không để ý, nên số người không trả nổi nợ ngày càng tăng. Kỳ Mỹ mua quá nhiều đồ bằng thẻ, không trả nổi và phải làm ba việc để trả ngân hàng. Một nguyên nhân là có người ít tiền vẫn mua sắm nhiều, lại không biết mình đã tiêu bao nhiêu. Ngân hàng cũng nới điều kiện mở thẻ cho cả sinh viên chưa đi làm và không giải thích rõ cách trả nợ, khiến chiếc thẻ tiện lợi trở thành rắc rối.",
  41: "Vợ chồng Collins là người Mỹ, đi du lịch Trung Quốc và ở một khách sạn cũ. Nhân viên báo phòng của họ có một con ma Trung Quốc thích nói tiếng Anh. Hai người sợ nhưng khách sạn hết phòng và cũng quá muộn để đổi khách sạn, nên vẫn ở đó. Nửa đêm, ông Collins nghe tiếng lạ, đánh thức vợ và bảo bà nói tiếng Trung tốt hơn nên hãy nhờ con ma đi. Bà đi xem rồi quay lại nói con ma không thích nói tiếng Trung với bà mà muốn luyện tiếng Anh với ông.",
  44: "Nhiều chuyên gia tin rằng hiểu giấc mơ giúp ta hiểu chính mình. Giấc mơ có thể nhắc lại những điều ban ngày ta bỏ lỡ: mơ đến muộn một cuộc hẹn quan trọng có thể là lời nhắc về cuộc hẹn sắp tới mà ta quên ghi; mơ rụng răng có thể phản ánh cảm giác tuổi tác tăng lên. Ở tầng sâu hơn, giấc mơ cho thấy cách ta thật sự nhìn nhận các mối quan hệ. Một phụ nữ tưởng hôn nhân hạnh phúc nhưng mơ giết chồng; điều đó cho thấy cô cần nói với chồng về sự bất mãn và giận dữ vì ông ấy buộc cô ở nhà, không cho đi làm.",
  47: "Một bài hát nói về cảm giác phiền muộn đến nghẹt thở và kiệt sức. Ai cũng có phiền muộn, phần lớn vì ta xem mọi việc quá nghiêm trọng. Nếu giữ tâm thế bình thản và chấp nhận cả mặt tốt lẫn xấu, ta sẽ thấy phiền muộn không đáng sợ. Để giảm phiền muộn, trước tiên hãy gạt bỏ suy nghĩ tiêu cực như bất an, than phiền, hối tiếc và nản lòng. Tiếp đó, tích cực tham gia hoạt động ngoài trời, trò chuyện và nghe ý kiến bạn bè. Cuối cùng, duy trì nếp sinh hoạt đều đặn và vận động để có sức khỏe, sức sống. Dù có chuyện gì xảy ra, vẫn có cách vượt qua; sống vui vẻ quan trọng hơn.",
};
const bandADetails: Record<number, ReadingDetail> = {
  31: { question: "Cô bé đeo kính đang đọc sách.", explanation: "Kính là vật đeo trên người nên dùng 戴, không dùng 穿 (mặc quần áo) hay 帶 (mang theo).", evidence: "眼鏡", evidenceContext: { traditional: "＿＿＿著眼鏡的小女孩在看書。", simplified: "＿＿＿着眼镜的小女孩在看书。" } },
  32: { question: "Cô ấy vừa đọc sách vừa dùng đũa ăn mì.", explanation: "Dùng dụng cụ để làm việc gì đó diễn đạt bằng 用; ở đây là dùng đũa ăn mì.", evidence: "筷子吃麵", evidenceContext: { traditional: "她一邊看書，一邊＿＿＿筷子吃麵。", simplified: "她一边看书，一边＿＿＿筷子吃面。" } },
  33: { question: "Bên cạnh cô bé có một chú chó.", explanation: "Chú chó ở ngay cạnh cô bé, nên điền 旁邊 (bên cạnh)." },
  34: { question: "Chú chó ấy đang ngủ.", explanation: "在 đứng trước động từ để chỉ hành động đang diễn ra: 在睡覺." },
  35: { question: "Cô bé và chú chó là bạn tốt.", explanation: "跟 nối hai đối tượng có quan hệ với nhau: cô bé và chú chó.", evidence: "小狗是好朋友", evidenceContext: { traditional: "小女孩＿＿＿小狗是好朋友。", simplified: "小女孩＿＿＿小狗是好朋友。" } },
  36: { question: "Ngày 5 tháng 9 là sinh nhật của cô bé.", explanation: "Bánh kem và quà cho thấy đây là 生日 (sinh nhật), không phải 星期日 (Chủ nhật)." },
  37: { question: "Mọi người đều giúp cô bé tổ chức mừng sinh nhật.", explanation: "幫 + người + hành động diễn đạt việc giúp ai làm việc gì.", evidence: "她慶祝", evidenceContext: { traditional: "大家都＿＿＿她慶祝。", simplified: "大家都＿＿＿她庆祝。" } },
  38: { question: "Cô bé nhận được rất nhiều quà.", explanation: "收到 là nhận được; với 禮物 (quà), động từ phù hợp là 收.", evidence: "到很多禮物", evidenceContext: { traditional: "她＿＿＿到很多禮物。", simplified: "她＿＿＿到很多礼物。" } },
  39: { question: "Vì vậy hôm nay cô bé rất vui.", explanation: "Nhận nhiều quà sinh nhật nên cô bé 高興 (vui vẻ); 熱鬧 tả không khí, 舒服 tả cảm giác dễ chịu." },
  40: { question: "Cô bé mong năm sau có thể đến Đức chơi.", explanation: "到 + địa điểm + 去 chơi diễn đạt việc đi đến một nơi: 到德國去玩.", evidence: "德國去玩", evidenceContext: { traditional: "她希望明年能＿＿＿德國去玩。", simplified: "她希望明年能＿＿＿德国去玩。" } },
  41: { question: "Tối qua tôi thấy không khỏe, hơi đau đầu nên đi ngủ rất sớm.", explanation: "Cảm giác không khỏe được làm rõ bằng triệu chứng 頭有點兒痛 (hơi đau đầu).", evidence: "覺得很不舒服", evidenceContext: { traditional: "昨天晚上我覺得很不舒服，頭有點兒痛，所以很早就睡覺了。", simplified: "昨天晚上我觉得很不舒服，头有点儿痛，所以很早就睡觉了。" }, note: "Bản dịch đầy đủ của đoạn văn sẽ hiển thị ở câu 45." },
  42: { question: "Sáng nay thức dậy, tôi thấy càng khó chịu hơn.", explanation: "So với tối qua, trạng thái xấu đi nên dùng 更不舒服了 (càng khó chịu hơn).", evidence: "今天早上起來", evidenceContext: { traditional: "今天早上起來，更不舒服了。", simplified: "今天早上起来，更不舒服了。" }, note: "Bản dịch đầy đủ của đoạn văn sẽ hiển thị ở câu 45." },
  43: { question: "Bác sĩ cho tôi thuốc, còn dặn phải nghỉ ngơi và uống nhiều nước.", explanation: "還告訴我 nối lời dặn của bác sĩ với việc bác sĩ đã cho thuốc.", evidence: "醫生說我感冒了，給了我一些藥", evidenceContext: { traditional: "醫生說我感冒了，給了我一些藥，還告訴我要多休息，多喝水，才會快點好。", simplified: "医生说我感冒了，给了我一些药，还告诉我要多休息，多喝水，才会快点好。" }, note: "Bản dịch đầy đủ của đoạn văn sẽ hiển thị ở câu 45." },
  44: { question: "Mấy hôm nay thời tiết khi nóng khi lạnh, rất dễ bị ốm.", explanation: "Thời tiết thay đổi liên tục là nguyên nhân dẫn đến 很容易生病 (rất dễ bị ốm).", evidence: "一會兒熱，一會兒冷", evidenceContext: { traditional: "這幾天的天氣一會兒熱，一會兒冷，很容易生病。", simplified: "这几天的天气一会儿热，一会儿冷，很容易生病。" }, note: "Bản dịch đầy đủ của đoạn văn sẽ hiển thị ở câu 45." },
  45: { passage: "Tối qua tôi thấy rất khó chịu, đầu hơi đau nên đi ngủ sớm. Sáng nay thức dậy, tôi thấy còn khó chịu hơn. Tôi đến khám bác sĩ; bác sĩ nói tôi bị cảm, cho thuốc và dặn tôi nghỉ ngơi nhiều, uống nhiều nước để mau khỏe. Mấy hôm nay thời tiết lúc nóng lúc lạnh nên rất dễ bị ốm. Tôi phải chú ý hơn đến sức khỏe của mình để không bị cảm nữa.", question: "Tôi phải chú ý hơn đến sức khỏe của mình để không bị cảm nữa.", explanation: "Đoạn kết nói về việc phòng cảm trở lại; 多注意自己的身體 diễn đạt việc chú ý chăm sóc sức khỏe.", evidence: "不要再感冒了", evidenceContext: { traditional: "我要多注意自己的身體，不要再感冒了。", simplified: "我要多注意自己的身体，不要再感冒了。" } },
  46: { question: "Bài viết nói về nội dung gì?", explanation: "Tác giả nhấn mạnh công ty nên chăm sóc nhân viên, không để họ đánh đổi sức khỏe để làm việc.", evidence: "而不是讓他們拿健康去換錢", evidenceContext: { traditional: "一個好的公司應該能照顧員工，而不是讓他們拿健康去換錢。", simplified: "一个好的公司应该能照顾员工，而不是让他们拿健康去换钱。" } },
  47: { question: "Để cải thiện sức khỏe, tác giả đưa ra lời khuyên nào?", explanation: "Bài nêu lười vận động là một nguyên nhân gây mệt mỏi, nên cần hình thành thói quen vận động.", evidence: "不愛運動", evidenceContext: { traditional: "這份報告提到了下面幾種可能：不愛運動、水喝得不夠多。", simplified: "这份报告提到了下面几种可能：不爱运动、水喝得不够多。" } },
  48: { question: "Câu chuyện muốn nói điều gì?", explanation: "Ông lão nói khi tâm mình yên tĩnh thì bên ngoài cũng yên tĩnh; ý chính là thay đổi tâm trạng trước.", evidence: "只要自己的心安靜了，外面就安靜了", evidenceContext: { traditional: "只要自己的心安靜了，外面就安靜了，所以下雨了。", simplified: "只要自己的心安静了，外面就安静了，所以下雨了。" } },
  49: { question: "Đoạn văn nói về điều gì?", explanation: "Mở đầu bài khẳng định mỗi người có cách nghĩ và coi trọng tiền bạc khác nhau.", evidence: "每個人對它的想法、使用方式和重視程度都不一樣", evidenceContext: { traditional: "說到錢，每個人對它的想法、使用方式和重視程度都不一樣。", simplified: "说到钱，每个人对它的想法、使用方式和重视程度都不一样。" } },
  50: { question: "Tác giả nghĩ sao về việc ăn uống trong rạp chiếu phim?", explanation: "Tác giả lo thức ăn có mùi lạ sẽ ảnh hưởng đến người xem khác, nên nên tránh mang những món như vậy vào rạp.", evidence: "有奇怪味道的食物進電影院，也很容易影響其他看電影的人", evidenceContext: { traditional: "如果有人帶了一些有奇怪味道的食物進電影院，也很容易影響其他看電影的人。", simplified: "如果有人带了一些有奇怪味道的食物进电影院，也很容易影响其他看电影的人。" } },
};

const bandAPassageTemplate: Record<ScriptVariant, string> = {
  traditional: "昨天晚上我覺得很不舒服，【41】，所以很早就睡覺了。今天早上起來，【42】。我去看病，醫生說我感冒了，給了我一些藥，【43】要多休息，多喝水，才會快點好。這幾天的天氣一會兒熱，一會兒冷，【44】。我要【45】，不要再感冒了。",
  simplified: "昨天晚上我觉得很不舒服，【41】，所以很早就睡觉了。今天早上起来，【42】。我去看病，医生说我感冒了，给了我一些药，【43】要多休息，多喝水，才会快点好。这几天的天气一会儿热，一会儿冷，【44】。我要【45】，不要再感冒了。",
};

function completedBandAPassage(test: MockTest): string | undefined {
  let passage = bandAPassageTemplate[test.script ?? "traditional"];
  for (let number = 41; number <= 45; number++) {
    const question = test.questions.find((item) => item.section === "reading" && item.number === number);
    const answer = question?.choices[question.correctAnswer];
    if (!answer) return undefined;
    passage = passage.replace(`【${number}】`, answer);
  }
  return passage;
}
function parseDetails(source: string): Record<number, ReadingDetail> {
  return Object.fromEntries(source.trim().split("\n").map((line) => {
    const [number, question, explanation, evidence] = line.split("|");
    return [Number(number), { question, explanation: explanation || undefined, evidence: evidence?.trim() || undefined }];
  }));
}

const bandBDetails = parseDetails(`
1|Cô Trương được đưa vào bệnh viện.|被 dùng trong câu bị động: cô ấy được đưa vào bệnh viện; 把 cần có người thực hiện hành động ở trước.|送進了醫院
2|Ông Trương cũng đi cùng bà Trương đến bệnh viện.|陪 diễn đạt việc đi cùng, ở bên ai; các lựa chọn còn lại không hợp với tình huống.|張太太到醫院去
3|Ông ấy sắp trở thành bố.|當爸爸 là cách nói tự nhiên cho việc trở thành bố.|他就要
4|Hai vợ chồng đặt tên cho đứa bé.|為 + người + làm việc gì mang nghĩa “làm cho/giúp ai”; ở đây là nghĩ tên cho con.|這個孩子想了一個名字
5|Họ mong con sau này xinh đẹp và vui vẻ.|希望 nối với điều mong ước về tương lai; các từ “cảm thấy”, “yêu cầu”, “quyết định” không phù hợp.|她將來
6|Tiểu Trần và Tiểu Lý là bạn từ thời đại học.|大學時代 chỉ thời kỳ còn học đại học; 年紀 và 年級 không chỉ một giai đoạn sống.|大學
7|Sau khi tốt nghiệp, họ đã nhiều năm không gặp nhau.|好幾 đứng trước 年 để chỉ “mấy năm”; các từ chỉ thời lượng khác không kết hợp theo cấu trúc này.|年沒見面了
8|Một lần, Tiểu Trần bỗng nhớ lại thời đi học với Tiểu Lý.|忽然 diễn đạt một ý nghĩ chợt xuất hiện; 總是 và 從來 nói về thói quen hay quá khứ.|想起和小李一起讀書的事
9|Anh ấy lần theo địa chỉ trên lá thư để tìm Tiểu Lý.|照著 + địa chỉ nghĩa là làm theo địa chỉ ghi trong thư.|信上的地址去找小李
10|Anh ấy nghĩ có lẽ sau này sẽ không gặp lại Tiểu Lý.|可能 diễn đạt sự phỏng đoán, không khẳng định chắc chắn.|以後都見不到小李了
11|Bất kể người già hay trẻ em đều có thể xem khiêu vũ là hoạt động thường xuyên.|不論…都… kết hợp với cặp “người già hay trẻ em” để nói mọi đối tượng.|老人還是小孩
12|Cô Vương dùng khiêu vũ để giảm áp lực công việc.|減輕搭配 壓力, nghĩa là giảm bớt áp lực.|自己的壓力
13|Sau ba năm tập khiêu vũ, sức khỏe cô tốt hơn.|經過 + khoảng thời gian chỉ quá trình trải qua ba năm luyện tập.|三年的跳舞運動
14|Cô tham gia cuộc thi khiêu vũ và giành chức vô địch.|得到冠軍 là giành được danh hiệu; 收到 thường dùng khi nhận đồ vật.|舞蹈比賽
15|Dù bận công việc, cô vẫn đến lớp khiêu vũ.|就算…還是… diễn đạt nhượng bộ: dù bận đến đâu vẫn đi tập.|工作再怎麼忙
16|Ý nào sau đây đúng?|Tiểu Minh ở Hàn Quốc năm ngày bốn đêm, nên lựa chọn D khớp trực tiếp với bài.|玩了五天四夜
17|Khi con bất an, người mẹ có thái độ thế nào?|Người mẹ lắng nghe rồi động viên con tự đối diện với cuộc sống.|你要學著去面對你自己的人生
18|“Chủ khách sạn” kể câu chuyện gì?|Nhân vật từ chỗ chỉ học hết tiểu học, không có việc làm trở thành chủ khách sạn.|只有小學畢業、沒有工作、身上只剩一百塊錢的人，後來卻變成一家旅館的老闆
19|Ý nào sau đây sai?|Tiểu Anh chưa đọc tiểu thuyết, nên cô chưa thể biết phim và sách giống nhau hay không.|之後想看看小說和電影的故事內容是不是一樣的
20|Đoạn văn chủ yếu nói về điều gì?|Bài tập trung mô tả bão lớn làm gián đoạn đời sống và gây thiệt hại.|對我們的生活就有嚴重的影響
21|Ý nào sau đây sai?|Bài nói mọi người nghỉ làm, nghỉ học khi bão lớn đến; lựa chọn D nói ngược lại.|所有人不上班、不上課
22|Bài viết chủ yếu nói về điều gì?|Tác giả nhấn mạnh quảng cáo tạo ra một hình ảnh hấp dẫn cho sản phẩm.|想要為你創造出一個形象
23|Theo bài viết, ý nào đúng?|Quảng cáo được thiết kế theo từng nhóm tuổi và đối tượng.|針對不同的年齡層、不同的對象
24|Trong bốn tin rao, ý nào đúng?|Tin của Tiểu Trần ghi máy tính đã dùng một năm.|已使用一年
25|Nếu muốn mua máy tính mới thì nên tìm ai?|Anh Vương rao bán máy tính “mới hoàn toàn”; những tin còn lại là hàng cũ hoặc tin muốn mua.|AKER 全新電腦
26|Bức thư nói điều gì về Tiểu Mỹ?|Thư nhắc bạn trai Tiểu Mỹ là Đại Trung đã tìm được việc làm tốt.|妳男朋友大忠畢業後找到了不錯的工作
27|Theo bức thư, ý nào không đúng?|Người hỏi công việc mới của Đại Trung là người viết thư, Minh Chân; không phải Tiểu Mỹ.|不知道他的新工作做得怎麼樣
28|Theo sổ tay của Tâm Mỹ, ý nào không đúng?|Thứ Ba cô học tiếng Anh; bài thi toán diễn ra vào thứ Tư.|13／星期二　7:30–9:00 PM 上英文課
29|Tâm Mỹ đi làm vào những ngày nào?|Sổ tay ghi cô làm ở quán cà phê vào thứ Hai và thứ Sáu.|12／星期一　6:00–10:00 PM 去咖啡店工作
30|Sử dụng máy bơm xăng tự phục vụ như thế nào?|Hướng dẫn nói đặt vòi vào bình xăng rồi mới bấm “Bắt đầu”.|把油槍放入車子的油箱，然後按「開始」
31|Khi dùng máy, khách có thể làm gì?|Nếu có trục trặc, khách cần báo nhân viên trạm xăng.|如果有問題，請通知加油站的服務人員
32|Thông tin nào về sản phẩm này là đúng?|Nhãn yêu cầu bảo quản nơi mát, tránh nắng trực tiếp.|放在陰涼的地方
33|Nếu sản phẩm có vị lạ, cần làm gì?|Nhãn yêu cầu gửi sản phẩm về trụ sở công ty khi có vấn đề.|請將產品寄回總公司
34|Theo thư của khách sạn, ý nào đúng?|Khách sạn hỏi David có chấp nhận một phòng lớn hay không và chờ anh trả lời.|如果你們接受的話，請在明天打電話到來來飯店
35|David có thể gọi cho khách sạn lúc nào?|Cần gọi ngày hôm sau, tức 22/12, trong khung 8 giờ sáng đến 10 giờ tối; 9 giờ tối phù hợp.|早上8:00～晚上10:00
36|Tác phẩm nào phù hợp yêu cầu của tòa soạn?|Trong bốn lựa chọn, bài giới thiệu nhân vật địa phương gần với yêu cầu về chuyện thật, gắn với địa phương nhất; bài vẫn phải chưa từng công bố.|與各地風土人情有關的
37|Theo thông báo, ý nào đúng?|Thông báo ghi rõ bản quyền bài được đăng thuộc tòa soạn.|版權歸本社所有
38|Bài viết chủ yếu nói về điều gì?|Tác giả nêu việc chi tiêu quá mức và khó trả nợ do dùng thẻ tín dụng.|給人們帶來了很大的麻煩
39|Vì sao Kỳ Mỹ phải làm ba việc?|Cô phải kiếm tiền trả ngân hàng vì đã mua quá nhiều bằng thẻ.|把賺來的錢全部還給銀行
40|Nguyên nhân nào không được bài nhắc tới?|Bài nêu việc mua quá nhiều, không theo dõi chi tiêu và ngân hàng giải thích chưa rõ; không nói người dùng có quá nhiều thẻ.| 
41|Vì sao vợ chồng Collins không đổi phòng?|Khách sạn đã hết phòng, còn đổi khách sạn lúc ấy thì quá muộn.|旅館的所有房間都被訂了
42|Vì sao ông Collins đánh thức vợ?|Ông nghe thấy tiếng lạ và nghĩ con ma đã xuất hiện.|聽到奇怪的聲音
43|Ý nào sau đây sai?|Con ma muốn luyện tiếng Anh với ông Collins, không phải với bà.|比較想跟你練習英文
44|Bài viết chủ yếu nói về điều gì?|Tác giả mở đầu bằng ý giấc mơ giúp chúng ta hiểu chính mình và tiếp tục giải thích bằng ví dụ.|如果我們了解自己的夢，就能了解自我
45|Mơ thấy mình đến muộn cuộc hẹn có thể có nghĩa gì?|Giấc mơ có thể nhắc người đó về cuộc hẹn sắp tới mà họ quên ghi lại.|某個約會即將到來，而你卻忘了記下來
46|Tác giả hiểu giấc mơ của người phụ nữ trong đoạn hai thế nào?|Giấc mơ phản ánh sự bất mãn và giận dữ đối với chồng.|對丈夫的不滿及憤怒
47|Bài viết chủ yếu nói về điều gì?|Phần lớn bài trình bày các bước để giảm phiền muộn.|解決煩惱的第一步
48|Theo tác giả, phiền muộn bắt nguồn từ đâu?|Tác giả cho rằng ta quá coi trọng mọi chuyện.|因為我們把事情看得太嚴重了
49|Cách nào để giảm phiền muộn không được bài nhắc đến?|Bài khuyên trò chuyện với bạn bè, hoạt động ngoài trời và duy trì nếp sống; không nhắc việc uống rượu.| 
50|Cuối bài, tác giả nói điều gì?|Tác giả kết luận dù chuyện gì xảy ra cũng có cách vượt qua.|不管發生什麼事，都一定有辦法度過
`);

function bandBPassageNumber(number: number): number {
  return [16, 17, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 41, 44, 47].filter((start) => start <= number).at(-1) ?? number;
}

function bandBEvidence(question: MockTest["questions"][number], evidence?: string): { evidenceText?: string; evidencePhrase?: string } {
  if (!evidence || !question.passage) return {};
  const original = bandBPackage.components.reading.displayContexts as Record<string, { traditional: string; simplified: string }>;
  const source = Object.values(original).find((context) => context.traditional.includes(evidence) && context[question.script ?? "traditional"] === question.passage);
  const position = source?.traditional.indexOf(evidence) ?? -1;
  if (position < 0 || source?.traditional.length !== question.passage.length) return {};
  const phrase = question.passage.slice(position, position + evidence.length);
  return phrase ? { evidenceText: question.passage, evidencePhrase: phrase } : {};
}

export function enrichReadingReview(result: ReviewContent, test: MockTest): ReviewContent {
  const options = test.id === "band-a-test-01" ? bandAOptions : test.id === "band-b-test-01" ? bandBOptions : {};
  const details = test.id === "band-a-test-01" ? bandADetails : test.id === "band-b-test-01" ? bandBDetails : {};
  for (const question of test.questions) {
    if (question.section !== "reading" || !question.number) continue;
    if (test.id === "novice-reading-2018-11" && noviceOptions[test.script ?? "traditional"][question.number]) {
      const existing = result.reading[question.id];
      result.reading[question.id] = {
        kind: existing?.kind ?? "answer", vietnamese: existing?.vietnamese ?? "",
        optionChinese: noviceOptions[test.script ?? "traditional"][question.number],
        optionVietnamese: noviceOptionTranslations[question.number],
      };
      continue;
    }
    const detail = details[question.number];
    const existing = result.reading[question.id];
    if (!existing && !detail && !options[question.number]) continue;
    const passageVietnamese = detail?.passage ?? (test.id === "band-b-test-01" && question.number >= 16 ? bandBPassages[bandBPassageNumber(question.number)] : test.id === "band-a-test-01" && question.number >= 46 ? existing?.vietnamese.split(" Đáp án:")[0] : undefined);
    const script = test.script ?? "traditional";
    const evidenceText = detail?.evidenceContext?.[script];
    const traditionalContext = detail?.evidenceContext?.traditional;
    const sourcePosition = traditionalContext && detail?.evidence ? traditionalContext.indexOf(detail.evidence) : -1;
    const evidencePhrase = evidenceText && traditionalContext?.length === evidenceText.length && sourcePosition !== undefined && sourcePosition >= 0 && detail?.evidence ? evidenceText.slice(sourcePosition, sourcePosition + detail.evidence.length) : undefined;
    const sourceEvidence = test.id === "band-b-test-01" ? bandBEvidence(question, detail?.evidence) : evidenceText && evidencePhrase ? { evidenceText, evidencePhrase } : {};
    result.reading[question.id] = {
      kind: existing?.kind ?? "question", vietnamese: existing?.vietnamese ?? "",
      ...(detail ? { passageVietnamese, questionVietnamese: detail.question, optionVietnamese: detail.options ?? options[question.number], explanation: detail.explanation, ...sourceEvidence, note: detail.note } : { passageVietnamese, optionVietnamese: options[question.number] }),
      ...(test.id === "band-a-test-01" && question.number === 45 ? { completedPassageChinese: completedBandAPassage(test) } : {}),
    };
  }
  return result;
}
