export const addPreventClosePage = () => {
  window.onbeforeunload = () => true;
};

export const removePreventClosePage = () => {
  window.onbeforeunload = null;
};
