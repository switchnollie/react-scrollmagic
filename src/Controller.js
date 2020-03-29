import React, { useState, useEffect } from "react";
import { ControllerContext } from "./ControllerContext";
import ScrollMagic from "./lib/scrollmagic";

export default function Controller({ children, ...controllerProps }) {
  const [controller, setController] = useState(null);
  useEffect(() => {
    setController(new ScrollMagic.Controller(controllerProps));
  }, []);
  return !controller ? (
    children
  ) : (
    <ControllerContext.Provider value={controller}>
      {children}
    </ControllerContext.Provider>
  );
}
