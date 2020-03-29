import React, { useRef, useState, useEffect } from "react";
import { ControllerContext } from "./ControllerContext";
import ScrollMagic from "./lib/scrollmagic";
import debugAddIndicators from "./lib/debug.addIndicators.js";

debugAddIndicators(ScrollMagic);
const refOrInnerRef = child => {
  if (
    child.type &&
    child.type.$$typeof &&
    child.type.$$typeof.toString() === "Symbol(react.forward_ref)"
  ) {
    return "ref";
  }

  // styled-components < 4
  if (child.type && child.type.styledComponentId) {
    return "innerRef";
  }

  return "ref";
};
const isGSAP = child => {
  if (
    React.Children.count(child) === 1 &&
    child.type &&
    (child.type.displayName === "Tween" ||
      child.type.displayName === "Timeline")
  ) {
    return true;
  }
  return false;
};

const controlGSAP = (child, progress, event) => {
  if (isGSAP(child)) {
    const props = { ...child.props, totalProgress: progress, paused: true };
    return (
      <div>
        <child.type {...props} />
      </div>
    );
  }
  return child;
};
const callChildFunction = (children, progress, event) => {
  if (children && typeof children === "function") {
    return children(progress, event);
  }
  return children;
};

const getChild = (children, progress, event) => {
  children = controlGSAP(children, progress, event);
  children = callChildFunction(children, progress, event);
  return React.Children.only(children);
};

const isString = element => {
  if (typeof element === "string" || element instanceof String) {
    return true;
  }
  return false;
};

const SceneBase = ({
  children,
  controller,
  classToggle,
  pin,
  pinSettings,
  indicators,
  enabled,
  triggerElement,
  duration,
  ...other
}) => {
  const ref = useRef(null);
  const scene = useRef(null);
  const [event, setEvent] = useState("init");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    sceneParams.triggerElement =
      triggerElement === null ? null : triggerElement || element;

    scene.current = new ScrollMagic.Scene(sceneParams);

    initEventHandlers();

    if (classToggle) {
      setClassToggle(scene.current, element, classToggle);
    }

    if (pin || pinSettings) {
      setPin(scene.current, element, pin, pinSettings);
    }

    if (indicators) {
      scene.current.addIndicators({ name: " " });
    }

    if (enabled !== undefined) {
      scene.current.enabled(enabled);
    }
    scene.current.addTo(controller);

    return scene.current.destroy;
  });

  useEffect(() => {
    scene.current.duration(duration);
  }, [duration]);
  useEffect(() => {
    scene.current.offset(offset);
  }, [offset]);
  useEffect(() => {
    scene.current.triggerElement(triggerElement);
  }, [triggerElement]);
  useEffect(() => {
    scene.current.triggerHook(triggerHook);
  }, [triggerHook]);
  useEffect(() => {
    scene.current.reverse(reverse);
  }, [reverse]);
  useEffect(() => {
    scene.current.enabled(enabled);
  }, [enabled]);

  function setClassToggle(scene, element, classToggle) {
    if (Array.isArray(classToggle) && classToggle.length === 2) {
      scene.setClassToggle(classToggle[0], classToggle[1]);
    } else {
      scene.setClassToggle(element, classToggle);
    }
  }

  function setPin(scene, element, pin, pinSettings) {
    element = isString(pin) ? pin : element;
    scene.setPin(element, pinSettings);
  }

  function initEventHandlers() {
    if (
      typeof children !== "function" &&
      !isGSAP(callChildFunction(children, 0, "init"))
    ) {
      return;
    }

    scene.current.on("start end enter leave", event => {
      setEvent({ event });
    });

    scene.current.on("progress", ({ progress }) => {
      setProgress(progress);
    });
  }

  const child = getChild(children, progress, event);

  return React.cloneElement(child, { [refOrInnerRef(child)]: ref });
};

const SceneWrapper = ({ children, controller, ...props }) => {
  if (!controller) {
    const progress = 0;
    const event = "init";

    return getChild(children, progress, event);
  }

  return <SceneBase {...props} />;
};
SceneWrapper.displayName = "Scene";

export default function Scene({ children, ...props }) {
  return (
    <ControllerContext.Consumer>
      {controller => (
        <SceneWrapper controller={controller} {...props}>
          {children}
        </SceneWrapper>
      )}
    </ControllerContext.Consumer>
  );
}
