import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AttachmentList, type AttachmentItem } from "../../components/attachment-list.js";

const baseAttachment: AttachmentItem = {
  id: "a-1",
  filename: "lecture.pdf",
  file_type: "application/pdf",
  file_size: 102400,
  download_url: "https://example.com/lecture.pdf",
  created_at: "2026-02-20T10:00:00Z",
};

describe("AttachmentList", () => {
  it("renders empty state when no attachments", () => {
    render(<AttachmentList attachments={[]} />);
    expect(screen.getByText("No attachments yet")).toBeInTheDocument();
  });

  it("renders filename and formatted file size", () => {
    render(<AttachmentList attachments={[baseAttachment]} />);
    expect(screen.getByText("lecture.pdf")).toBeInTheDocument();
    expect(screen.getByText("100.0 KB")).toBeInTheDocument();
  });

  it("renders download link when download_url is set", () => {
    render(<AttachmentList attachments={[baseAttachment]} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/lecture.pdf");
  });

  it("renders download link even for stub:// URLs", () => {
    const stubAttachment = { ...baseAttachment, download_url: "stub://download/test" };
    render(<AttachmentList attachments={[stubAttachment]} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "stub://download/test");
  });

  it("does not show delete button when onDelete not provided", () => {
    render(<AttachmentList attachments={[baseAttachment]} />);
    // Should have a link but no button for delete
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows delete button and calls onDelete when provided", () => {
    const onDelete = vi.fn();
    render(<AttachmentList attachments={[baseAttachment]} onDelete={onDelete} />);
    const deleteBtn = screen.getByRole("button");
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("a-1");
  });

  it("disables delete button when isDeleting is true", () => {
    const onDelete = vi.fn();
    render(<AttachmentList attachments={[baseAttachment]} onDelete={onDelete} isDeleting />);
    const deleteBtn = screen.getByRole("button");
    expect(deleteBtn).toBeDisabled();
  });

  it("renders multiple attachments", () => {
    const attachments: AttachmentItem[] = [
      baseAttachment,
      { ...baseAttachment, id: "a-2", filename: "slides.pptx", file_type: "application/vnd.ms-powerpoint" },
    ];
    render(<AttachmentList attachments={attachments} />);
    expect(screen.getByText("lecture.pdf")).toBeInTheDocument();
    expect(screen.getByText("slides.pptx")).toBeInTheDocument();
  });
});
