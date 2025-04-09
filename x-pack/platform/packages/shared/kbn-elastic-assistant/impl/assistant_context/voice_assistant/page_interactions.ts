type ButtonDescription = {
    selector: string;
    description: string | null;
  };
  
  export function getButtonDescriptions(): ButtonDescription[] {
    const buttonElements: (HTMLButtonElement | HTMLAnchorElement)[] = Array.from(
      document.querySelectorAll("button, a.euiButton")
    );
  
    return buttonElements.map((button) => {
      const describedBy = button.getAttribute("aria-describedby");
      let description: string | null = null;
  
      if (describedBy) {
        description = describedBy
          .split(/\s+/)
          .map((id) => {
            const el = document.getElementById(id) || document.querySelector(`#${CSS.escape(id)}`);
            return el?.textContent?.trim() || null;
          })
          .filter((text): text is string => Boolean(text)) // filter out nulls
          .join(" ");
      }
  
      if (!description) {
        description =
          button.getAttribute("aria-label") ||
          button.textContent?.trim() ||
          null;
      }
  
      return {
        selector: getSmartSelector(button),
        description,
      };
    });
  }
  
  function getSmartSelector(el: Element): string {
    if (el.id) {
      return `#${CSS.escape(el.id)}`;
    }
  
    // Prefer unique class name
    if (el.classList.length > 0) {
      const allElements = document.querySelectorAll(el.tagName.toLowerCase());
      for (const className of el.classList) {
        const selector = `${el.tagName.toLowerCase()}.${CSS.escape(className)}`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
  
      // Fallback: combine class names
      const combined = Array.from(el.classList).map(cls => `.${CSS.escape(cls)}`).join("");
      const combinedSelector = `${el.tagName.toLowerCase()}${combined}`;
      if (document.querySelectorAll(combinedSelector).length === 1) {
        return combinedSelector;
      }
    }
  
    // aria-label fallback
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) {
      const labelSelector = `${el.tagName.toLowerCase()}[aria-label="${ariaLabel}"]`;
      if (document.querySelectorAll(labelSelector).length === 1) {
        return labelSelector;
      }
    }
  
    // nth-of-type fallback (last resort)
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === el.tagName
      );
      const index = siblings.indexOf(el) + 1;
      return `${el.tagName.toLowerCase()}:nth-of-type(${index})`;
    }
  
    // Absolute fallback
    return el.tagName.toLowerCase();
  }
  
  function getUniqueSelector(el: Element): string {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const path: string[] = [];
  
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
  
      if (el instanceof HTMLElement && el.className) {
        const classes = el.className.trim().split(/\s+/).join(".");
        if (classes) selector += `.${classes}`;
      }
  
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.nodeName === el.nodeName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(el) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }
  
      path.unshift(selector);
      el = el.parentElement!;
    }
  
    return path.join(" > ");
  }
  