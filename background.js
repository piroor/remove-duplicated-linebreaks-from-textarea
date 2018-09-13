browser.contextMenus.create({
  id:       'remove-duplicated-linebreaks',
  type:     'normal',
  title:    browser.i18n.getMessage('contextMenu.label'),
  contexts: ['editable']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  browser.tabs.executeScript(tab.id, {
    frameId: info.frameId,
    code: `
      (() => {
        const node = document.activeElement;
        if (node.localName == 'textarea') {
          node.value = node.value.replace(/\\n\\n/g, '\\n');
        }
        else { // rich text area
          const nodes = document.evaluate('descendant::text()', node, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
          while (true) {
            const node = nodes.iterateNext();
            if (!node)
              break;
            node.nodeValue = node.nodeValue.replace(/\\n\\n/g, '\\n');
          }
        }
      })();
    `
  });
});

