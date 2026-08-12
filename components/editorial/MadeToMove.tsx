"use client";

import { useRef, useState } from "react";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

/**
 * MADE TO MOVE — the brand film band.
 *
 * There is no film yet, so this does not pretend to have one: the poster
 * composition stands in, and the play control appears only once a real source
 * is supplied. Drop an MP4 at /public/video/made-to-move.mp4 and pass `src`
 * — the section then autoplays muted, inline, and lazily.
 *
 * Autoplay rules: muted + playsInline (required by iOS), never on a data
 * saver connection, and never under reduced motion — those visitors get the
 * poster and a play button they control.
 */
export function MadeToMove({ src, poster }: { src?: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="km-film" data-world="film" data-surface="inverse" aria-labelledby="km-film-title">
      <div className="km-film__media" aria-hidden="true">
        {src ? (
          <video
            ref={videoRef}
            className="km-film__video"
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <Figure seed="made-to-move" plate="campaign" fill sizes="100vw" alt="" />
        )}
      </div>

      <div className="km-film__inner km-shell">
        <Reveal>
          {src && (
            <button
              type="button"
              className="km-film__play"
              onClick={toggle}
              aria-label={playing ? "Pause the film" : "Play the film"}
            >
              <Icon name={playing ? "minus" : "play"} size={26} />
            </button>
          )}

          <h2 id="km-film-title" className="km-film__title">
            <MaskLine>Made to Move.</MaskLine>
          </h2>
          <p className="km-film__copy">
            Nothing here is made to be kept for good. It is made for the walk to
            school, the last hour at the beach, and the run back to the car.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
