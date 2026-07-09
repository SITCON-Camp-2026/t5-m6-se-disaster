import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  it("renders starter title", () => {
    render(<App />);
    expect(screen.getByText("災害資訊整理工作台")).toBeInTheDocument();
  });

  it("keeps the home page focused on phase 0 tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "原始資訊" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通報" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "地點" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "志工任務" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "人員指派" }),
    ).not.toBeInTheDocument();
  });

  it("shows review states in the phase 0 workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByText(
        "第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
  });

  it("keeps draft CRUD as learner work instead of starter output", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText("尚未建立整理草稿")).toBeInTheDocument();
    expect(
      screen.getByText(/請 agent 加上建立、編輯、刪除或重設整理草稿/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/已產生 \d+ 筆安全邊界草稿/),
    ).not.toBeInTheDocument();
  });

  it("shows the final results page and explains draft effects", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "最終成果" }));

    expect(
      screen.getByText(/第二頁的儲存草稿、重設成安全預設和刪除草稿/),
    ).toBeInTheDocument();
    expect(screen.getByText(/筆草稿已儲存/)).toBeInTheDocument();
  });

  it("removes only the selected deleted draft from the final results page", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));
    fireEvent.click(screen.getByRole("button", { name: /M-003/ }));
    fireEvent.click(screen.getByRole("button", { name: "刪除草稿" }));
    fireEvent.click(screen.getByRole("button", { name: "最終成果" }));

    expect(
      screen.queryByRole("heading", { name: "M-003" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "M-001" })).toBeInTheDocument();
    expect(screen.getByText(/5 筆草稿已儲存/)).toBeInTheDocument();
  });

  it("shows a reset safe draft again in the final results page", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));
    fireEvent.click(screen.getByRole("button", { name: /M-003/ }));
    fireEvent.click(screen.getByRole("button", { name: "刪除草稿" }));
    fireEvent.click(screen.getByRole("button", { name: "重設成安全預設" }));
    fireEvent.click(screen.getByRole("button", { name: "最終成果" }));

    expect(screen.getByRole("heading", { name: "M-003" })).toBeInTheDocument();
    expect(screen.getByText(/6 筆草稿已儲存/)).toBeInTheDocument();
  });
});
