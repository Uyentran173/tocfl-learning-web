import { ExploreFaq } from "@/components/ExploreExperience";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Câu hỏi thường gặp", "Giải đáp cách bắt đầu học, dùng Academy, chọn Phồn thể hoặc Giản thể, luyện đề TOCFL và lưu tiến độ trên Tai Wén.", "/explore/faq");
export default function Page() { return <ExploreFaq />; }
