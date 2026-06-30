import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "@/components/Avatar";

// 프로필 이미지가 없을 때 seed(이메일 등) 첫 글자로 아바타를 대체합니다.
// 이 규칙이 깨지면 빈 동그라미만 뜨므로 테스트로 지켜 둡니다.
describe("Avatar", () => {
  it("seed의 첫 글자를 대문자로 보여준다", () => {
    render(<Avatar seed="yeonsoo@example.com" />);
    expect(screen.getByText("Y")).toBeInTheDocument();
  });

  it("앞뒤 공백은 무시하고 첫 글자를 쓴다", () => {
    render(<Avatar seed="  kim" />);
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("빈 문자열이면 '?'로 대체한다", () => {
    render(<Avatar seed="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
