import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateGroupForm from "./createGroupForm";
import { createGroupAction } from "@/lib/actions/groups";

vi.mock("@/lib/actions/groups", () => ({
  createGroupAction: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(createGroupAction).mockReset();
});

describe("CreateGroupForm", () => {
  it("submits the name and description and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(createGroupAction).mockResolvedValue({
      success: true,
      group: {
        __typename: "Group",
        id: "1",
        name: "Engineering",
        description: "desc",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(<CreateGroupForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Group Name"), "Engineering");
    await user.type(screen.getByLabelText("Description"), "desc");
    await user.click(screen.getByRole("button", { name: /create group/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(createGroupAction).toHaveBeenCalledWith({ name: "Engineering", description: "desc" });
  });

  it("shows a client-side error for an empty name without calling the action", async () => {
    const user = userEvent.setup();
    render(<CreateGroupForm />);

    // Bypass the `required` attribute's native validation, matching what a
    // user could still do (e.g. whitespace-only input passes `required`).
    await user.type(screen.getByLabelText("Group Name"), "   ");
    await user.click(screen.getByRole("button", { name: /create group/i }));

    expect(await screen.findByText("Group name is required")).toBeInTheDocument();
    expect(createGroupAction).not.toHaveBeenCalled();
  });

  it("shows the server's error message on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(createGroupAction).mockResolvedValue({
      success: false,
      error: "Group already exists",
    });

    render(<CreateGroupForm />);
    await user.type(screen.getByLabelText("Group Name"), "Engineering");
    await user.click(screen.getByRole("button", { name: /create group/i }));

    expect(await screen.findByText("Group already exists")).toBeInTheDocument();
  });

  it("resets the form after a successful submit", async () => {
    const user = userEvent.setup();
    vi.mocked(createGroupAction).mockResolvedValue({
      success: true,
      group: {
        __typename: "Group",
        id: "1",
        name: "Engineering",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    render(<CreateGroupForm />);
    const nameInput = screen.getByLabelText("Group Name") as HTMLInputElement;
    await user.type(nameInput, "Engineering");
    await user.click(screen.getByRole("button", { name: /create group/i }));

    await vi.waitFor(() => expect(nameInput.value).toBe(""));
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<CreateGroupForm onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not render a cancel button when onCancel isn't provided", () => {
    render(<CreateGroupForm />);
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });
});
