import AdminSidebar from "@/components/sidebar/AdminSidebar";
import MyPageSidebar from "@/components/sidebar/MyPageSidebar";
import SellerSidebar from "@/components/sidebar/SellerSidebar";

export default function Home() {
  return (
    // 세 개 가로로 나란히 놓고 한눈에 비교하기
    <div className="flex gap-6 bg-gray-100 p-8" style={{ height: "100vh" }}>
      <AdminSidebar />
      <MyPageSidebar />
      <SellerSidebar name="판매자명" email="seller@tiki.com" eventCount={8} />
    </div>
  );
}