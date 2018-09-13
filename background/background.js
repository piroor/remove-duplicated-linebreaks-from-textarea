browser.contextMenus.create({
  id:       'remove-duplicated-linebreaks',
  type:     'normal',
  title:    browser.i18n.getMessage('contextMenu.label'),
  contexts: ['editable']
});

function removeDuplicatedLinebreaks(targetText = '') {
  const LINEBREAKS_MATCHER = /[\n\r]\n/g;
  const node = document.activeElement;
  if (node.localName == 'textarea') {
    if (!targetText) { // whole textarea
      node.value = node.value.replace(LINEBREAKS_MATCHER, '\n');
      return;
    }
    if (node.value.includes(targetText)) { // if the selection text is same to its raw version
      node.value = node.value.replace(targetText, targetText.replace(LINEBREAKS_MATCHER, '\n'));
      return;
    }
    // otherwise, we need to find raw text based on normalized selection text
    // don't use '\s' to normalize, because it unexpectedly matches to a fullwidth-space.
    const normalized = node.value.replace(/[ \r\n\t]+/g, ' ');
    const restParts = normalized.replace(targetText, '\n\n').split('\n');
    let i = 0;
    const maxi = node.value.length;
    const results = [];
    for (const part of restParts) {
      let buffer = '';
      let range = '';
      while (range != (part || targetText)) {
        if (i == maxi)
          break;
        const char = node.value.charAt(i++);
        buffer += char;
        if (/[ \r\n\t]/.test(char)) {
          if (/ $/.test(range))
            continue;
          range += ' ';
        }
        else {
          range += char;
        }
      }
      if (part)
        results.push(buffer);
      else
        results.push(buffer.replace(LINEBREAKS_MATCHER, '\n'));
    }
    node.value = results.join('');
  }
  else { // rich text area
    const nodes = document.evaluate('descendant::text()', node, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    while (true) {
      const node = nodes.iterateNext();
      if (!node)
        break;
      node.nodeValue = node.nodeValue.replace(LINEBREAKS_MATCHER, '\n');
    }
  }
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  const targetText = info.selectionText;
  browser.tabs.executeScript(tab.id, {
    frameId: info.frameId,
    code: `
      (${removeDuplicatedLinebreaks.toSource()})(${JSON.stringify(targetText)});
    `
  });
});

