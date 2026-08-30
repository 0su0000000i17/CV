'use client';

const DIGIT_HEIGHT_EM = 1;
// blank (for a digit column that shrinks away, e.g. "100" -> "80") + 0-9
const STRIP = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function stripIndex(char: string) {
  const index = STRIP.indexOf(char);
  return index === -1 ? 0 : index;
}

function DigitColumn({ char }: { char: string }) {
  const index = stripIndex(char);

  return (
    <span
      className="relative inline-block overflow-hidden align-bottom"
      style={{ height: `${DIGIT_HEIGHT_EM}em`, width: '0.62em' }}
    >
      <span
        className="absolute left-0 top-0 flex flex-col items-center transition-transform ease-out motion-reduce:transition-none"
        style={{
          transform: `translateY(-${index * DIGIT_HEIGHT_EM}em)`,
          transitionDuration: '600ms',
        }}
      >
        {STRIP.map((digit, i) => (
          <span key={i} style={{ height: `${DIGIT_HEIGHT_EM}em`, lineHeight: `${DIGIT_HEIGHT_EM}em` }}>
            {digit === ' ' ? ' ' : digit}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Odometer-style rolling digits (numbers spin past intermediate values on
 * their way to the target - the "iOS timer picker" effect), used for the
 * credit balance so a spend/refund reads as a visible countdown/countup
 * instead of a value just snapping to a new number. Digit count is padded
 * to the WIDER of old/new via a blank strip entry, so a magnitude change
 * (e.g. 100 -> 80) rolls the leading column away instead of glitching.
 */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  const text = Math.max(0, Math.round(value)).toString();

  return (
    <span className={`inline-flex tabular-nums ${className ?? ''}`}>
      {text.split('').map((char, position) => (
        <DigitColumn key={text.length - position} char={char} />
      ))}
    </span>
  );
}
