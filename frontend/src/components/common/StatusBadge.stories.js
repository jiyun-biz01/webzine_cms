import StatusBadge from "./StatusBadge";

export default {
  title: "Common/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "select", options: ["published", "draft", "archived"] },
  },
};

export const Published = { args: { status: "published" } };
export const Draft     = { args: { status: "draft"     } };
export const Archived  = { args: { status: "archived"  } };
