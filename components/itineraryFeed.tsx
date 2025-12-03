import { Fragment } from "react";
import { InView } from "react-intersection-observer";
import { z } from "zod";
import { Itinerary } from "@/server/models/responses";
import { InfiniteData } from "@tanstack/react-query";
import { Subject } from "@/server/models/auth";
import Loading from "./loading";
import ItineraryPreviewCard from "./itinerary";

type ItineraryFeedProps = {
  user: Subject;
  itineraries: InfiniteData<z.infer<typeof Itinerary>[]> | undefined;
  itinerariesLoading: boolean;
  fetchNext: () => void;
};

export default function ItineraryFeed({
  itineraries,
  itinerariesLoading,
  fetchNext,
}: ItineraryFeedProps) {
  if (!itineraries && itinerariesLoading) {
    return <Loading />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {itineraries &&
        itineraries.pages.map((page, pageIndex) => (
          <Fragment key={`page_${pageIndex}`}>
            {page.map((itinerary, idx) => {
              const isLastItem =
                pageIndex === itineraries.pages.length - 1 &&
                idx === page.length - 1;

              return (
                <Fragment key={`itinerary_${itinerary.id}`}>
                  <ItineraryPreviewCard itinerary={itinerary} />

                  {isLastItem && (
                    <InView
                      as="div"
                      className="h-1"
                      onChange={(inView) => inView && fetchNext()}
                    />
                  )}
                </Fragment>
              );
            })}
          </Fragment>
        ))}

      {itinerariesLoading && (
        <div className="col-span-full flex justify-center py-10">
          <Loading />
        </div>
      )}
    </div>
  );
}
