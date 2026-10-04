# Từ vựng theo Band TOCFL

`tocfl-imported.json` chứa catalog và 7.517 mục từ từ `source/tocfl-vocabulary-by-band-20240923.zip`. Giao diện Band lấy Band, cấp và số lượng từ từ catalog/dữ liệu; hai lộ trình ngữ cảnh và giáo trình dùng nguồn riêng.

Chạy `pnpm import:vocabulary` để xác thực và nhập lại ZIP mặc định, hoặc `pnpm import:vocabulary -- /đường/dẫn/tệp.zip` để dùng tệp khác. Script kiểm tra checksum, ID duy nhất, Band/cấp, thứ tự và số lượng trước khi cập nhật. Nhập lại cùng `datasetId` thay bản ghi cũ theo ID; tiến độ người học lưu ở trình duyệt và không bị xóa.

Nguồn TOCFL không có nghĩa tiếng Việt hoặc ví dụ. `tocfl-imported.json` luôn được giữ nguyên. Phần biên soạn bổ sung nằm riêng trong `tocfl-enrichment.json` và được ghép vào bản ghi theo ID khi trả về API. Câu ví dụ có hai trường Phồn thể/Giản thể; nghĩa và bản dịch câu dùng chung.

**Tiến độ biên tập:** đã xuất bản đủ 394 mục Band Novice, 832 mục Band A và 3.515 mục Band B, tổng cộng 4.741 mục. Band C vẫn chỉ hiển thị danh sách gốc. Band B dùng câu ví dụ ngắn theo cấp 3/4; các nhóm dễ sai nghĩa hoặc từ loại được sửa thủ công. Dữ liệu có hỗ trợ dịch máy và chưa được biên tập viên kiểm chứng riêng từng mục. `tocfl-enrichment-reviewed.json` là danh sách ID được phép xuất bản, còn `tocfl-enrichment-overrides.json` lưu chỉnh sửa biên tập. Chạy `scripts/validate_tocfl_enrichment.py --reviewed-file data/vocabulary/tocfl-enrichment-reviewed.json` bằng môi trường có `opencc-python-reimplemented` để kiểm tra độ phủ, một câu ví dụ, hai kiểu chữ và sự tách biệt với dữ liệu gốc.

Nghĩa được biên soạn có tham khảo [CC-CEDICT](https://cc-cedict.org/) (CC BY-SA 4.0). Một số ví dụ Band A và Band B được chọn từ [Tatoeba](https://tatoeba.org/) (CC BY 2.0 FR), có ghi tác giả và liên kết câu nguồn trong giao diện. Bản dịch Band B được tạo cục bộ với [HachimiMT-60-zh-vi](https://huggingface.co/ngocdang83/HachimiMT-60-zh-vi), sau đó biên tập thêm và sửa lỗi phát hiện trong quá trình kiểm tra. Xem [giấy phép phần bổ sung](./ENRICHMENT_LICENSE.md). Dữ liệu TOCFL gốc giữ nguyên quyền và xuất xứ riêng.
