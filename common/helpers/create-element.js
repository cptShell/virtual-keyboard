export default (tag, className, attributes, innerText) => {
  const element = document.createElement(tag);
  if (className) element.classList.add(className);
  if (attributes) {
    attributes.forEach(([key, value]) => element.setAttribute(key, value));
  }
  if (innerText) element.textContent = innerText;

  return element;
};
