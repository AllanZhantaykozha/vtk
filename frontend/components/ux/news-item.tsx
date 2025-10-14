import Image from "next/image";
import { News } from "../types/news.type";

const NewsItem = ({ title, image, createdAt }: News) => {
  return (
    <div className="w-[400px] h-[300px] relative rounded-2xl overflow-hidden">
      <Image
        alt={title}
        src={image}
        width={100}
        height={100}
        className="w-full h-full z-10"
      />
      <div className="w-full flex flex-col justify-end bg-linear-to-b from-[#0000000] to-[#00000080] h-1/2 absolute z-10 bottom-0 p-5 text-white">
        <div className="">{title}</div>
        <div className="">{createdAt}</div>
      </div>
    </div>
  );
};

export default NewsItem;
