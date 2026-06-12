import Pagination from "./Pagination";

export default {
  title: "Common/Pagination",
  component: Pagination,
  tags: ["autodocs"],
};

export const Default = {
  args: { totalItems: 128, itemsPerPage: 10, currentPage: 1, onChange: () => {} },
};

export const MiddlePage = {
  args: { totalItems: 128, itemsPerPage: 10, currentPage: 6, onChange: () => {} },
};

export const LastPage = {
  args: { totalItems: 128, itemsPerPage: 10, currentPage: 13, onChange: () => {} },
};
