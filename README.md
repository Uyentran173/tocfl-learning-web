# Nền tảng học tiếng Hoa và luyện đề TOCFL

Website Next.js dành cho người học tiếng Hoa, gồm học từ vựng, luyện đề và hướng dẫn kỳ thi.

## Chạy trên máy

Cài Node.js 20.9 trở lên và pnpm, rồi chạy `pnpm install` và `pnpm dev`. Mở `http://localhost:3000`; thư viện đề ở `/tocfl`.

## Đề luyện tập

Thư viện hiện có một đề **TOCFL Band Novice — Đề 01** gồm 25 câu Nghe và 25 câu Đọc. Hai bản chữ dùng chung đáp án, âm thanh và bảng điểm của từng phần. Luyện tập có 60 phút riêng cho Nghe và Đọc. Mô phỏng dùng âm thanh để điều khiển phần Nghe, rồi bắt đầu đếm ngược 60 phút khi vào phần Đọc.

Dữ liệu đề nằm trong `data/structured-tests/novice-reading-2018-11.json`; ảnh và âm thanh từng câu nằm trong `public/tests/novice-reading-2018-11/`. Để nhập lại gói đầy đủ, chạy `python3 scripts/import_mock_zip.py /đường/dẫn/tocfl-novice-mock-201811.zip`. Script xác thực toàn bộ ảnh, âm thanh, mã câu và đáp án trước khi thay dữ liệu của cùng một đề. Gói chưa có transcript hoặc bản dịch tiếng Việt, nên giao diện chỉ hiển thị nội dung được cung cấp.

Điểm quy đổi được lấy từ bảng trong gói ZIP. Bảng không có mức dành cho 0 câu đúng, nên kết quả đó chỉ hiển thị số câu đúng, không tự tạo điểm quy đổi.

## Từ vựng

Hai lộ trình ngữ cảnh và giáo trình nằm trong `lib/vocabulary.ts`. Lộ trình Band TOCFL đọc 7.517 mục từ đã nhập từ `data/vocabulary/tocfl-imported.json`; tệp ZIP gốc được giữ trong `data/vocabulary/source/`. Chạy `pnpm import:vocabulary` để xác thực và nhập lại cùng bộ dữ liệu theo ID, không tạo bản sao. Tiến độ học lưu trên thiết bị theo ID mục từ.

Logo và tên website được cấu hình tại `lib/site.ts`. Hình gấu gốc do người dùng cung cấp nằm trong `public/stickers/`.

## Kiểm tra

Chạy `pnpm typecheck`, `pnpm lint`, `pnpm test:timing`, `pnpm test:transcripts`, `pnpm test:logical` và `pnpm build`.
