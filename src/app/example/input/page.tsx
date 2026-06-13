import { Input } from '@/components/Input';

export default function TestPage() {
  return (
    <div className="space-y-4 p-6">
      <Input
        label="이메일"
        placeholder="이메일을 입력하세요."
      />

      <Input
        label="비밀번호"
        error="비밀번호가 올바르지 않습니다."
      />

      <Input
        disabled
        placeholder="비활성화 상태"
      />
    </div>
  );
}