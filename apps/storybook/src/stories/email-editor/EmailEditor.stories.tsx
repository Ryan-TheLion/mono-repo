import "@repo/email-editor/style.css";
import { EmailEditor } from "@repo/email-editor";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Component/EmailEditor",
  component: EmailEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof EmailEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
