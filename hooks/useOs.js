import { useEffect, useState } from "react";

// how to use
// const macOS = useOs()
// returns true/false; false until mounted, so static/SSR markup is unchanged

const useOs = () => {
  // get Os
  const [os, setOs] = useState(false);
  useEffect(() => {
    // iPadOS also reports "MacIntel" but exposes multiple touch points
    setOs(
      navigator.platform.indexOf("Mac") > -1 && navigator.maxTouchPoints <= 1
    );
  }, []);

  return os;
};

export default useOs;
