"""Curated Vietnamese teaching notes for the supplied Band C mock test.

Every evidence phrase is checked against the stored Chinese transcript or
passage and the answer key before the output can be written.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "data/structured-tests/band-c-test-01.json"
TRANSCRIPTS = ROOT / "data/test-supplements/band-c-test-01/listening-transcripts.json"
OUTPUT = ROOT / "data/test-supplements/band-c-test-01/review-vi.json"

READING_PASSAGES = {
    1: """Từ thế kỷ 15, châu Âu đã có báo chép tay đưa tin về chính trị, chiến tranh, thị trường và lịch tàu. Dù vượt khỏi hình thức thư từ cá nhân truyền thống, báo chép tay vẫn chỉ lan truyền trong phạm vi nhỏ. Phải đến khi kỹ thuật in tiến bộ, báo chí mới có thể phát hành rộng rãi. Sự phổ biến của báo chí cũng gắn chặt với sự phát triển của thương mại hiện đại. Kinh tế tăng trưởng nhanh khiến các vùng, các quốc gia liên hệ mật thiết hơn; con người cần hiểu nhau và thông tin cần được truyền đi nhanh. Vì thế, mức độ phụ thuộc vào báo chí tăng dần, ngành báo phát triển mạnh.""",
    6: """Hiện nay nhiều trường tiểu học và trung học khuyến khích học sinh học bằng máy tính. Nhưng cho trẻ dùng máy tính của người lớn khó tránh khỏi đủ loại lo ngại: cha mẹ sợ trẻ xóa nhầm tệp quan trọng hoặc vào mạng khiến máy nhiễm vi rút. So với việc máy bị nhiễm vi rút, điều đáng lo hơn là trẻ lỡ vào trang khiêu dâm hay cờ bạc. Vì tỷ lệ trẻ dùng máy tính tăng hằng năm, có hãng nhìn thấy xu hướng này và tung ra máy tính dành riêng cho trẻ. Máy vừa cài sẵn phần mềm học tập, vừa cho phép cha mẹ theo dõi việc trẻ lên mạng. Sản phẩm được đón nhận ngay khi ra mắt, đạt doanh số ấn tượng và đem lại lợi nhuận lớn cho hãng.""",
    11: """Mỗi khi nhìn lại đời mình, tôi nhận ra những biến cố và trắc trở từng trải qua dường như đã trở thành nguồn sức mạnh và dưỡng chất. Nếu không có chúng, có lẽ tôi đã không gặp những con người và sự việc đáng quý trên đường đời. Thời gian dần làm phai những điều ấy, để lại hơi ấm đan từ niềm vui và nước mắt; hối hận và bất mãn trước kia cũng tan biến. Tôi thường kể chuyện đó cho bạn bè. Họ khuyên tôi viết lại: thay vì ôm ký ức xuống mồ, hãy gom thành sách để khi một ngày tôi không còn nhớ, vẫn có người nhớ giúp tôi.""",
    16: """Ở Đài Loan, nam giới sống ít hơn nữ giới trung bình khoảng năm năm. Dù vậy, họ không chú ý sức khỏe hơn; ngay cả khi ốm, họ thường viện cớ bận và không có thời gian để tránh đi khám. Theo chuyên gia, nhiều nam giới đối xử với sức khỏe như một món đồ: còn dùng tạm được thì khỏi sửa. Họ cố lờ đi bệnh vặt vì sợ bác sĩ phát hiện thêm nhiều bệnh hoặc phải uống thuốc suốt đời. Tuổi thọ khác nhau một phần do di truyền và thể trạng bẩm sinh, nhưng nhiều chuyên gia cho rằng thái độ của nam giới đối với sức khỏe mới là yếu tố đáng chú ý hơn gen.""",
    18: """Chim ruồi là loài chim rất nhỏ, chỉ bằng ngón tay cái. Mỏ dài và mảnh, chúng chỉ ăn mật hoa cùng côn trùng nhỏ trên hoa, ngày ngày bay quanh vài loại cây. Có lẽ vì thức ăn đơn điệu nên chúng không lớn, cũng không bay cao. Có người học theo cách giống chim ruồi: thích đọc nhưng chỉ vùi đầu vào sách của mình, thành nô lệ cho sách và không quan tâm thế giới xung quanh. Nỗ lực đọc của họ đáng quý, song điều đáng lo là mắc kẹt trong tháp ngà. Đọc sách như ăn uống, không nên chỉ ăn một món: ngoài sách in, còn phải đọc cuốn sách lớn là cuộc đời.""",
    21: """Nên dùng loại giấy vệ sinh nào? Nghe có vẻ là chuyện nhỏ, nhưng lại ảnh hưởng rất lớn đến môi trường. Các chuyên gia nói giấy vệ sinh siêu mềm dùng dễ chịu, song mức độ tàn phá môi trường thậm chí còn nghiêm trọng hơn ô tô tốn xăng hoặc đồ ăn nhiều rác thải. Sợi dài của gỗ nguyên sinh dễ tơi và phồng, thích hợp làm giấy rất mềm, nên phần lớn giấy siêu mềm bán trên thị trường đến từ rừng nguyên sinh. Quá trình làm bột giấy còn dùng nhiều hóa chất. Dùng loại giấy này thường xuyên đồng nghĩa với một cái giá môi trường rất lớn.

Ở châu Âu và Mỹ Latinh, không ít hãng sản xuất giấy vệ sinh từ gỗ tái chế. Tuy vậy, nhiều người vẫn nghĩ giấy làm từ vật liệu tái chế kém chất lượng, cứng như bìa, khó dùng, thậm chí gây hại da; bài viết khẳng định đó là ngộ nhận. Tổ chức Hòa bình Xanh đã phát tài liệu phản đối quảng cáo giấy siêu mềm của ngành giấy và kêu gọi người tiêu dùng chú ý lựa chọn sản phẩm. Mỗi lần dùng giấy vệ sinh có thể chỉ ba giây; không đáng hy sinh môi trường sinh thái quý giá chỉ vì chút cảm giác êm mềm ấy.""",
    24: """Từ đầu kỷ Jura hơn 200 triệu năm trước, thân hình khổng lồ là đặc điểm phổ biến ở động vật sống trên cạn. Cơ thể càng lớn, chúng càng khó bị săn và càng dễ bắt mồi. Linh dương dễ trở thành con mồi của sư tử, linh cẩu và chó săn, còn voi và tê giác trưởng thành hầu như không bị đe dọa; con non cũng được cha mẹ to lớn bảo vệ. Với động vật ăn cỏ, thân hình cao giúp chúng ăn lá trên cây cao. Hươu cao cổ và voi có thể cao tới năm mét; voi còn dùng thân mình xô đổ cây cao.

Những lợi ích khác ít dễ thấy hơn: nếu đi cùng một quãng đường, một con voi nặng năm tấn tiêu hao ít năng lượng hơn cả đàn linh dương có tổng trọng lượng năm tấn. Tốc độ trao đổi chất cũng giảm khi cơ thể lớn lên. Vì vậy, chuột chù mỗi ngày phải ăn lượng thức ăn vượt quá trọng lượng bản thân, trong khi voi chỉ cần ăn bằng khoảng 5% trọng lượng của nó. Cơ thể đồ sộ còn giữ nhiệt như một tấm cách nhiệt, giúp con vật chịu được chênh lệch nhiệt độ lớn.

Tuy nhiên, kích thước lớn cũng có hại. Động vật lớn ăn nhiều nên tổng số cá thể có hạn: ngay trước khi bị con người săn bắt, voi và tê giác châu Phi cũng chỉ có hàng triệu con, trong khi loài gặm nhấm có tới hàng chục tỷ con. Động vật khổng lồ còn khó chui hang, leo cây hay bay lượn như động vật nhỏ.""",
    28: """Khi phát triển, doanh nghiệp nên tự nghiên cứu sản phẩm hay hợp tác với doanh nghiệp khác? Báo cáo của một trường kinh doanh cho rằng câu trả lời chủ yếu phụ thuộc vào mức độ phức tạp của sản phẩm. Sản phẩm quá đơn giản hoặc quá phức tạp đều ít phù hợp để hợp tác; với sản phẩm có độ phức tạp trung bình, làm chung có thể tốt hơn tự làm.

Với sản phẩm đơn giản, chính công ty đã có thể tìm hướng thiết kế tốt nhất hoặc tự giải quyết vấn đề kỹ thuật, nên tìm đối tác chỉ thêm việc. Với sản phẩm rất phức tạp, quá nhiều chi tiết cùng khác biệt lớn về quan điểm dễ làm nảy sinh bất đồng trong nghiên cứu hay tiếp thị, khiến hiệu suất giảm mạnh.

Với sản phẩm phức tạp vừa phải như máy tính cá nhân, tìm đối tác thường tốt hơn đóng cửa tự làm. Dù tranh luận và bất đồng khó tránh, lắng nghe ý tưởng của đối tác có thể khơi gợi cảm hứng, giúp chia sẻ sáng kiến. Các bên còn có thể cùng khảo sát thị trường để nhanh chóng nắm xu hướng tiêu dùng. Những lợi ích ấy vượt xa tác động xấu của việc không thống nhất ý kiến.""",
    32: """Xe đạp có trọng tâm cao, lốp hẹp, khó giữ thăng bằng và khó phanh, nên thực ra là phương tiện khá nguy hiểm. May thay, xe chạy bằng sức người: người bình thường khó đạp nhanh hơn 30 km/giờ, duy trì tốc độ cao còn khó hơn, vì thế xe đạp vẫn tương đối an toàn.

Bộ chuyển số giúp đạp hiệu quả hơn, đi nhanh hơn và leo dốc cao hơn, nhưng cũng kéo theo rủi ro. Khi xuống dốc, tốc độ xe đạp có thể gần bằng ô tô hoặc xe máy, trong khi thiết kế của nó vốn không phù hợp chạy nhanh. Nếu không giảm tốc kịp khi vào cua, người đi xe dễ mất thăng bằng và trượt, có thể rơi xuống vực hoặc lao sang làn đường ngược chiều, dẫn đến thương tích nặng hay tử vong.

【I】 Những năm gần đây, xe đạp càng được làm nhẹ, lốp càng hẹp và mặt lốp càng trơn. 【II】 Theo lẽ thường, người đạp xe giải trí không cần chạy theo loại xe đua như vậy. Đáng tiếc, nó lại là xu hướng chính trên thị trường xe đạp Đài Loan. 【III】 Ai cũng muốn so xe nào nhẹ, xe nào nhanh; các hãng thì sẵn lòng bán đủ loại trang bị và mẫu xe để thu lợi lớn. 【IV】""",
    36: """Tôi thường tự hỏi: ở nhà sang, được thăng chức hay tăng lương có thật sự khiến người ta hạnh phúc? Đọc xong cuốn “Chúc bạn năm nay hạnh phúc” của giáo sư Bào, tôi nhận ra đó chỉ là niềm vui lóe lên rồi tắt, chưa phải hạnh phúc bền lâu. Như sách viết, hạnh phúc là cảm giác mãn nguyện và an lành trải khắp cuộc sống, còn niềm vui giống pháo hoa, thoáng chốc đã qua.

Biết điều ấy không có nghĩa là dễ thực hiện. Cuốn sách nói hạnh phúc cần được rèn luyện, và con chó đang đuổi thỏ hạnh phúc hơn con chó nằm ngủ ngoài hiên. Không phải vì nó bắt được thỏ: khi bận rộn vượt qua thử thách, ta thường phát hiện tài năng và giá trị của mình. Điều này cũng giải thích vì sao nhiều người giàu không phải đối mặt với khó khăn vẫn không hạnh phúc.

Một nghiên cứu trên tạp chí của Viện Hàn lâm Khoa học cho rằng 50% hạnh phúc do mức hạnh phúc nền quyết định, điều kiện sống chỉ chiếm 10%, còn 40% phụ thuộc vào hành động. Nói cách khác, suy nghĩ có vai trò dẫn dắt hạnh phúc. Giáo sư Bào ví bộ não chỉ nặng 1,35 kg nhưng điều khiển cả cơ thể và hướng đi cuộc đời, giống người phi công nhẹ hơn chiếc máy bay rất nhiều nhưng vẫn điều khiển đường bay.

Gần đây tôi làm theo lời khuyên trong sách: tập mỉm cười và nghĩ “mình rất hạnh phúc”. Cách ấy giúp tôi nhận ra những điều làm mình vui trong cuộc sống. Nhưng theo trải nghiệm của tôi, đừng nói “mình muốn hạnh phúc”: câu ấy ngầm thừa nhận hiện tại mình không hạnh phúc và có thể phản tác dụng.""",
    40: """Giải thưởng Nước Stockholm năm 2008 được trao cho giáo sư Tony Allan, người đưa ra khái niệm “nước ảo”: lượng nước cần cho quá trình sản xuất và bán thực phẩm hoặc hàng tiêu dùng. Con người không chỉ dùng nước khi uống hay tắm; tiêu thụ sản phẩm khác cũng dùng rất nhiều nước. Chẳng hạn, một tách cà phê cần 140 lít nước trong các khâu trồng, sản xuất, đóng gói và vận chuyển, tương đương lượng nước một người Anh dùng trung bình mỗi ngày để uống và sinh hoạt.

Khái niệm này còn giải thích cách “giao dịch nước ảo”, có ảnh hưởng lớn đến chính sách thương mại và sử dụng nước toàn cầu. Nông nghiệp ở vùng khí hậu ẩm thường dùng nước mưa tự nhiên rẻ hơn hệ thống tưới tốn kém, nên giảm được chi phí sản xuất. Những vùng ấy có thể “xuất khẩu” nước sang nước nóng, khô hạn thông qua nông sản. Ngược lại, nước khô hạn có thể nhập cây trồng cần nhiều nước để giảm áp lực lên nguồn nước trong nước. Trên giấy tờ, người ta chỉ thấy giao dịch nông sản; thực chất còn có sự trao đổi nguồn nước.

Ở Ai Cập, ngày càng nhiều món ăn truyền thống được làm từ lương thực nhập khẩu, thay vì lúa mì tưới bằng nước sông Nile. Nếu Ai Cập nhất quyết tự trồng toàn bộ ngũ cốc, nước này sẽ sớm thiếu nước.

Báo cáo của Tuần lễ Nước Thế giới cũng dùng khái niệm trên để chỉ ra rằng khủng hoảng lương thực toàn cầu hiện nay nằm ở sự lãng phí quá mức chứ không phải sản xuất không đủ. Từ sản xuất, chế biến, vận chuyển, bảo quản, bán đến nấu ăn, mỗi khâu đều dùng nước. Vứt thức ăn đã mua cũng đồng nghĩa lãng phí nước dùng để trồng, chở và cất giữ nó. Các chuyên gia cho rằng chỉ khi tránh lãng phí thực phẩm mới có thể thực hiện chính sách tiết kiệm nước hiệu quả.""",
    45: """Bạn tôi, ông Trương, mua bảo hiểm nhân thọ trọn đời kèm bảo hiểm y tế cho phẫu thuật. Ông mong khi đau ốm hoặc gặp tai nạn sẽ được hỗ trợ viện phí hay bồi thường. Người mua bảo hiểm thường cũng chỉ muốn có sự bảo đảm và yên tâm như vậy. Thế nhưng hai năm trước, sau ca phẫu thuật đục thủy tinh thể, ông xin tiền bảo hiểm mà bị công ty từ chối.

Nhân viên bảo hiểm nói điều khoản yêu cầu người được bảo hiểm phải nằm viện sau phẫu thuật mới được nhận tiền. Ông Trương mổ và về ngay trong ngày nên không đủ điều kiện. Ông rất bất bình: trước đây mổ đục thủy tinh thể đúng là phải nằm viện, nhưng y học đã tiến bộ, nay mổ xong có thể về ngay, không cần chiếm giường bệnh và lãng phí nguồn lực y tế.

Ông Trương khiếu nại đến Trung tâm Phát triển Bảo hiểm để đòi bồi thường theo đường hợp pháp. Trung tâm xác nhận ông không nằm viện và cũng không cần nằm viện; thực tế ca mổ không đáp ứng điều kiện trong hợp đồng, nên công ty từ chối chi trả đúng theo thỏa thuận. Ông không phục, lên mạng đăng những nhận xét bất lợi cho công ty. Sau đó công ty kiện ông về hành vi phỉ báng ác ý.

Qua lại như vậy, hai bên đều chịu thiệt. Theo tác giả, công ty bám sát điều khoản thì có lý về mặt hợp đồng, nhưng về tình lại quá lạnh lùng và thiếu cảm thông. Công ty nên nhìn xa hơn, chủ động trao đổi, cân nhắc hỗ trợ một phần và linh hoạt ngoài câu chữ của hợp đồng. Cách ấy có thể nâng hình ảnh của công ty, giúp người được bảo hiểm và đem lại lợi ích cho cả hai bên.""",
}

# Each row: number | Vietnamese question | option A / B / C / D | evidence in
# the original Chinese passage (Traditional) | concise explanation.
READING_DETAILS = r"""
1|Điền chỗ trống 1.|vì / mặc dù / nếu đã / tuy nhiên|但傳播的範圍還很小|Có sự đối lập giữa việc vượt khỏi thư riêng và phạm vi truyền bá vẫn hẹp; đáp án B mở đầu mệnh đề nhượng bộ.
2|Điền chỗ trống 2.|từ trước đến nay / nhất thời / một khi / mãi cho đến|要等到印刷技術進步|Đáp án D diễn tả phải chờ mãi cho tới khi kỹ thuật in phát triển.
3|Điền chỗ trống 3.|nhờ đó có thể / đem ra để / dùng để / đủ để|報紙才【3】大量發行|Sau khi kỹ thuật in phát triển, báo mới có điều kiện phát hành rộng; đáp án A diễn tả khả năng ấy.
4|Điền chỗ trống 4.|khó tránh / không tách rời / không đi được / không nổi lên được|跟近代商業的發展【4】關係|Đáp án B tạo thành cụm nghĩa là có liên hệ chặt chẽ với sự phát triển thương mại.
5|Điền chỗ trống 5.|cực kỳ / khá / ngày càng / sau đó|依賴也就【5】加深|Mức độ phụ thuộc tăng theo thời gian, nên đáp án C mang nghĩa “ngày càng”.
6|Điền chỗ trống 6.|không ngờ / chưa chắc / khó tránh / dù cho|讓小孩用，【6】會有各種顧慮|Cho trẻ dùng máy của người lớn thì khó tránh khỏi lo ngại; đáp án C phù hợp ngữ cảnh.
7|Điền chỗ trống 7.|e rằng / lỡ như / thậm chí / hơn nữa|小孩逛到色情或賭博網站，那就更糟糕了|Đáp án B đặt ra tình huống xấu có thể xảy ra: lỡ trẻ vào trang không phù hợp.
8|Điền chỗ trống 8.|một (lượng từ cho xu hướng) / một (lượng từ cho kiểu) / một (lượng từ cho mảnh) / một (lượng từ cho chuỗi)|這【8】趨勢|Đáp án A là lượng từ dùng với “xu thế”; các lượng từ còn lại không tự nhiên ở đây.
9|Điền chỗ trống 9.|tuy… nhưng… / trừ khi… mới… / bất kể… cũng… / không những… mà còn…|內建各種學習軟體，【9】可讓父母監控|Hai tính năng được bổ sung cho nhau; đáp án D nối ý “không những… mà còn…”.
10|Điền chỗ trống 10.|khách hàng / việc bán hàng / thành tích kinh doanh / tình hình kinh tế|創造出亮眼的【10】|Đáp án C tạo thành cụm “thành tích kinh doanh nổi bật”, phù hợp việc hãng thu lợi lớn.
11|Điền chỗ trống 11.|mù quáng làm theo / tuân theo / tán thưởng / gặp phải|所【11】的意外|Đáp án D mang nghĩa “gặp biến cố”; những động từ khác không đi tự nhiên với danh từ này.
12|Điền chỗ trống 12.|chưa / khỏi cần / đừng / nếu không có|若【12】這些意外與曲折|Đáp án D hoàn thành ý “nếu không có”; vế sau nói tác giả sẽ không gặp những người, việc đáng quý.
13|Điền chỗ trống 13.|làm phai nhạt / cắt giảm / tiêu hao / bóc lột|在時間漸漸【13】一切後|Thời gian làm phai cảm xúc và ký ức; đáp án A là cách dùng phù hợp.
14|Điền chỗ trống 14.|qua đời / tan biến / quay trở lại / sợ mất hồn|悔恨和不滿彷彿都已【14】|Đáp án B ví sự hối hận, bất mãn tan biến như mây mù.
15|Điền chỗ trống 15.|vì… nên… / cho dù… vẫn… / dù sao… rồi… / thay vì… chi bằng…|自己帶著回憶走進棺材，【15】集結成冊|Tác giả đối chiếu hai lựa chọn: thay vì giữ ký ức cho riêng mình, chi bằng viết thành sách. Đáp án D phù hợp.
16|Theo bài, vì sao nam giới không muốn đi khám bác sĩ?|không có thời gian / cơ thể luôn khỏe mạnh / sợ phát hiện nhiều bệnh / cho rằng bác sĩ chỉ phát hiện bệnh nhẹ|害怕一去看醫師就會發現許多毛病|Họ viện cớ bận, nhưng bài nói rõ nỗi sợ thực sự là bác sĩ phát hiện thêm nhiều vấn đề sức khỏe.
17|Theo chuyên gia, nguyên nhân chính khiến nam giới sống ngắn hơn nữ giới là gì?|không coi trọng sức khỏe / liên quan đến gen / áp lực công việc lớn / sức đề kháng kém|倒不如說與男人對健康的態度有關|Bài có nhắc yếu tố bẩm sinh, nhưng chuyên gia nhấn mạnh thái độ đối với sức khỏe.
18|Tác giả dùng chim ruồi để ví với kiểu người nào?|người không đọc sách / người chỉ biết vùi đầu đọc sách / người đọc ít sách / người giả vờ đọc sách|一心只讀自己的書|Điểm giống chim ruồi là chỉ tiếp nhận một loại “thức ăn”: họ chỉ đọc sách của mình mà thiếu trải nghiệm khác.
19|Theo tác giả, người giống chim ruồi gặp vấn đề gì?|không đủ chuyên sâu / không đủ chăm chỉ / không quan tâm thế sự / không coi trọng đạo đức|任天塌下來也不管|Hình ảnh “trời sập cũng mặc” cho thấy họ chỉ vùi đầu vào sách và thờ ơ với thế giới.
20|Tác giả nhìn nhận việc đọc sách như thế nào?|không cần đọc nhiều sách / ăn uống quan trọng hơn đọc sách / đọc sách không nên bị thế sự quấy nhiễu / tiếp thu kiến thức không chỉ từ sách in|印刷的書籍要讀，人生這本大書更得讀|Tác giả khuyên đọc cả sách in lẫn “cuốn sách cuộc đời”, tức học từ trải nghiệm thực tế.
21|Tác giả khuyên người mua giấy vệ sinh cân nhắc yếu tố nào?|nguyên liệu / giá cả / cảm giác khi dùng / thương hiệu|超柔軟衛生紙大多來自原始森林|Nguồn gỗ nguyên sinh tạo độ mềm nhưng gây tổn hại môi trường; vì vậy cần xét nguyên liệu.
22|Từ “ngộ nhận” ở đoạn hai nói đến điều gì?|dùng giấy vệ sinh có hại cho người / dùng giấy vệ sinh không hại môi trường / giấy làm từ vật liệu tái chế khó dùng / sản phẩm châu Âu, Mỹ Latinh tốt hơn|用回收品做出的衛生紙品質差、硬如紙板、難以使用|Bài gọi quan niệm giấy tái chế kém, cứng và khó dùng là một sự ngộ nhận.
23|Ý chính của bài là gì?|khuyên ngừng dùng giấy vệ sinh / đề xuất tái sử dụng giấy đã dùng / cách làm giấy mềm hơn / thế nào là giấy vệ sinh thân thiện môi trường|重視衛生紙產品的選擇|Từ nguyên liệu đến lời kêu gọi lựa chọn giấy, bài tập trung vào tác động môi trường của sản phẩm.
24|Đoạn đầu nói đến điều nào?|thân hình lớn giúp động vật ăn cỏ kiếm thức ăn / đa số động vật ăn cỏ đều to / voi hoặc tê giác con dễ bị tấn công nhất / sư tử và linh cẩu cũng săn động vật lớn|可以吃到更高處的樹葉|Động vật ăn cỏ cao lớn với tới lá trên cao; các ý còn lại không đúng với đoạn đầu.
25|Vì sao đoạn đầu nhắc đến linh dương?|vì chúng là thức ăn chính của thú lớn / để minh họa động vật nhỏ dễ bị săn / để nhấn mạnh thú lớn kém linh hoạt / để nói thú lớn đa phần ăn cỏ|羚羊很容易淪為獅子、土狼和獵犬的獵物|Linh dương được đối chiếu với voi, tê giác ít bị đe dọa, làm rõ lợi thế phòng vệ của thân hình lớn.
26|Theo đoạn hai, thân hình lớn có tác động gì?|tăng trao đổi chất / nhanh tiêu hao năng lượng / giúp giữ ấm / phải ăn lượng thức ăn bằng trọng lượng cơ thể|像隔熱板一樣的保溫作用|Bài ví thân hình lớn như tấm cách nhiệt; những phương án kia trái nội dung đoạn hai.
27|Đoạn cuối so sánh động vật lớn và nhỏ ở hai mặt nào?|số lượng và độ linh hoạt / tỷ lệ sinh và tử / thức ăn và chỗ ở / săn mồi và chạy trốn|其總數自然有限|Đoạn so số lượng ít của thú lớn với số lượng rất đông của thú nhỏ, rồi so khả năng chui hang, leo cây, bay.
28|Đoạn đầu chủ yếu bàn điều gì?|cách tìm đối tác / sản phẩm nào có thị trường / vì sao phải độc lập / cách phát triển sản phẩm phù hợp nhất|答案主要取決於產品本身的複雜度|Bài đặt vấn đề tự phát triển hay hợp tác, rồi dùng độ phức tạp để chọn cách làm.
29|Khi nào công ty thích hợp tự phát triển sản phẩm ít phức tạp?|khi kinh tế suy thoái / khi tìm được đối tác / khi tự giải quyết được vấn đề / khi nội bộ bất đồng|公司本身就能找出最佳的設計方向或是解決技術問題|Với sản phẩm đơn giản, công ty tự xử lý được thiết kế và kỹ thuật nên không cần đối tác.
30|Theo tác giả, điều gì xảy ra khi các công ty hợp tác phát triển máy tính cá nhân?|khó xảy ra bất đồng / có thể tăng sức sáng tạo / dễ làm thị trường thu hẹp / cho thấy công ty gặp khó|有利於刺激靈感、分享創意|Hợp tác có thể gây tranh luận, nhưng bài nhấn mạnh lợi ích khơi gợi ý tưởng và chia sẻ sáng tạo.
31|Điều nào không phải lợi ích của việc tự phát triển sản phẩm?|có thể tăng hiệu suất / tránh bất đồng ý kiến / nhanh nắm tình hình thị trường / thích hợp với sản phẩm khá phức tạp|一起進行市場調查、快速掌握消費動向|Nắm nhanh xu hướng thị trường được nêu như lợi ích của hợp tác, không phải tự phát triển.
32|Theo đoạn đầu, điểm an toàn của xe đạp nằm ở đâu?|tốc độ có giới hạn / rèn thăng bằng / phanh là dừng ngay / tăng tốc nhanh trong thời gian ngắn|要踩出三十公里以上的時速已不容易|Xe đạp khó đạt và duy trì tốc độ cao bằng sức người; đó là lý do nó tương đối an toàn.
33|Đoạn hai chủ yếu nói điều gì?|đi chậm chưa chắc an toàn / thiết kế xe đạp không hợp tốc độ cao / xe đạp ít nguy hiểm hơn ô tô, xe máy / thiếu đồ bảo hộ là nguyên nhân chính|先天條件其實並不適合高速騎乘|Dù bộ chuyển số giúp đi nhanh, thiết kế vốn không hợp tốc độ cao, nhất là khi xuống dốc và rẽ.
34|Theo đoạn ba, thị trường xe đạp hiện gặp vấn đề gì?|xe đạp giải trí chưa đủ an toàn / người dân dùng xe giải trí để đua / người mua chuộng xe kiểu đua / chỉ xe đạp giải trí có thị trường|這偏偏是目前台灣單車市場的主流|“Loại xe đua này” lại thành xu hướng chủ đạo dù người đạp để giải trí không cần nó.
35|Câu nói về xe đua đi ngược nguyên tắc an toàn nên đặt ở vị trí nào?|vị trí I / vị trí II / vị trí III / vị trí IV|輪胎越變越窄，胎面越來越趨於平滑|Câu cần đặt sau phần mô tả xe đua ngày càng nhẹ, lốp hẹp và trơn, rồi mới chuyển sang nhu cầu của người đi xe giải trí: vị trí II.
36|Từ “đó” ở đoạn đầu chỉ điều gì?|hạnh phúc thật, bền lâu / trạng thái thỏa mãn / mục tiêu vật chất trong cuộc sống / cuốn sách “Chúc bạn năm nay hạnh phúc”|住豪宅或是升職、加薪|“Đó” quay lại những thứ tác giả vừa liệt kê: nhà sang, thăng chức, tăng lương.
37|Vì sao giáo sư Bào nhắc con chó đuổi thỏ?|để nói thiếu dũng khí thì không vui / để nói hạnh phúc đến từ quá trình theo đuổi / để nói người ta không phân biệt được vui và hạnh phúc / để nói đa số người hiện đại sống không mục tiêu|並非為捉到兔子能令人快樂|Niềm vui nằm ở việc vượt thử thách và khám phá năng lực, không chỉ ở kết quả bắt được thỏ.
38|Ví dụ người lái máy bay minh họa điều gì?|hạnh phúc là lựa chọn có ý thức / hạnh phúc không nên phân cấp / một nửa hạnh phúc do hành động quyết định / sức mạnh của hạnh phúc rất lớn|快樂是由思維主導的|Phi công nhỏ bé điều khiển máy bay lớn như suy nghĩ dẫn dắt hành động; đáp án A diễn đạt ý này.
39|Sau khi đọc sách, tác giả rút ra điều gì?|không nên coi hạnh phúc là phần thưởng / phải thừa nhận lý do mình không vui / đừng thường xuyên nói ra rằng mình đang tìm hạnh phúc / mỉm cười chẳng có tác dụng|千萬別說出「我想要快樂」|Tác giả thấy mỉm cười có ích nhưng tránh nói “tôi muốn vui”, vì câu đó dễ củng cố cảm giác mình đang không vui.
40|Theo đoạn đầu, “nước ảo” chủ yếu giải thích điều gì?|nước đã dùng có thể tái chế / quá trình sản xuất hàng hóa cũng dùng nước / con người dùng ít nước hơn tưởng tượng / dùng công nghệ thay nước|食品或消費品在生產及銷售過程中所需要的用水量|“Nước ảo” tính cả nước dùng trong sản xuất, bán hàng, ngoài lượng nước sinh hoạt trực tiếp.
41|Theo đoạn hai, các nước có khí hậu ẩm sử dụng nguồn nước như thế nào?|bán nông sản / xuất khẩu nhiều nước uống / nhập nhiều nông sản / xây hệ thống tưới hoàn chỉnh|通過農作物，將水資源「出口」|Họ trồng bằng nước mưa rồi bán nông sản; đó là cách “xuất khẩu” nước gián tiếp.
42|Theo đoạn hai, cách giao dịch “nước ảo” nào đúng?|bán công nghệ khai thác nước / trao đổi qua nông sản / chủ yếu qua mạng / không cần hàng hóa trung gian|檯面上的交易只看得到農產品|Bề mặt là giao dịch nông sản, nhưng bên trong cũng là trao đổi lượng nước dùng để sản xuất.
43|Vì sao Ai Cập dùng lương thực nhập khẩu?|không trồng được lúa mì / tiết kiệm nước trong nước / do thói quen ăn uống / có đủ nước để trao đổi|很快就會面臨水資源不足的窘境|Nếu tự trồng hết ngũ cốc, Ai Cập sẽ sớm thiếu nước; nhập khẩu giúp giảm áp lực đó.
44|Ý chính của đoạn cuối là gì?|cải tiến sản xuất lương thực / sản xuất lương thực giúp tiết kiệm nước / lãng phí thức ăn cũng là lãng phí nước / thiếu nước gây thiếu lương thực toàn cầu|丟棄買回來的食物，也意味著浪費了|Bỏ thức ăn đồng nghĩa bỏ phí lượng nước dùng suốt quá trình sản xuất và vận chuyển.
45|Nên thêm câu nào vào chỗ trống ở đoạn đầu?|có người không muốn mua bảo hiểm vì nghĩ mình khỏe / công ty bảo hiểm thường viện cớ để từ chối bồi thường / điều khoản bảo hiểm khó tránh thiếu sót / người mua bảo hiểm đều muốn yên tâm và được bảo vệ|希望在有生之年若患病、遭逢意外時，能獲得醫療補助或理賠|Câu D tiếp nối mục đích mua bảo hiểm để an tâm; sau đó “tuy nhiên” mới chuyển sang trường hợp bị từ chối.
46|Theo đoạn hai, ông Trương nghĩ gì?|bệnh viện không nên bỏ qua quy trình quan trọng / bệnh viện phải báo phí nằm viện / công ty bảo hiểm không nên chỉ xét có nằm viện hay không / công ty phải trả theo số ngày nằm viện|手術完後即可離開，根本不必住院|Ông cho rằng mổ xong có thể về ngay, nên việc có nằm viện không nên quyết định bồi thường.
47|Câu “ông Trương không có chỗ đứng trong cuộc tranh cãi” nghĩa là gì?|ông mất can đảm / ông đã chuẩn bị kỹ / ông thiếu lý lẽ thuyết phục / ông đùn đẩy trách nhiệm|手術實際狀況不符條款約定要件而未獲給付|Theo hợp đồng, ca mổ không đáp ứng điều kiện nằm viện; vì thế lập luận đòi bồi thường không vững.
48|Công ty bảo hiểm giữ lập trường nào?|cho rằng người được bảo hiểm lãng phí y tế / luôn làm theo nội dung hợp đồng / sau đó đồng ý bồi thường một phần / sau đó thừa nhận hợp đồng thiếu tình người|保險公司堅守合約條款|Bài nói công ty giữ đúng điều khoản; đề nghị hỗ trợ một phần chỉ là ý kiến của tác giả.
49|Theo đoạn cuối, tác giả nghĩ công ty bảo hiểm thế nào?|quá thiếu tình người / không nên tránh gặp mặt / phải bồi thường toàn bộ / làm sai cả tình lẫn lý|在「情」方面未免有失人情味、過於冷血|Tác giả công nhận công ty có lý theo hợp đồng nhưng phê bình cách xử lý quá lạnh lùng.
50|Nhan đề nào phù hợp nhất với bài?|sự linh hoạt ngoài điều khoản trên giấy / chuyện người nhỏ thắng công ty lớn / ví dụ trên không ngay dưới sẽ loạn / phải có bên thứ ba mới cùng có lợi|如能不拘泥於明文規定|Bài đề xuất công ty linh hoạt ngoài chữ nghĩa hợp đồng để đôi bên cùng có lợi.
"""

LISTENING_PASSAGES = {
    1: """Nam: Tiểu Thanh, gần đây cậu có chuyện gì à? Cậu thường xuyên buồn rầu như vậy.
Nữ: Gần đây chủ nhà cứ nói muốn tăng tiền thuê phòng của tôi. Tôi vốn định tìm phòng khác, nhưng phải chuẩn bị tiền đặt cọc hai tháng cộng với tiền thuê tháng đó, thật sự không kham nổi. Dạo này tôi đang kẹt tiền, đành thôi vậy.
Nam: Chủ nhà của tôi cũng chẳng khá hơn. Cái máy giặt ấy không biết đã dùng bao nhiêu năm rồi; cuối cùng nó hỏng mà ông ta lại đổ lỗi cho tôi. Ông ta không chỉ bảo tôi dọn đi mà còn nói sẽ lấy tiền cọc của tôi để bồi thường. Thật quá vô lý!
Nữ: Thế cậu định làm gì?
Nam: Tôi ấy à, ngày nào chủ nhà chưa trả lại tiền cọc, ngày đó tôi chưa dọn đi.""",
    3: """Nam: Tôi vừa đọc xong tác phẩm của ông Oe. Ông ấy đúng là một nhà văn xuất sắc.
Nữ: À, tôi chưa đọc sách của ông ấy, nhưng lại là người hâm mộ nhạc của con trai ông. Nghe nói khi sinh ra, con trai ông có khuyết tật ở não nên khả năng ngôn ngữ không thể phát triển bình thường. Nhưng anh ấy không vì thế mà buông xuôi; nhờ tài năng âm nhạc đặc biệt, anh ấy đã phát hành mấy album riêng rồi đấy!
Nam: Vậy sao? Tôi nghĩ ông Oe hẳn rất tự hào về con trai mình!
Nữ: Chắc chắn rồi. Tôi nhớ trong một buổi diễn thuyết, ông Oe từng nói với người nghe: “Có người bảo tôi nhạc của con trai tôi được yêu thích vì rất dịu dàng, có tác dụng như khúc hát ru. Nếu nghe nhạc của nó xong mà vẫn không ngủ được, thì hãy thử đọc sách tôi viết nhé!” Ha ha!""",
    5: """Nam: Ha ha, cậu xem tin này chưa? Bây giờ đến bệnh viện khám bệnh, không cần chờ cô y tá gọi tên nữa. Bệnh viện sẽ phát cho cậu một máy báo. Khi máy reo tức là đến lượt cậu, có thể vào thẳng phòng khám.
Nữ: Sao phải phiền phức thế? Y tá gọi tên trực tiếp cũng rõ ràng mà!
Nam: Nhưng đôi khi tôi không muốn người khác biết mình bị bệnh gì, khám ở khoa nào! Theo cách trước đây, y tá vừa gọi tên là cả phòng chờ đều nghe thấy. Không có người quen thì thôi; lỡ gặp người quen và họ biết tôi bị bệnh gì, tôi sẽ rất ngượng.
Nữ: Tôi thì không để ý chuyện đó. Nhưng bình thường phòng chờ đông nghịt người. Có dịch vụ này, chắc tôi có thể đi dạo gần bệnh viện, không cần cứ ngồi đợi ở đó, đúng không?
Nam: Đúng vậy. Nhưng vì chi phí dịch vụ khá cao, hiện chỉ áp dụng tại một số khoa mà bệnh nhân dễ thấy ngại, như sản phụ khoa, tiết niệu; không phải khoa nào cũng có.
Nữ: Thế bố tôi đã lớn tuổi, tai lại có vấn đề, không nghe được tiếng máy báo thì sao?
Nam: Cậu đừng lo. Máy có nhiều kiểu báo: phát sáng, rung, hoặc phát nhạc. Ngay cả bệnh nhân khiếm thị hay khiếm thính cũng dùng được. Sau khi dùng, nhân viên y tế còn thu máy về, sát trùng bằng cồn để tránh lây truyền vi rút. Chu đáo thật đấy!""",
    8: """Nam: Tôi rất tán thành chính sách cậu vừa nhắc tới: chính phủ khuyến khích mỗi trại giam tự phát triển sản phẩm đặc trưng. Có nơi chuyên dạy người đang thụ án làm xì dầu truyền thống, có nơi dạy làm sô cô la thủ công. Việc đó vừa tăng thu nhập cho trại giam, vừa giúp họ được đào tạo nghề.
Nữ: Đúng vậy. Thông thường, phần lớn trại giam chọn làm thực phẩm giá phải chăng, thích hợp làm quà tặng và rất được mọi người ưa chuộng. Nhưng cũng có trại giam nghĩ ra cách khác: làm đồ thủ công cần học lâu và đòi hỏi tay nghề cao. Tuy tốn thời gian, công sức, công việc ấy lại hợp với người phải thụ án lâu năm.
Nam: Tôi nghĩ bất kể làm sản phẩm nào, chỉ cần giúp họ học được một nghề để tự nuôi sống bản thân sau khi ra tù là tốt rồi.
Nữ: Đúng, đó cũng là mục tiêu ban đầu của chính sách. Tiếc là theo số liệu tôi có, tỷ lệ tái phạm sau khi ra tù vẫn gần như trước, không giảm đáng kể.
Nam: Tại sao vậy?
Nữ: Tôi nghĩ ngoài những yếu tố từ chính người từng thụ án, nguyên nhân chính vẫn là xã hội có định kiến với người từng ngồi tù. Vì vậy, dù có tay nghề, họ vẫn gặp khó khắp nơi khi xin việc. Cuối cùng, dưới áp lực cuộc sống, họ đành trở lại nghề cũ và đi vào con đường không lối thoát.""",
    11: """Nam: Chào giáo sư Lâm. Nghiên cứu bà vừa chia sẻ với chúng tôi rất thú vị. Tôi muốn hỏi mấy điều. Thứ nhất, nghiên cứu của bà có phát hiện rất đáng kinh ngạc về việc tăng sản lượng trầm hương, nhưng một công trình hoàn chỉnh như vậy lại chỉ mất một năm! Quả thật quá… quá đáng kinh ngạc! Bà thực sự chỉ mất một năm để tìm ra yếu tố then chốt giúp tăng sản lượng trầm hương sao? Ngoài ra, nghiên cứu này đã được công chúng quan tâm và giúp ích nhiều cho nông dân. Xin hỏi kế hoạch tiếp theo của bà là gì?
Nữ: Trưởng khu Trương đúng là người tinh ý. Thông thường, việc này quả thực không thể hoàn thành trong thời gian ngắn. Nhưng các học giả ở đây đều biết tôi đã theo dõi từ lâu cơ chế tự vệ của cây khi bị côn trùng hoặc vi sinh vật gây hại. Vì thế, tuy tôi đưa ra kết quả trong một năm, có thể nói đó là thành quả từ hơn mười năm nỗ lực của tôi. Còn về bước tiếp theo của nghiên cứu này… trưởng khu đang hỏi thay cho nông dân phải không? Xin yên tâm, tôi sẽ ưu tiên cung cấp kết quả nghiên cứu cho nông dân địa phương, hy vọng giúp được họ.""",
    14: """Nữ: Quốc Cường, tôi thường đỗ xe gần đường Trung Hiếu Đông ở Đài Bắc. Một giờ tốn 50 Đài tệ, nhưng nếu mua hàng từ 200 Đài tệ thì được đỗ miễn phí một giờ. Vì ưu đãi này mà tôi thường tiêu nhiều tiền hơn.
Nam: Mỹ Trân, chuyện đó chẳng lạ gì, vì cậu đã rơi vào cái bẫy “miễn phí”. Lấy ví dụ nhé, cậu biết hiệu sách trực tuyến nổi tiếng kia chứ? Nghe nói chiến lược trước đây của họ khác bây giờ. Lúc ấy, chỉ cần đơn hàng đạt… ừm, giả sử 1.000 Đài tệ, thì phí giao hàng chỉ có 50 Đài tệ. Nhưng dù phí thấp như vậy, nó vẫn không hấp dẫn bằng miễn phí giao hàng. Sau đó họ dứt khoát nâng mức tối thiểu lên 2.000 Đài tệ rồi miễn phí giao hàng. Kết quả là doanh số tăng vọt! Cậu thấy không, thực ra cậu đã tiêu nhiều tiền hơn.
Nữ: Đôi khi thật chẳng hiểu nổi tâm lý người tiêu dùng chúng ta!
Nam: Thật ra, trong đa số trường hợp, nhận đồ miễn phí là hoàn toàn hợp lý; không nhận thì phí. Nhưng nếu phải đáp ứng điều kiện mới được nhận, người ta sẽ có tâm lý ham món lợi nhỏ, nghĩ rằng không mất một xu thì sao có thể thiệt được. Thế là ai cũng chọn phương án “miễn phí”, lại quên rằng mình đã trả nhiều hơn để có quyền ấy. Nhiều hãng cũng nắm đúng tâm lý này mà tung ra nước ngọt “không năng lượng”, bánh quy “không calo”. Kết quả là người tiêu dùng quên mất mình đang muốn giảm cân, rồi uống nhiều hơn, ăn nhiều hơn.""",
    18: """Nam: Tiểu Tình, mau lại đây xem trang web này! Nó nói mình là “trang web nổi tiếng nhất thế giới” đấy!
Nữ: Mỗi ngày trên mạng có biết bao trang mới. Ai dám nói trang của mình nổi tiếng nhất thế giới chứ? Đúng là khoác lác!
Nam: Khoan, nếu xem kỹ luật chơi, cậu sẽ thấy họ nói vậy cũng có lý. Trong năm nay, cậu có thể lên mạng đăng ký tên và danh hiệu bất cứ lúc nào. Thích danh hiệu nào thì chọn danh hiệu ấy: cậu có thể là “đứa trẻ nổi tiếng nhất Trái Đất”, cũng có thể là “người chồng chu đáo nhất thế giới”. Sau đó chỉ cần trả một đô la Mỹ, trang web sẽ gửi cho cậu một tệp. In tệp ấy ra sẽ thành tờ giấy khen được thiết kế sẵn, có tên và danh hiệu của cậu. Cậu có thể mang đi khoe với người khác! Nếu không thích kiểu trình bày, cậu còn có thể trả thêm tiền để đổi phông chữ hoặc ảnh.
Nữ: Nghe cũng vui đấy, nhưng nói cho cùng chẳng phải chỉ là trò kiếm tiền sao?
Nam: Số tiền cậu trả thật ra có ý nghĩa. Trước khi nhận giấy khen, trang web sẽ mời cậu bỏ phiếu cho một tổ chức công ích. Danh sách gồm các tổ chức công ích và từ thiện quốc tế. Khi hoạt động kết thúc, trang web sẽ thống kê tổ chức nào được nhiều phiếu nhất rồi quyên 80% số tiền huy động được cho tổ chức ấy. Vậy nên cũng có thể xem đây là một hoạt động công ích.
Nữ: Ha ha, thế thì họ cũng có lòng. Nhưng nếu tôi là người phụ trách một tổ chức công ích, tôi sẽ không muốn họ công bố kết quả.
Nam: Sao thế? Đó có thể gọi là “tổ chức công ích nổi tiếng nhất thế giới” mà!
Nữ: Nhưng nếu có một tổ chức nổi tiếng nhất, phần lớn tiền quyên góp rất dễ dồn vào đó. Những tổ chức từ thiện khác sẽ nhận được ít tiền hơn và càng khó tồn tại.""",
    22: """Nam: Darwin ở thế kỷ 19 cho rằng các loài không hoàn hảo ngay từ đầu, mà dần trở nên hoàn thiện qua cạnh tranh sinh tồn. Vì thế ông đưa ra thuyết tiến hóa “cạnh tranh sinh tồn, chọn lọc tự nhiên, kẻ thích nghi tồn tại”, đồng thời nhấn mạnh đây là cơ chế tiến hóa duy nhất.
Nữ: Chọn lọc tự nhiên là cơ chế tiến hóa duy nhất sao? Không chỉ tôi phản đối; ngay cả các nhà sinh học cùng thời cũng phần lớn hoài nghi. Chẳng hạn, chiếc đuôi rực rỡ của công thường cản nó chạy thoát khi gặp nguy hiểm. Nếu chỉ có “chọn lọc tự nhiên, kẻ thích nghi tồn tại”, sao đặc điểm gây bất lợi cho việc sinh tồn lại tiến hóa được? Vậy chọn lọc tự nhiên sao có thể là cơ chế duy nhất!
Nam: Để giải thích mâu thuẫn này và bổ sung chỗ còn thiếu của thuyết tiến hóa, Darwin còn đưa ra thuyết “chọn lọc giới tính”: cá thể cái chọn bạn đời dựa vào những đặc điểm trang trí trên cơ thể cá thể đực. Đuôi công rực rỡ là ví dụ điển hình. Nhà toán học Fisher cũng dùng mô hình toán học để ủng hộ thuyết ấy.
Nữ: Thuyết chọn lọc giới tính hoàn toàn không thuyết phục được giới học thuật. Wallace, người xây dựng học thuyết tiến hóa cùng thời Darwin, đã phản đối rất mạnh. Ngay cả ngày nay, vẫn có học giả cho rằng thuyết tiến hóa không giải thích được khía cạnh xã hội của tiến hóa, như việc chủ động chọn giới tính khi sinh con hay phá thai do con người quyết định. Những hành vi ấy chẳng liên quan gì đến chọn lọc tự nhiên.
Nam: Khoan đã, phá thai do con người chủ động quyết định ư? Kết quả của sự can thiệp có chủ ý sao có thể đem so với cơ chế tiến hóa tự nhiên? Vì vậy tôi vẫn cho rằng cơ chế tiến hóa là “cạnh tranh sinh tồn, chọn lọc tự nhiên, kẻ thích nghi tồn tại”.""",
    26: """Ngày nay, làm gì người ta cũng coi trọng hiệu quả, đặc biệt là các công ty chuyển phát nhanh: đã nhanh rồi còn phải nhanh hơn. Thế nhưng ở Bắc Kinh, Trung Quốc, một công ty lại làm ngược lại và kinh doanh dịch vụ chuyển phát chậm. Từ khi mở cửa, công ty đã nhận hơn 20.000 lá thư. Khách hàng mang những lá thư đầy tình cảm đến gửi, chỉ định một ngày phát thư, trả đủ phí rồi rời đi. Hóa ra dịch vụ chuyển phát chậm làm ăn với tương lai: người nhận có thể là chính người gửi hoặc người khác. Công ty sẽ giao thư vào đúng thời điểm người gửi đã chỉ định. Nhưng là khách hàng, có lẽ bạn phải cầu mong việc kinh doanh của công ty ngày càng tốt, để họ đừng đóng cửa trước khi đến ngày giao thư.""",
    28: """Khi đi mua sắm, người ta thường nói đi mua “đông tây”, tức mua đồ. Nhưng tại sao lại dùng hai chữ “đông” và “tây”? Cách nói ấy bắt nguồn từ đâu? Chuyện kể rằng vào đời Tống có một học giả nổi tiếng tên Chu Hi. Một hôm, trên đường ông gặp người bạn đang xách giỏ đi tới. Chu Hi hỏi: “Anh đi đâu đấy?”. Người bạn đáp: “Ra phố mua ‘đông tây’!”. Chu Hi hỏi: “Đông tây ư? Mua bằng cách nào? Giá bao nhiêu? Thế nam bắc có mua được không? Sao chỉ mua đông tây mà không mua nam bắc?”. Người bạn mỉm cười hỏi lại: “Tương ứng với Kim, Mộc, Thủy, Hỏa, Thổ, được gọi chung là ngũ hành, là những gì?”.
Chu Hi suy nghĩ rồi mỉm cười: “À, Kim, Mộc, Thủy, Hỏa, Thổ; đông, nam, tây, bắc, giữa. Phương đông thuộc Mộc, phương tây thuộc Kim. Kim và Mộc đều có thể cho vào giỏ; phương bắc thuộc Thủy, phương nam thuộc Hỏa, mà nước và lửa thì không thể đựng trong giỏ. Vì vậy chúng ta chỉ nói mua ‘đông tây’, chứ không nói mua ‘nam bắc’”.""",
    31: """Cùng với sự phát triển của công nghệ và sự phổ biến của Internet, thư điện tử, ngân hàng trực tuyến, mạng xã hội và nhắn tin tức thời đã trở thành một phần quan trọng của cuộc sống hiện đại. Từ thư từ qua lại, ảnh sinh hoạt, công việc ở công ty cho đến thông tin tài chính, phần lớn đều được lưu trong tài khoản trực tuyến của người dùng. Nhưng với những dịch vụ phải nhập mật khẩu mới đăng nhập được, nếu người dùng đột ngột qua đời, những thông tin riêng tư vốn được tài khoản bảo vệ liệu có bị lộ ra ngoài không? Người thân của người đã mất có quyền lấy những dữ liệu ấy không?
Để giải quyết những băn khoăn đó, nhiều công ty nhận quản lý tài khoản trực tuyến đã xuất hiện. Sau khi trả phí, người dùng có thể lưu các mật khẩu vào cơ sở dữ liệu của công ty quản lý. Họ cũng có thể chỉ định những người khác nhau được nhận mật khẩu của từng tài khoản, như khi phân chia tài sản. Khi người dùng qua đời, công ty sẽ xác nhận với luật sư hoặc gia đình, rồi giao dữ liệu cho “người thụ hưởng” được người dùng chỉ định lúc còn sống, hoặc đóng tài khoản theo hướng dẫn của họ.""",
    34: """Những năm gần đây, ngày càng nhiều loài động, thực vật không thể tiếp tục sinh sống vì Trái Đất nóng lên và khí hậu thay đổi. Trước vấn đề này, Parmesan đề xuất một cách mà phần lớn nhà sinh học cho là không khả thi: giúp các loài di cư hoặc chuyển chúng đến nơi khác.
Parmesan nói rằng dù cách này gây tranh cãi, nó rất có thể là cách duy nhất cứu nhiều loài đang bên bờ tuyệt chủng. Trên Trái Đất có không ít loài không thích nghi được với môi trường sau biến đổi khí hậu, nhưng cũng không thể rời nơi ở để chuyển đến vùng thích hợp. Để cứu chúng, cách hiệu quả nhất là con người giúp chúng di cư hoặc chuyển nơi sống.
Tuy nhiên, nhiều nhà sinh học cho rằng cách làm này quá ngây thơ. Mỗi vùng đều có hệ sinh thái riêng. Một khi đưa loài mới từ nơi khác đến, môi trường địa phương có thể thay đổi rất mạnh và mất cân bằng. Ta có thể chuyển một loài động vật sắp tuyệt chủng đến môi trường thích hợp, nhưng nếu ở đó nó không có thiên địch, nó có thể sinh sản nhanh không ngừng, ăn nhiều loài động, thực vật bản địa và khiến các loài khác tuyệt chủng.
Đồng thời, một số học giả chỉ ra rằng cách Parmesan đề xuất tốn rất nhiều tiền. Cuối cùng, người ta chắc chắn sẽ ưu tiên những loài có lợi ích kinh tế. Nói cách khác, vẫn dùng giá trị của con người để quyết định cứu loài nào trước; không thể chăm lo cho mọi loài đang bên bờ tuyệt chủng, cũng không thể cải thiện vấn đề một cách hiệu quả.""",
    38: """Nghiên cứu của các nhà khoa học Ý cho thấy: nếu tế bào não của một sinh vật được cấy sang sinh vật khác, chúng có thể sống cho đến khi sinh vật nhận tế bào già và chết. Vì vậy, các nhà nghiên cứu cho rằng tế bào thần kinh não không có tuổi thọ cố định. Kết quả này rất có ý nghĩa đối với việc cấy ghép tế bào thần kinh ở người và việc ứng dụng vào điều trị bệnh Alzheimer hoặc Parkinson.
Các nhà nghiên cứu dùng chuột để làm thí nghiệm. Chuột nhà nhỏ sống trung bình chỉ 18 tháng, còn chuột nhà lớn thường sống lâu gấp đôi. Trước tiên, họ lấy tế bào não của chuột nhỏ, rồi cấy vào não của 60 bào thai chuột lớn. Sau đó họ để những con chuột lớn trưởng thành. Khi chúng già yếu, sắp chết và được dự đoán chỉ còn sống chưa đến hai ngày, họ lại quan sát não của chúng.
Họ phát hiện những con chuột lớn trong thí nghiệm phát triển hoàn toàn bình thường và đến lúc già cũng không có vấn đề thần kinh nào. Tuy có nhiều tế bào não hơn, chúng không thông minh hơn. Ngoài ra, sau khi chuột lớn chết, tế bào thần kinh não lấy từ chuột nhỏ vẫn còn sống. Vì vậy, các nhà khoa học suy đoán rằng nếu cấy tế bào não vào một sinh vật sống lâu hơn nữa, tuổi thọ của tế bào não chuột nhỏ cũng sẽ kéo dài theo.""",
    42: """Một tổ chức nghiên cứu phi chính phủ ở châu Âu công bố báo cáo “Giao dịch đất nông nghiệp xuyên quốc gia ở Nam bán cầu”. Báo cáo đặt câu hỏi: các nhà đầu tư từ nước phát triển hoặc tại địa phương có nên mua đất nông nghiệp của các nước đang phát triển không?
Nhà đầu tư nước ngoài nói họ mua đất bỏ hoang; vì thế khi khai khẩn và bắt đầu sản xuất, sản lượng lương thực toàn cầu sẽ tăng theo. Dù họ tuyên bố mọi giao dịch đều công khai, minh bạch, người ta vẫn đặt câu hỏi: trước sức ép nghèo khó và sức hút của tiền mặt, cái giá của việc bán đất là gì? Tại sao chúng ta không cho người nghèo bán thận cho người trả giá cao nhất, nhưng lại cho họ bán đất nông nghiệp vốn là nguồn sống của mình? Hơn nữa, lương thực được trồng trên các vùng đất ấy hoàn toàn không dành cho dân địa phương mà chỉ để xuất khẩu!
Dù đã có nhiều vụ xâm phạm quyền lợi liên quan đến mua bán đất nông nghiệp, đến nay nạn nhân vẫn không biết kêu ở đâu. Năm 2001, một tập đoàn cà phê đã cưỡng ép dân ở một số làng Uganda rời đi để lập đồn điền cà phê quy mô lớn. Tới giờ, những người bị đuổi không những chưa được bồi thường mà còn sống trong cảnh vô cùng nghèo khó.
Cả Uganda lẫn nước nơi tập đoàn này đặt trụ sở đều được bảo vệ theo công ước quốc tế. Năm ấy, nước của tập đoàn thậm chí còn là một trong những bên thúc đẩy công ước. Nhìn vào đó, liệu ta có thể trông đợi chủ đất địa phương nhận được khoản bồi thường tốt hơn từ các nhà đầu tư này không?""",
    46: """Lễ cúng linh hồn người lùn là lễ hội quan trọng nhất của người Saisiyat. Lễ được tổ chức khoảng tháng mười âm lịch; người Saisiyat gọi là “Pas-ta-ai”. Truyền thuyết kể rằng từ rất lâu trước đây, có một nhóm người lùn sống trong núi. Họ chỉ cao khoảng ba thước nhưng rất khỏe tay và giỏi phép thuật, nên người Saisiyat rất sợ họ.
Tuy vậy, vì người lùn hát hay múa giỏi, năm nào đến lễ mừng mùa được mùa, người Saisiyat cũng mời họ cùng hát múa. Nhưng người lùn lại lợi dụng dịp ấy để xâm hại phụ nữ Saisiyat. Sau lễ hội, dân làng mới phát hiện nhiều phụ nữ trong tộc đã mang thai, nên họ ngày càng căm giận người lùn. Một năm nọ, khi người lùn lại quấy rối phụ nữ trong lễ hội và bị bắt gặp, người Saisiyat quyết định dạy họ một bài học. Họ bí mật mai phục trên đường người lùn trở về, đặt bẫy khiến từng người rơi xuống vực sâu mà chết. Người lùn thương vong rất nhiều, chỉ hai người may mắn sống sót.
Hai người này biết chính mình đã gây ra chuyện, nên quyết định rời đi. Trước khi đi, họ dạy lại bài hát và điệu múa của lễ hội cho người Saisiyat. Tuy đã loại bỏ được điều khiến mình lo sợ, người Saisiyat vẫn thấy bất an, nên bắt đầu làm lễ cúng người lùn để xoa dịu linh hồn họ và mong hóa giải thù hận giữa hai bên.
Từ đó, vào đêm trăng tròn khi vụ thu hoạch mùa thu đã xong và bước sang mùa tích trữ, người Saisiyat lại hát múa liên tục, mời linh hồn người lùn trở về vui cùng mình, đồng thời qua tiếng hát cầu xin họ tha thứ và ban phúc.""",
}

LISTENING_DETAILS = r"""
1|Người phụ nữ định làm gì?|chuyển nhà ngay / không trả tiền thuê / tiếp tục ở lại / tìm người ở ghép|我最近手頭很緊，只好作罷|Cô muốn tìm nhà khác nhưng thiếu tiền cọc và tiền thuê nên đành bỏ ý định chuyển.
2|Người đàn ông định làm gì?|không cần tiền cọc nữa / ở thêm một ngày rồi chuyển / đòi tiền cọc nhưng không chuyển / nhận lại tiền cọc rồi mới chuyển|房東一天不退押金給我，我就一天不搬家|Anh nói rõ sẽ không chuyển cho đến khi chủ nhà hoàn cọc; D khớp điều kiện này.
3|Con trai nhà văn Oe ra sao?|vượt qua trở ngại bẩm sinh / chuyên viết nhạc cho trẻ khuyết tật / viết văn hơn cả cha / phổ nhạc tác phẩm của cha|並沒有因此自暴自棄，憑著獨特的音樂天分|Dù gặp trở ngại về ngôn ngữ, anh vẫn phát triển tài năng âm nhạc và ra album.
4|Trong bài diễn thuyết, nhà văn nói sách của mình thế nào?|khiến người ta buồn ngủ / giúp sáng tác nhạc / khiến người ta quên ngủ / giới thiệu nhạc con trai|還是睡不著，那就來看看我寫的書吧|Ông nói đùa rằng nếu nhạc ru ngủ chưa hiệu quả thì đọc sách của ông, ngụ ý sách dễ làm người ta buồn ngủ.
5|Dịch vụ mới có ưu điểm gì?|giảm viện phí / giữ kín thông tin riêng của người bệnh / chọn bác sĩ / đặt lịch trước|不希望別人知道我生什麼病、看哪科醫生|Thiết bị thay việc gọi tên công khai, giúp người bệnh tránh lộ chuyện khám bệnh.
6|Dịch vụ cải thiện tình trạng nào?|khó lấy số khám / phòng chờ quá đông / không tìm thấy phòng khám / lo lắng khi chờ|可以到醫院附近走走，不用老是等在那兒|Người bệnh có thể rời phòng chờ trong lúc đợi, giảm cảnh tập trung quá đông.
7|Điều nào đúng về dịch vụ này?|có ở mọi khoa / chủ yếu cho người già / dùng xong bỏ đi / tính đến nhu cầu của người khiếm thị, khiếm thính|視障或聽障的病患都可以使用|Máy có nhiều kiểu báo hiệu, phục vụ cả người có khó khăn về thị giác hoặc thính giác.
8|Điều nào đúng về chính sách ở trại giam?|đồ ăn ít được chuộng / đa số trại làm đồ thủ công / có tính đến người thụ án dài / chỉ người từng làm ẩm thực mới tham gia|很適合刑期較長的犯人|Đồ thủ công cần huấn luyện lâu nên phù hợp với người có thời gian thụ án dài.
9|Số liệu người phụ nữ đưa ra cho thấy điều gì?|số người vào tù không đổi / người có nghề ít vào tù / hàng hóa trại giam được ưa chuộng / tỷ lệ tái phạm gần như không đổi|再度犯罪的比例還是跟過去不相上下|“Không khác trước bao nhiêu” chỉ tỷ lệ tái phạm chưa giảm đáng kể.
10|Nguyên nhân chính khiến người ra tù tái phạm là gì?|kinh tế suy thoái / xã hội khó chấp nhận họ / thiếu kỹ năng mưu sinh / không được trợ cấp|社會大眾對坐過牢的人有一定的疑慮|Họ khó xin việc vì thành kiến xã hội, rồi chịu áp lực mưu sinh và tái phạm.
11|Vì sao nghiên cứu của giáo sư Lâm được chú ý?|giải thích bí mật hình thành trầm hương / ngăn sâu hại trầm hương / tìm cách tăng sản lượng trầm hương / chứng minh trầm hương trồng nhân tạo được|提高沉香產量上，有著非常驚人的發現|Phát hiện đáng chú ý liên quan trực tiếp đến tăng sản lượng trầm hương.
12|Qua câu hỏi, trưởng khu nhìn nhận nghiên cứu ra sao?|nghi ngờ kết quả / thán phục phát hiện / công nhận phương pháp / nghi ngờ động cơ|這實在太…太驚人了|Ông liên tục bày tỏ sự ngạc nhiên và đánh giá cao phát hiện trong thời gian ngắn.
13|Giáo sư Lâm đáp lại điều gì?|nghiên cứu thực tế kéo dài hơn một năm / cần làm thêm thí nghiệm / cần trưởng khu giúp / sẽ theo dõi lâu dài|應該算是我這十幾年來的努力吧|Bà giải thích kết quả năm nay dựa trên hơn mười năm nghiên cứu trước đó.
14|Hiệu sách trực tuyến từng dùng chiến lược gì?|mua một cuốn được miễn phí vận chuyển / gộp phí vận chuyển vào giá sách / phí vận chuyển tăng theo giá trị đơn / mua đạt mức nhất định được phí vận chuyển thấp|只要你的訂單金額達到|Trước đây đơn đạt một ngưỡng sẽ được phí vận chuyển thấp, chưa phải miễn phí.
15|Hiệu sách đổi chiến lược ra sao?|miễn phí vô điều kiện / thành viên được miễn phí / nâng ngưỡng đơn hàng để được miễn phí / mua sách chỉ định được miễn phí|提高門檻，改成購物滿兩千塊就可以免運費|Cửa hàng nâng số tiền cần mua rồi mới miễn phí giao hàng.
16|Nước ngọt và đồ ăn vặt được nhắc đến có đặc điểm gì?|đều tặng quà / đều miễn phí / giảm chi phí sản xuất / khiến khách tưởng dùng không có gánh nặng|「零熱量」汽水、「零卡路里」餅乾|Nhãn “không calo” tạo cảm giác không gây hại, khiến người đang giảm cân dùng nhiều hơn.
17|Người đàn ông nghĩ sao về đồ tặng hoặc dịch vụ miễn phí?|chưa chắc đã lời / luôn có lợi cho người mua / chắc chắn kém chất lượng / chưa chắc được thích|為了這個免費的權利付出更多|“Miễn phí” có điều kiện có thể khiến khách tốn nhiều tiền hơn lợi ích nhận được.
18|Trang web cho người dùng làm gì?|đùa vui cho thư giãn / bầu người nổi tiếng nhất / gặp người thành đạt / tự giới thiệu trên mạng|要什麼名號隨你選|Người dùng tự chọn danh hiệu vui để nhận giấy chứng nhận, chủ yếu là một trò giải trí.
19|Điều nào đúng về tệp giấy chứng nhận?|có giá trị pháp lý / đổi kiểu miễn phí / có thể đăng ký bất kỳ lúc nào trong một năm / chỉ tổ chức từ thiện được đăng ký|在這一年內，你可以隨時上網去登記|Trang web cho đăng ký suốt một năm; đổi phông hoặc ảnh lại phải trả thêm.
20|Trang web dùng tiền thu được thế nào?|chia đều cho các tổ chức / trao cho tổ chức được nhiều phiếu nhất / lập tổ chức quốc tế / mời người nổi tiếng gây quỹ|將募得款項的80%，都捐給這家機構|80% khoản thu được tặng tổ chức có nhiều phiếu bầu nhất.
21|Vì sao người phụ nữ không muốn công bố kết quả bầu chọn?|sợ trang web chiếm tiền / sợ tiền quyên góp phân bố không đều / không muốn trang web nổi tiếng / sợ mất mặt|大部分的捐款都集中到那一家|Cô lo một tổ chức hút gần hết đóng góp, làm các tổ chức khác khó tồn tại.
22|Hai người tranh luận vấn đề gì?|sinh sản có liên quan tiến hóa không / tiến hóa nhằm thích nghi môi trường không / mọi loài chỉ có một cơ chế tiến hóa không / tiến hóa có cần can thiệp của con người không|物競天擇是演化的唯一機制？|Trọng tâm tranh luận là chọn lọc tự nhiên có phải cơ chế duy nhất của tiến hóa hay không.
23|Theo người phụ nữ, giới sinh học thời đó nhìn thuyết tiến hóa thế nào?|tin hoàn toàn / có thái độ chất vấn / khinh thường / đồng loạt khen|多抱持著質疑的態度|Cụm này nghĩa là phần lớn vẫn hoài nghi, chứ không hoàn toàn tin hay bác bỏ.
24|Theo người phụ nữ, giới học giả thời đó phản ứng thế nào với chọn lọc giới tính?|phản đối mạnh hơn / chứng minh thiếu sót bằng mô hình toán / cho rằng đã bù chỗ thiếu của tiến hóa / cho rằng giải thích tiến hóa xã hội|華萊士就強烈反對「性擇」學說|Bà dẫn Wallace là người phản đối mạnh thuyết chọn lọc giới tính.
25|Cuộc tranh luận có kết quả gì?|cô gái chưa thuyết phục được đối phương / cô khiến người kia bó tay / cô phản bác hiệu quả / cô khiến người kia câm lặng|所以，我認為演化的機制就是「物競天擇，適者生存」|Cuối đối thoại, người đàn ông vẫn giữ quan điểm cũ, nên hai bên chưa thuyết phục được nhau.
26|Điểm đặc biệt của công ty là gì?|gửi rất nhanh / gửi miễn phí / chỉ gửi thư cho chính mình / chọn thời gian giao thư linh hoạt|寄件人指定的時間，將信件送達|Người gửi chọn ngày giao trong tương lai; người nhận có thể là bất kỳ ai.
27|Người đưa tin nói khách cần lo điều gì?|thư bị thất lạc / thư không tới ngay / công ty quá đông khách nên chậm / tới ngày hẹn công ty không còn gửi thư|不要在寄送時間到之前就倒閉了|Nếu công ty đóng cửa trước ngày hẹn, thư sẽ không được chuyển đi.
28|Ban đầu Chu Hi phản ứng thế nào khi nghe “mua đông tây”?|bối rối / dẫn nhiều ví dụ / đã hiểu rõ / luống cuống|為什麼只買東西，不買南北？|Ông đặt hàng loạt câu hỏi vì chưa hiểu cách gọi này.
29|Người bạn giải đáp theo góc độ nào?|nguồn gốc hàng hóa / thuộc tính của phương hướng / chất liệu cái giỏ / vị trí khu chợ|與金木水火土相配|Ông bạn gợi ngũ hành tương ứng với các phương hướng, không bàn hàng hay chợ.
30|Theo lời Chu Hi, “đông” và “tây” ứng với gì?|Kim và Hỏa / Mộc và Thủy / Mộc và Kim / Thủy và Hỏa|東方呢，屬木頭的木，西方則屬金子的金|Phương đông ứng Mộc, phương tây ứng Kim; lựa chọn C đúng thứ tự.
31|Vì sao người ta cần dịch vụ này?|không diệt được vi rút mạng / không biết khi nào sẽ qua đời / không hiểu rủi ro đầu tư mạng / sợ tài khoản bị lấy cắp|一旦使用者突然死亡|Dịch vụ dự phòng việc người dùng qua đời bất ngờ, để tài khoản và dữ liệu có người xử lý.
32|Trọng tâm của dịch vụ là gì?|sao lưu máy tính / xóa tài khoản ít dùng / chia sẻ dữ liệu bất kỳ lúc nào / xử lý tài khoản như tài sản để lại|像分配財產一樣，指定不同的人繼承不同帳號的密碼|Người dùng chỉ định người thừa hưởng mật khẩu, tương tự phân chia di sản.
33|Điều nào đúng khi dùng dịch vụ?|miễn phí / chống vi rút / chỉ giao mật khẩu cho một người / có thể nhờ công ty đóng tài khoản|或是依指示關閉帳號|Ngoài bàn giao dữ liệu, công ty có thể đóng tài khoản theo chỉ dẫn đã để lại.
34|Parmesan đề xuất cách nào để cứu động, thực vật?|lập khu bảo tồn / giảm nóng lên toàn cầu / giúp chúng di cư / cải thiện môi trường địa phương|幫助生物遷徙或是移植|Bà đề nghị con người giúp loài không tự chuyển được tới nơi có khí hậu phù hợp.
35|Vì sao Parmesan chọn cách này?|cho rằng hiệu quả nhất / rất tiết kiệm / chăm lo được đa số loài / ít hại sinh giới nhất|最有效率的方法就是由人類幫忙遷徙或移植|Bà coi di dời là cách hiệu quả nhất để cứu những loài không thể tự rời nơi sống cũ.
36|Vì sao nhiều nhà sinh học phản đối?|có thể phá vỡ cân bằng sinh thái / làm đổi khí hậu / khiến người săn bắt, chặt phá / không cải thiện môi trường|破壞平衡|Loài mới đưa vào có thể sinh sôi, săn loài bản địa và làm hệ sinh thái mất cân bằng.
37|Theo học giả, phương pháp này có thể ưu tiên loài nào?|loài tự di cư / loài ít lợi ích kinh tế / loài chưa nguy cấp / loài được con người coi là có giá trị|優先考慮具有經濟效益的物種|Chi phí lớn khiến việc lựa chọn cứu loài chịu ảnh hưởng của giá trị kinh tế do con người đặt ra.
38|Phát hiện chính về tế bào não là gì?|kích thước tế bào không liên quan trí thông minh / tế bào phát triển hoàn chỉnh từ lúc sinh / thay thế nhanh hơn tế bào khác / có thể sống lâu hơn cơ thể gốc|小家鼠的腦神經依然活著|Sau khi chuột nhận chết, tế bào não từ chuột cho vẫn sống; tuổi thọ tế bào không bị giới hạn bởi vật chủ ban đầu.
39|Kết quả nghiên cứu có ý nghĩa với lĩnh vực nào?|điều trị thần kinh não / chẩn đoán tuổi não / chữa đột quỵ / đo chức năng não|阿茲海默症或帕金森氏症的治療|Bài nhắc khả năng ứng dụng ghép tế bào để chữa bệnh thần kinh như Alzheimer và Parkinson.
40|Nhà nghiên cứu thí nghiệm ra sao?|nuôi tế bào rồi cấy vào chuột nhỏ / cấy tế bào chuột nhỏ vào chuột lớn non / cấy tế bào chuột lớn trưởng thành vào chuột nhỏ / cấy tế bào vào chuột nhỏ sắp chết|取出小家鼠的腦細胞，然後植入60 隻大家鼠胎兒的腦部裡|Nguồn tế bào là chuột sống ngắn, vật nhận là bào thai chuột sống lâu hơn.
41|Điều nào đúng về chuột trong nghiên cứu?|thần kinh chuột lớn teo dần / chuột nhỏ sống lâu hơn / chuột lớn không có di chứng sau thí nghiệm / hai loài có số tế bào não bằng nhau|完全正常地成長，而且年老時沒有產生任何的腦神經問題|Chuột được cấy phát triển bình thường và về già không xuất hiện vấn đề thần kinh.
42|Báo cáo đặt ra vấn đề gì?|tranh chấp thương mại xuyên quốc gia / tính hợp lý của mua bán đất nông nghiệp xuyên quốc gia / bảo vệ quyền của nhà đầu tư / mua bán đất có tăng sản lượng không|應該購買開發中國家的農地嗎？|Câu hỏi trung tâm là có nên mua đất nông nghiệp của nước đang phát triển hay không.
43|Nhà đầu tư đánh giá việc mua đất thế nào?|khẳng định sẽ tăng lương thực toàn cầu / giúp nước bán đất hết đói / nâng đời sống dân địa phương / giải quyết thiếu lương thực địa phương|全球糧食產量也會跟著提高|Đó là lập luận của nhà đầu tư; bài sau đó chất vấn tác động thực tế đến dân địa phương.
44|Người đưa tin nhìn nhận vấn đề ra sao?|nên mở bán đất nước nghèo / hiểu mong muốn thoát nghèo / có nhiều chuyện bên mạnh chèn ép bên yếu / khai hoang chắc chắn hại môi trường|受害者到現在仍是投訴無門|Ví dụ dân Uganda bị đuổi, không được đền bù cho thấy bất bình đẳng và xâm phạm quyền lợi.
45|Nếu xảy ra tranh chấp, nước sở hữu đất có thể làm gì?|chủ động dừng đầu tư / chỉ chịu lỗ / nhờ dư luận quốc tế trước / khó tự bảo vệ quyền lợi|受害者到現在仍是投訴無門|Bài nói nạn nhân thiếu kênh khiếu nại và khó nhận bồi thường, nên khả năng tự bảo vệ quyền lợi rất hạn chế.
46|Vì sao người Saisiyat sợ người lùn?|người lùn nóng nảy / giỏi phép thuật / giỏi chiến đấu / rất đoàn kết|擅長法術，所以賽夏人很怕他們|Nguồn nỗi sợ được nói thẳng: người lùn khỏe và giỏi phép thuật.
47|Người Saisiyat trả thù bằng cách nào?|cướp đất / đặt bẫy giết người lùn / làm phụ nữ người lùn mang thai / dùng phép khiến họ sợ|設下陷阱，讓矮人們一個一個跌落深淵|Họ phục kích trên đường về và đặt bẫy khiến nhiều người lùn rơi xuống vực.
48|Người lùn phản ứng thế nào sau vụ tấn công?|trả đũa / im lặng chịu đựng / rời đi xa / van xin|便決定離開|Hai người sống sót nhận lỗi rồi rời khỏi nơi ấy.
49|Vì sao người Saisiyat tổ chức lễ?|mừng chiến thắng / cầu xin người lùn tha thứ / tưởng niệm chiến binh chết / dâng phụ nữ cho người lùn|希望化解彼此的仇恨|Họ làm lễ để xoa dịu linh hồn người lùn, hóa giải thù hận và xin tha thứ.
50|Lễ được tổ chức khi nào?|sau gieo cấy mùa xuân / sau trồng trọt mùa hè / sau thu hoạch mùa thu / sau mùa cất trữ mùa đông|秋收冬藏之際|Cụm này chỉ thời điểm sau thu hoạch mùa thu, trước hoặc vào giai đoạn cất trữ mùa đông.
"""


def parse_rows(source):
    result = {}
    for line in source.strip().splitlines():
        number, question, options, evidence, explanation = line.split("|", 4)
        choices = [choice.strip() for choice in options.split(" / ")]
        if len(choices) != 4:
            raise ValueError(f"Expected four Vietnamese options for {number}")
        result[int(number)] = dict(questionVietnamese=question, optionVietnamese=choices,
                                   evidenceTraditional=evidence, explanation=explanation)
    return result


def normalize(source):
    return re.sub(r"\s+", "", source)


def aligned_evidence(traditional, simplified, phrase):
    source = normalize(traditional)
    target = normalize(simplified)
    offset = source.find(normalize(phrase))
    if offset < 0:
        raise ValueError(f"Evidence missing from source: {phrase}")
    if len(source) != len(target):
        raise ValueError("Script variants are not position-aligned; review this evidence manually")
    target_positions = [index for index, character in enumerate(simplified) if not character.isspace()]
    start = target_positions[offset]
    end = target_positions[offset + len(normalize(phrase)) - 1] + 1
    return simplified[start:end]


def dialogue_text(source):
    lines = source.splitlines()
    first = next((index for index, line in enumerate(lines) if line.startswith(("男：", "女："))), None)
    if first is not None:
        lines = lines[first:]
    else:
        marker = next((index for index, line in enumerate(lines) if line.startswith(("現在請聽", "现在请听"))), None)
        if marker is not None:
            lines = lines[marker + 1:]
        else:
            first = next((index for index, line in enumerate(lines) if line.startswith(("這年頭", "这年头"))), 0)
            lines = lines[first:]
    lines = [line for line in lines if not re.match(r"^\d{1,2}\.\s", line)]
    text = "".join(line.strip() for line in lines)
    return re.sub(r"(?<!^)(?=[男女]：)", "\n", text).strip()


def main():
    package = json.loads(PACKAGE.read_text(encoding="utf-8"))
    transcript_data = json.loads(TRANSCRIPTS.read_text(encoding="utf-8"))
    reading_details = parse_rows(READING_DETAILS)
    listening_details = parse_rows(LISTENING_DETAILS)
    if set(reading_details) != set(range(1, 51)) or set(listening_details) != set(range(1, 51)):
        raise ValueError("Teaching notes must cover all 50 questions in each skill")
    groups = {number: group for group in transcript_data["groups"] for number in group["questions"]}
    result = {"testId": "band-c-test-01", "listening": {}, "reading": {}}
    for item in package["components"]["listening"]["questions"]:
        number = item["number"]
        group = groups[number]
        detail = listening_details[number]
        questions = re.findall(r"(?m)^(\d{1,2})\.\s*(.+)$", group["traditional"])
        question_traditional = next((text for n, text in questions if int(n) == number), None)
        questions_s = re.findall(r"(?m)^(\d{1,2})\.\s*(.+)$", group["simplified"])
        question_simplified = next((text for n, text in questions_s if int(n) == number), None)
        if not question_traditional or not question_simplified:
            raise ValueError(f"Missing spoken question {number}")
        evidence = detail["evidenceTraditional"]
        translated_evidence = aligned_evidence(dialogue_text(group["traditional"]), dialogue_text(group["simplified"]), evidence)
        for script, phrase in (("traditional", evidence), ("simplified", translated_evidence)):
            if normalize(phrase) not in normalize(dialogue_text(group[script])):
                raise ValueError(f"Evidence not in transcript body: Listening {number} {script}")
        result["listening"][item["id"]] = {
            "number": number, "correctAnswer": item["correctAnswer"], "groupId": group["id"],
            "questionChinese": {"traditional": question_traditional, "simplified": question_simplified},
            "questionVietnamese": detail["questionVietnamese"],
            "optionVietnamese": detail["optionVietnamese"],
            "transcriptVietnamese": LISTENING_PASSAGES[group["questions"][0]],
            "evidence": {"traditional": evidence, "simplified": translated_evidence},
            "explanation": detail["explanation"],
        }
    for item in package["components"]["reading"]["questions"]:
        number = item["number"]
        detail = reading_details[number]
        group = item["stimulusGroupId"]
        context = package["components"]["reading"]["displayContexts"][group]
        evidence = detail["evidenceTraditional"]
        translated_evidence = aligned_evidence(context["traditional"], context["simplified"], evidence)
        result["reading"][item["id"]] = {
            "number": number, "correctAnswer": item["correctAnswer"], "groupId": group,
            "passageVietnamese": READING_PASSAGES[next(start for start, end in [(1, 5), (6, 10), (11, 15), (16, 17), (18, 20), (21, 23), (24, 27), (28, 31), (32, 35), (36, 39), (40, 44), (45, 50)] if start <= number <= end)],
            "questionVietnamese": detail["questionVietnamese"],
            "optionVietnamese": detail["optionVietnamese"],
            "evidence": {"traditional": evidence, "simplified": translated_evidence},
            "explanation": detail["explanation"],
        }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Verified {len(result['listening'])} Listening and {len(result['reading'])} Reading teaching notes")


if __name__ == "__main__":
    main()
