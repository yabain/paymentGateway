// json-viewer.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-json-viewer',
  template: `<pre class="json-pre" [innerHTML]="highlightedJson"></pre>`
})
export class JsonViewerComponent implements OnChanges {
  @Input() data: any;
  highlightedJson: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      const jsonString = JSON.stringify(this.data ?? {}, null, 2);
      // escape HTML chars
      const escaped = jsonString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // regex unique pour détecter clés / strings / numbers / bool / null
      const html = escaped.replace(
        /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = 'number';
          if (/^"/.test(match)) {
            // si la chaîne se termine par ':' => c'est une clé
            cls = /:\s*$/.test(match) ? 'key' : 'string';
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return `<span class="json-${cls}">${match}</span>`;
        }
      );

      // marquer sûr pour Angular (on génère nous-même le HTML)
      this.highlightedJson = this.sanitizer.bypassSecurityTrustHtml(html);
    }
  }
}
