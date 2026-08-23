import { format } from 'date-fns';
import type { DocumentItem } from '@/hooks/useDocsData';

export function printDocumentAsPdf(doc: DocumentItem) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const typeLabel =
    doc.doc_type === 'snippet'
      ? 'Snippet'
      : doc.doc_type === 'thread'
      ? 'Thread'
      : 'Document';

  const formattedDate = doc.updated_at
    ? format(new Date(doc.updated_at), 'M/d/yy, h:mm a')
    : format(new Date(), 'M/d/yy, h:mm a');

  // Parse thread items if needed
  let threadItems: string[] = [];
  if (doc.doc_type === 'thread') {
    if (doc.content_json) {
      try {
        const parsed =
          typeof doc.content_json === 'string'
            ? JSON.parse(doc.content_json)
            : doc.content_json;
        if (Array.isArray(parsed)) {
          threadItems = parsed.map((item: any) => {
            if (typeof item === 'string') return item;
            if (Array.isArray(item)) return item.map((op: any) => op.insert || '').join('');
            if (item && item.ops && Array.isArray(item.ops)) {
              return item.ops.map((op: any) => op.insert || '').join('');
            }
            return JSON.stringify(item);
          });
        }
      } catch {}
    }
    if (threadItems.length === 0 && doc.content_markdown) {
      threadItems = doc.content_markdown.split('\n\n---\n\n').filter(Boolean);
    }
    if (threadItems.length === 0) {
      threadItems = [doc.previewText || ''];
    }
  }

  // Render Body based on type
  let contentHtml = '';
  if (doc.doc_type === 'snippet') {
    const quoteText = doc.content_markdown || doc.previewText || doc.title;
    contentHtml = `
      <div class="snippet-wrapper">
        <div class="quote-symbol">&ldquo;</div>
        <blockquote class="snippet-quote">
          ${quoteText.replace(/\n/g, '<br/>')}
        </blockquote>
      </div>
    `;
  } else if (doc.doc_type === 'thread') {
    contentHtml = `
      <div class="thread-timeline">
        ${threadItems
          .map(
            (thought, idx) => `
          <div class="thread-item">
            <div class="thread-node">
              <div class="node-circle">${idx + 1}</div>
              ${idx < threadItems.length - 1 ? '<div class="node-line"></div>' : ''}
            </div>
            <div class="thread-content">
              <p>${thought.replace(/\n/g, '<br/>')}</p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  } else {
    // Document
    const bodyText = doc.content_markdown || doc.previewText || '';
    contentHtml = `
      <div class="document-body">
        ${bodyText}
      </div>
    `;
  }

  const showTitle = doc.doc_type !== 'snippet' && Boolean(doc.title);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${typeLabel} • Quill</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      
      <style>
        @page {
          size: A4 portrait;
          margin: 0;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: #FFFFFF;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0F172A;
          font-size: 15px;
          line-height: 1.75;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        body {
          padding: 14mm 22mm 14mm 22mm;
          min-height: 100vh;
          box-sizing: border-box;
        }

        .doc-wrapper {
          width: 100%;
          min-height: calc(100vh - 28mm);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .main-content-flow {
          flex: 1 0 auto;
        }

        /* Top Header Bar */
        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          font-size: 12px;
          color: #64748B;
        }

        .top-date {
          font-weight: 500;
          color: #64748B;
        }

        .top-type-quill {
          font-weight: 600;
          color: #0F172A;
          letter-spacing: 0.02em;
        }

        /* Document Title */
        .doc-title {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.02em;
          color: #0F172A;
          margin: 0 0 14px 0;
        }

        /* Horizontal Divider below Title */
        .title-divider {
          width: 100%;
          height: 1px;
          background-color: #E2E8F0;
          margin-bottom: 20px;
        }

        /* Quick Snippet View */
        .snippet-wrapper {
          position: relative;
          background: #F8FAFC;
          border-left: 4px solid #2563EB;
          border-radius: 0 16px 16px 0;
          padding: 30px 34px;
          margin: 10px 0;
        }

        .quote-symbol {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 72px;
          line-height: 1;
          color: #93C5FD;
          position: absolute;
          top: 12px;
          left: 16px;
          opacity: 0.6;
          user-select: none;
        }

        .snippet-quote {
          position: relative;
          z-index: 1;
          margin: 0;
          font-family: 'Newsreader', Georgia, serif;
          font-size: 22px;
          font-style: italic;
          line-height: 1.65;
          color: #1E293B;
        }

        /* Thread Timeline View */
        .thread-timeline {
          display: flex;
          flex-direction: column;
          margin: 10px 0;
        }

        .thread-item {
          display: flex;
          align-items: stretch;
          gap: 16px;
        }

        .thread-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 28px;
          flex-shrink: 0;
        }

        .node-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #7C3AED;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .node-line {
          width: 2px;
          flex: 1;
          background: #E2E8F0;
          margin: 8px 0;
        }

        .thread-content {
          flex: 1;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 16px;
          font-size: 15px;
          color: #1E293B;
          line-height: 1.65;
        }

        .thread-content p {
          margin: 0;
        }

        /* Comprehensive Document Body */
        .document-body {
          font-size: 15px;
          line-height: 1.8;
          color: #1E293B;
        }

        .document-body h1, .document-body h2, .document-body h3 {
          font-family: 'Newsreader', Georgia, serif;
          color: #0F172A;
          margin-top: 24px;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .document-body h1 { font-size: 26px; }
        .document-body h2 { font-size: 22px; }
        .document-body h3 { font-size: 18px; }

        .document-body p {
          margin-top: 0;
          margin-bottom: 14px;
        }

        .document-body blockquote {
          margin: 18px 0;
          padding: 14px 20px;
          border-left: 3.5px solid #E2E8F0;
          background: #F8FAFC;
          border-radius: 0 10px 10px 0;
          font-style: italic;
          color: #475569;
        }

        .document-body ul, .document-body ol {
          margin: 12px 0 16px 24px;
          padding: 0;
        }

        .document-body li {
          margin-bottom: 8px;
        }

        /* Bottom Footer Page Count */
        .bottom-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-top: 16px;
          font-size: 11.5px;
          color: #64748B;
          font-weight: 500;
          flex-shrink: 0;
        }

        @media print {
          body {
            padding: 12mm 20mm 12mm 20mm;
          }
          .doc-wrapper {
            min-height: calc(100vh - 24mm);
          }
        }
      </style>
    </head>
    <body>
      <div class="doc-wrapper">
        <div class="main-content-flow">
          <!-- Top Bar: Date on Left, Type • Quill on Right -->
          <div class="top-header">
            <div class="top-date">${formattedDate}</div>
            <div class="top-type-quill">${typeLabel} • Quill</div>
          </div>

          <!-- Document Title (for Threads and Documents) -->
          ${
            showTitle
              ? `
            <h1 class="doc-title">${doc.title}</h1>
            <div class="title-divider"></div>
          `
              : ''
          }

          <!-- Main Content -->
          ${contentHtml}
        </div>

        <!-- Bottom Page Number (Calculated Cleanly) -->
        <div class="bottom-footer">
          <span id="page-display">1 / 1</span>
        </div>
      </div>

      <script>
        window.onload = function() {
          try {
            var flowEl = document.querySelector('.main-content-flow');
            var displayEl = document.getElementById('page-display');
            if (flowEl && displayEl) {
              var a4PrintableHeightPx = 1000;
              var total = Math.max(1, Math.ceil(flowEl.scrollHeight / a4PrintableHeightPx));
              displayEl.textContent = '1 / ' + total;
            }
          } catch(e) {}

          setTimeout(function() {
            window.print();
            window.close();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
