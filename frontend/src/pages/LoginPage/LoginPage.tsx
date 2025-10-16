import { Button } from "@/src/shared/ui/Button";
import { ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon } from "@/src/shared/ui/Icon";
import { IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Input } from "@/src/shared/ui/Input";
import { InputTypeEnum } from "@/src/shared/ui/Input/Input";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";

export function LoginPage() {
  return (
    <div className="flex justify-center h-screen">
      <Island className="my-auto" theme={IslandThemeEnum.BLACK}>
        <IslandHeader>
          <Icon icon="LogIn" theme={IconThemeEnum.WHITE} />
          <div className="text-white text-xl font-bold">Авторизация</div>
        </IslandHeader>
        <IslandContent className="grid gap-3">
          <Input type={InputTypeEnum.TEXT} placeholder="Логин" />
          <Input type={InputTypeEnum.PASSWORD} placeholder="Пароль" />
          <Button
            className={"m-auto w-full"}
            text="Войти"
            type={ButtonTypeEnum.GRAY}
          />
        </IslandContent>
      </Island>
    </div>
  );
}
