import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileUploadZone } from "../../components/file-upload-zone.js";

describe("FileUploadZone", () => {
  it("renders default upload prompt", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} />);
    expect(screen.getByText("Drag & drop or click to upload")).toBeInTheDocument();
    expect(screen.getByText("Max 50MB per file")).toBeInTheDocument();
  });

  it("shows uploading state", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} uploading />);
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
  });

  it("shows custom maxSizeMB in prompt", () => {
    render(<FileUploadZone onFileSelect={vi.fn()} maxSizeMB={10} />);
    expect(screen.getByText("Max 10MB per file")).toBeInTheDocument();
  });

  it("calls onFileSelect with selected file", () => {
    const onFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={onFileSelect} />);
    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFileSelect).toHaveBeenCalledWith([file]);
  });

  it("shows error when file exceeds maxSizeMB", () => {
    const onFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={onFileSelect} maxSizeMB={1} />);
    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    // 2MB file — over the 1MB limit
    const bigFile = new File([new ArrayBuffer(2 * 1024 * 1024)], "huge.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(bigFile, "size", { value: 2 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(screen.getByText("File too large. Max 1MB per file.")).toBeInTheDocument();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("does not call onFileSelect when disabled", () => {
    const onFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={onFileSelect} disabled />);
    const zone = screen.getByRole("button");
    fireEvent.click(zone);
    expect(onFileSelect).not.toHaveBeenCalled();
  });
});
