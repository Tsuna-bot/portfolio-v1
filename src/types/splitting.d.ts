declare module "splitting" {
  interface SplittingOptions {
    target?: string | Element | Element[];
    by?: "chars" | "words" | "lines" | "items";
    key?: string;
    whitespace?: boolean;
  }

  interface SplittingResult {
    el: Element;
    chars: Element[];
    words: Element[];
    lines: Element[];
    items: Element[];
  }

  function Splitting(options?: SplittingOptions): SplittingResult[];
  export = Splitting;
}
