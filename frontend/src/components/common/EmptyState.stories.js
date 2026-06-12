import EmptyState from "./EmptyState";

export default {
  title: "Common/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export const Default = { args: { message: "검색 결과가 없습니다." } };
export const Error   = { args: { icon: "⚠", message: "데이터를 불러오지 못했습니다." } };
export const Empty   = { args: { icon: "📭", message: "기사가 없습니다." } };
