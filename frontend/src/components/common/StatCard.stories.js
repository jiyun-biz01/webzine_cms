import StatCard from "./StatCard";

export default {
  title: "Common/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["primary", "success", "warning", "info", "danger"] },
  },
};

export const Primary   = { args: { label: "전체 기사",    value: "128", delta: "+2 이번 주", color: "primary" } };
export const Success   = { args: { label: "발행됨",       value: "94",  delta: "+1 이번 주", color: "success" } };
export const Warning   = { args: { label: "임시저장",     value: "21",  delta: null,         color: "warning" } };
export const Info      = { args: { label: "현재 호수",    value: "7호", delta: "준비 중",    color: "info"    } };
export const NoDelta   = { args: { label: "보관함",       value: "13",  delta: null,         color: "primary" } };
