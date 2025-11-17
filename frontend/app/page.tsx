import { Information } from "@/components/ux/information";

export default function Home() {
  return (
    <div className="">
      <div className="grid gap-20">
        <div className="bg-slate-200 mx-10 px-10 py-10 rounded-2xl">
          <Information />
        </div>
        <div className="container mx-auto">
          <div className="">Войти</div>
          <div className=""></div>
        </div>
      </div>
    </div>
  );
}
