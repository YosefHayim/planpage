import { codeMark } from "../render/codeMark";

/** `slideshow` = discrete auto-advancing slides (arrows + dots); `marquee` = a continuous ticker. */
export type CarouselMode = "slideshow" | "marquee";

export interface CarouselSlide {
  readonly title?: string;
  readonly body?: string;
  /** An image URL — rendered as the slide media. */
  readonly image?: string;
  readonly code?: string;
  readonly codeLang?: string;
}

export interface CarouselProps {
  readonly slides: ReadonlyArray<CarouselSlide>;
  /** Default `slideshow`. `marquee` is a pure-CSS continuous ticker (no controls). */
  readonly mode?: CarouselMode;
  /** Marquee scroll direction. Default `left`. */
  readonly direction?: "left" | "right";
  /** Slideshow auto-advance interval in ms. Default 4000. */
  readonly interval?: number;
  readonly label?: string;
}

/** The inner content of one slide — shared by both modes; the wrapper sizing differs per mode. */
const SlideBody = ({ slide }: { readonly slide: CarouselSlide }) => (
  <div class="flex h-full min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
    {slide.image ? (
      <img
        src={slide.image}
        alt={slide.title ?? ""}
        class="h-32 w-full rounded-lg object-cover"
        loading="lazy"
      />
    ) : null}
    {slide.title ? (
      <div class="max-w-full whitespace-normal break-words font-semibold text-slate-900 text-sm dark:text-white">
        {slide.title}
      </div>
    ) : null}
    {slide.body ? (
      <p class="max-w-full whitespace-normal break-words text-slate-500 text-sm dark:text-slate-400">
        {slide.body}
      </p>
    ) : null}
    {slide.code ? (
      <pre class="code code-wrap mt-auto max-w-full rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-[#1e1e1e] dark:text-slate-100">
        {codeMark(slide.code, slide.codeLang ?? "ts")}
      </pre>
    ) : null}
  </div>
);

const ARROW =
  "absolute top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white/95 text-lg text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:bg-slate-800";

const Caption = ({ text }: { readonly text: string }) => (
  <figcaption class="mb-2 font-medium text-slate-500 text-xs uppercase tracking-wide dark:text-slate-400">
    {text}
  </figcaption>
);

/**
 * An infinite auto-scrolling carousel. In `slideshow` mode it auto-advances discrete slides on a
 * timer (arrows + dot indicators, pauses on hover, loops); the CAROUSEL_SCRIPT island drives it and
 * it degrades to a swipeable scroll-snap strip with no JS. In `marquee` mode it is a seamless
 * pure-CSS ticker (duplicated track, pause on hover) — no client JS at all.
 */
export const Carousel = ({
  slides,
  mode = "slideshow",
  direction = "left",
  interval = 4000,
  label,
}: CarouselProps) => {
  if (slides.length === 0) throw new Error("Carousel: slides[] is required and non-empty");

  if (mode === "marquee") {
    const seconds = Math.max(12, slides.length * 5);
    return (
      <figure class="marquee not-prose min-w-0 overflow-hidden" data-carousel data-mode="marquee">
        {label ? <Caption text={label} /> : null}
        <div
          class={`marquee-track gap-4 py-1 ${direction === "right" ? "marquee-rev" : ""}`}
          style={`animation-duration:${seconds}s`}
        >
          {[...slides, ...slides].map((slide, i) => (
            <div
              key={`${slide.title ?? "slide"}-${i}`}
              class="w-72 max-w-[min(18rem,80vw)] shrink-0"
              aria-hidden={i >= slides.length ? "true" : undefined}
            >
              <SlideBody slide={slide} />
            </div>
          ))}
        </div>
      </figure>
    );
  }

  return (
    <figure
      class="relative min-w-0"
      data-carousel
      data-mode="slideshow"
      data-interval={interval}
      aria-roledescription="carousel"
      aria-label={label ?? "Carousel"}
    >
      {label ? <Caption text={label} /> : null}
      <div class="relative px-9">
        <div
          class="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          data-carousel-viewport
        >
          {slides.map((slide, i) => (
            <div
              key={`${slide.title ?? "slide"}-${i}`}
              class="w-full min-w-full shrink-0 snap-center"
              data-slide
              data-index={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
            >
              <SlideBody slide={slide} />
            </div>
          ))}
        </div>

        <button
          type="button"
          class={ARROW}
          data-carousel-prev
          aria-label="Previous slide"
          style="left:0"
        >
          ‹
        </button>
        <button
          type="button"
          class={ARROW}
          data-carousel-next
          aria-label="Next slide"
          style="right:0"
        >
          ›
        </button>
      </div>

      <div class="mt-3 flex justify-center gap-1.5" data-carousel-dots aria-hidden="true">
        {slides.map((slide, i) => (
          <button
            type="button"
            key={`dot-${slide.title ?? "slide"}-${i}`}
            class="carousel-dot h-2 w-2 rounded-full bg-slate-300 transition-all dark:bg-slate-600"
            data-carousel-dot
            data-index={i}
            tabIndex={-1}
          />
        ))}
      </div>
    </figure>
  );
};
