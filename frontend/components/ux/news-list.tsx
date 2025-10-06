import * as React from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import NewsItem from "./news-item"
import { News } from "../types/news.type"


export function NewsList({news} : {news: News[]}) {
  return (
    <Carousel className="w-full z-0 mx-auto container">
      <CarouselContent className="-ml-4">
        {news.map((obj, index) => (
          <CarouselItem className="pl-4 basis-0 md:basis-1/2 lg:basis-1/3" key={index}>
            <NewsItem {...obj} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
