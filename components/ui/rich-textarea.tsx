import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, List, Heading1, Heading2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string;
}

export const RichTextarea = ({
  value,
  onChange,
  className,
  ...props
}: RichTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;

    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selection}${suffix}${after}`;
    const newCursorPos = start + prefix.length;

    // Trigger standard React change event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textareaRef.current, newText);
      const event = new Event("input", { bubbles: true });
      textareaRef.current.dispatchEvent(event);
    }

    // Restore focus and cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          newCursorPos,
          newCursorPos + selection.length
        );
      }
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-t-lg border-b-0">
        <ToolButton
          icon={<Bold size={14} />}
          onClick={() => insertFormat("**", "**")}
          tooltip="Bold"
        />
        <ToolButton
          icon={<Italic size={14} />}
          onClick={() => insertFormat("*", "*")}
          tooltip="Italic"
        />
        <div className="w-px h-4 bg-white/10 mx-1" />
        <ToolButton
          icon={<Heading1 size={14} />}
          onClick={() => insertFormat("# ", "")}
          tooltip="Heading 1"
        />
        <ToolButton
          icon={<Heading2 size={14} />}
          onClick={() => insertFormat("## ", "")}
          tooltip="Heading 2"
        />
        <div className="w-px h-4 bg-white/10 mx-1" />
        <ToolButton
          icon={<List size={14} />}
          onClick={() => insertFormat("- ", "")}
          tooltip="List"
        />
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        className={cn(
          "rounded-t-none min-h-[120px] font-mono text-sm",
          className
        )}
        {...props}
      />
      <div className="text-xs text-gray-500 text-right px-1">
        Supports Markdown
      </div>
    </div>
  );
};

const ToolButton = ({
  icon,
  onClick,
  tooltip,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
      title={tooltip}
    >
      {icon}
    </button>
  );
};
