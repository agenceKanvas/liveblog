import * as messages from './common/messages';

class Permalink {
  constructor() {
    this.escapeRegExp = function (string) {
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    };

    this.PARAM_NAME = 'liveblog._id', // the parameter name for permalink.
    this.regexHash = new RegExp(this.escapeRegExp(this.PARAM_NAME) + '=([^&#]*)');
    this.href = '';

    // listen to embed.ts file when it sends parent window href
    messages.listen('permalink_url', (data) => {
      this.href = data;
      this.parseHref();
    });

    this.initHref();
  }

  initHref() {
    // if we are not in iframe (ESI approach) then let's use own's document href
    if (window === window.parent) {
      this.href = document.location.href;
      this.parseHref();
    } else {
      // then let's ask for the window href
      messages.send('permalink_init');
    }
  }

  parseHref() {
    // if href is still empty, let's ask again to embed.ts
    if (this.href.length === 0) {
      messages.send('permalink_init');
      return;
    }

    var matches = this.href.match(this.regexHash);

    if (matches) {
      var arr = decodeURIComponent(matches[1]).split('__');
      this._id = arr[0];
      if (LB.settings.postOrder !== arr[1]) {
        LB.settings.postOrder = arr[1];
        this._changedSort = true;
      }
    }
  }

  getUrl(id) {
    var permalink = false,
      DELIMITER = LB.settings.permalinkDelimiter || '?', // delimiter can be `?` or `#`.
      newHash = this.PARAM_NAME + '=' + id + '__' + LB.settings.postOrder;

    if (this.href.indexOf(DELIMITER) === -1) {
      permalink = this.href + DELIMITER + newHash;
    } else if (this.href.indexOf(this.PARAM_NAME + '=') !== -1) {
      permalink = this.href.replace(this.regexHash, newHash);
    } else {
      permalink = this.href + '&' + newHash;
    }

    return permalink;
  }
}

module.exports = Permalink;
