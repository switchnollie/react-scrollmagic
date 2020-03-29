import React, {
  useRef,
  useState,
  useEffect,
  Children,
  cloneElement
} from "react";
import { ControllerContext } from "./ControllerContext";
import {
  objectWithoutKeys,
  isString,
  isNumber,
  isBoolean,
  isTriggerHook,
  isTriggerElement,
  isGSAP,
  refOrInnerRef
} from "./utils";
import ScrollMagic from "./lib/scrollmagic";
import debugAddIndicators from "./lib/debug.addIndicators.js";

debugAddIndicators(ScrollMagic);

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
  let renderedChildren = controlGSAP(children, progress, event);
  renderedChildren = callChildFunction(renderedChildren, progress, event);
  return Children.only(renderedChildren);
};

const SceneBase = props => {
  const {
    children,
    controller,
    classToggle,
    pin,
    pinSettings,
    indicators,
    enabled,
    triggerElement,
    duration,
    offset,
    triggerHook,
    reverse
  } = props;
  const element = useRef(null);
  const scene = useRef(null);
  const [event, setEvent] = useState("init");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sceneParams = objectWithoutKeys(props, [
      "children",
      "controller",
      "classToggle",
      "pin",
      "pinSettings",
      "indicators",
      "enabled",
      "triggerElement"
    ]);
    if (triggerElement === null) {
      element.current = null;
    } else if (isTriggerElement(triggerElement)) {
      element.current = triggerElement;
    }
    scene.current = new ScrollMagic.Scene({
      ...sceneParams,
      triggerElement: element.current
    });

    initEventHandlers();

    if (classToggle) {
      setClassToggle(scene, element, classToggle);
    }

    if (pin || pinSettings) {
      setPin(scene, element, pin, pinSettings);
    }

    if (indicators) {
      scene.current.addIndicators({ name: " " });
    }

    if (enabled !== undefined) {
      scene.current.enabled(enabled);
    }

    return scene.current.destroy;
  }, []);

  useEffect(() => {
    controller && scene.current.addTo(controller);
  }, [controller]);

  useEffect(() => {
    isNumber(duration) && scene.current.duration(duration);
  }, [duration]);
  useEffect(() => {
    isNumber(offset) && scene.current.offset(offset);
  }, [offset]);
  useEffect(() => {
    isTriggerElement(triggerElement) &&
      scene.current.triggerElement(triggerElement);
  }, [triggerElement]);
  useEffect(() => {
    isTriggerHook(triggerHook) && scene.current.triggerHook(triggerHook);
  }, [triggerHook]);
  useEffect(() => {
    isBoolean(reverse) && scene.current.reverse(reverse);
  }, [reverse]);
  useEffect(() => {
    isBoolean(enabled) && scene.current.enabled(enabled);
  }, [enabled]);

  function setClassToggle(scene, element, classToggle) {
    if (Array.isArray(classToggle) && classToggle.length === 2) {
      scene.current.setClassToggle(classToggle[0], classToggle[1]);
    } else {
      scene.current.setClassToggle(element.current, classToggle);
    }
  }

  function setPin(scene, element, pin, pinSettings) {
    const pinElement = isString(pin) ? pin : element.current;
    scene.current.setPin(pinElement, pinSettings);
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
  if (isTriggerElement(triggerElement)) {
    return child;
  }
  return cloneElement(child, { [refOrInnerRef(child)]: element });
};

export default function Scene({ children, ...props }) {
  return (
    <ControllerContext.Consumer>
      {controller =>
        controller ? (
          <SceneBase controller={controller} {...props}>
            {children}
          </SceneBase>
        ) : (
          getChild(children, 0, "init")
        )
      }
    </ControllerContext.Consumer>
  );
}
