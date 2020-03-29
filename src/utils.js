import { Children } from "react";

export const objectWithoutKeys = (object, keys) => {
  let resultObj = object;
  keys.forEach(key => {
    const { [key]: deletedKey, ...otherProperties } = resultObj;
    resultObj = { ...otherProperties };
  });
  return resultObj;
};

export const refOrInnerRef = child => {
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

export const isString = x => typeof x === "string" || x instanceof String;
export const isNumber = x => x && !isNaN(x);
export const isBoolean = x => typeof x === "boolean" || x instanceof Boolean;
export const isHtmlElement = x => x instanceof Element;

const validTriggerHookStrings = ["onEnter", "onCenter", "onLeave"];

export const isTriggerHook = x => {
  if (isNumber(x)) {
    return x >= 0 && x <= 1;
  } else if (isString(x)) {
    return validTriggerHookStrings.some(hook => x === hook);
  }
};

export const isTriggerElement = x => isString(x) || isHtmlElement(x);

export const isGSAP = child => {
  if (
    Children.count(child) === 1 &&
    child.type &&
    (child.type.displayName === "Tween" ||
      child.type.displayName === "Timeline")
  ) {
    return true;
  }
  return false;
};
