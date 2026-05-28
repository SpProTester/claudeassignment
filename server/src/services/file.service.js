import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import { UPLOADS_ROOT } from '../config/paths.js';

// pdf-parse v1 is CJS and reads a test file relative to cwd at import time.
// Importing from the lib entry directly skips that side-effect.
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// ── Magic-byte signatures ─────────────────────────────────────────────────────
//
// Validating the first bytes of the file prevents disguised uploads
// (e.g. a .exe renamed to .pdf).  In production this stub would be
// supplemented by an AV scan (ClamAV, VirusTotal API, etc.).

const MAGIC = {
  pdf:  [0x25, 0x50, 0x44, 0x46],                              // %PDF
  doc:  [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],    // OLE2 Compound Doc
  docx: [0x50, 0x4B, 0x03, 0x04],                              // ZIP (OOXML container)
};

const MIME_TO_TYPE = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

function matchesMagic(buf, sig) {
  return sig.every((byte, i) => buf[i] === byte);
}

function detectMagicType(buf) {
  for (const [type, sig] of Object.entries(MAGIC)) {
    if (matchesMagic(buf, sig)) return type;
  }
  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Virus-check stub: reads the first 8 bytes of the uploaded file and
 * confirms they match the declared MIME type.
 *
 * Returns { valid: true, detectedType } or { valid: false, reason }.
 */
export async function virusScan(filePath, declaredMime) {
  let fd;
  try {
    const header = Buffer.alloc(8);
    fd = await fs.open(filePath, 'r');
    await fd.read(header, 0, 8, 0);

    const detected = detectMagicType(header);

    if (!detected) {
      return {
        valid: false,
        reason: 'File content does not match any allowed format (PDF / DOC / DOCX).',
      };
    }

    const expectedType = MIME_TO_TYPE[declaredMime];
    if (detected !== expectedType) {
      return {
        valid: false,
        reason: `File bytes indicate "${detected}" but MIME type claims "${expectedType}". Upload rejected.`,
      };
    }

    // TODO(production): call AV API here, e.g.:
    //   await clamav.scanFile(filePath);
    //   await virusTotal.scan(filePath);

    return { valid: true, detectedType: detected };
  } finally {
    await fd?.close();
  }
}

/**
 * Extracts plain text from a PDF buffer using pdf-parse.
 * Returns { text, pageCount, extractedAt }.
 */
export async function extractPdfText(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);
  return {
    text: result.text?.trim() ?? '',
    pageCount: result.numpages,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Deletes a file from disk; silently ignores ENOENT (already deleted).
 */
export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

/**
 * Converts a per-user storage path to a public URL path.
 * storagePath is absolute; returns the URL suffix starting at /uploads/.
 */
export function toPublicUrl(storagePath) {
  const rel = path.relative(UPLOADS_ROOT, storagePath).replace(/\\/g, '/');
  return `/uploads/${rel}`;
}
