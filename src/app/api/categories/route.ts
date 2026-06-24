import { success, fail } from "@/lib/api/api-response";
import { fetchCategories } from "@/lib/api/categories";

// GET /api/categories - 활성 카테고리 목록 (display_order 정렬)
// 응답: { success, message, data: CategoryRow[] }
export async function GET() {
  try {
    const categories = await fetchCategories();
    return success(categories);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "카테고리 조회 실패", 500);
  }
}
