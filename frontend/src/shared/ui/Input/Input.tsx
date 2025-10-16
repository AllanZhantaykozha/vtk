import { cn } from "@/lib/utils";
import styles from "./Input.module.scss";

interface InputDto extends React.InputHTMLAttributes<HTMLInputElement> {
  type: InputTypeEnum;
  name?: string;
  placeholder?: string;
  isRequired?: boolean;
  title?: string;
  value?: string;
  className?: string;
}
export enum InputTypeEnum {
  TEXT = "text",
  PASSWORD = "password",
  EMAIL = "email",
  NUMBER = "number",
  TEL = "tel",
  URL = "url",
  DATE = "date",
  DATETIME_LOCAL = "datetime-local",
  TIME = "time",
  MONTH = "month",
  WEEK = "week",
  COLOR = "color",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  FILE = "file",
  HIDDEN = "hidden",
  RANGE = "range",
  SEARCH = "search",
}

export function Input(data: InputDto) {
  return (
    <div className={cn(data.className)}>
      <input
        className="bg-white text-black px-3 py-2 focus:outline-none rounded-2xl w-full"
        type={data.type}
        name={data.name}
        value={data.value}
        placeholder={data.placeholder}
        required={data.isRequired}
        title={data.title}
      />
    </div>
  );
}
